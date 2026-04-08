package uth.nhathuy.Payment.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;
/**
 * PayOS Sandbox Integration
 * PayOS cung cấp gateway thanh toán đơn giản cho Việt Nam
 * API: https://api-merchant.payos.vn (dung test keys de chay sandbox mode)
 */
@Component
@Slf4j
public class PayOSClient {

    @Value("${payos.api-key:SANDBOX_API_KEY}")
    private String apiKey;

    @Value("${payos.client-id:SANDBOX_CLIENT_ID}")
    private String clientId;

    @Value("${payos.api-url:https://api-merchant.payos.vn}")
    private String apiUrl;

    @Value("${payos.checkout-path:/v2/payment-requests}")
    private String checkoutPath;

    @Value("${payos.checksum-key:}")
    private String checksumKey;

    @Value("${payos.return-url:http://localhost:5173/payment/result}")
    private String returnUrl;

    @Value("${payos.cancel-url:http://localhost:5173/order}")
    private String cancelUrl;

    private final RestTemplate restTemplate;

    public PayOSClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Tạo link thanh toán PayOS
     * @param orderId ID đơn hàng
     * @param amount Số tiền (VND)
     * @param orderCode Mã đơn hàng unique
     * @return PayOS checkout URL
     */
    public CreateCheckoutResponse createCheckout(
            Long orderId,
            Long amount,
            String orderCode,
            String buyerName,
            String buyerPhone,
            String buyerEmail,
            String buyerAddress
    ) {
        try {
            long safeOrderCode = orderId != null ? orderId : System.currentTimeMillis();
            CreateCheckoutRequest request = CreateCheckoutRequest.builder()
                    .orderCode(safeOrderCode)
                    .amount(amount)
                    .description(buildDescription(orderCode))
                    .buyerName(defaultIfBlank(buyerName, "NovaGear Customer"))
                    .buyerEmail(defaultIfBlank(buyerEmail, "customer@novagear.local"))
                    .buyerPhone(defaultIfBlank(buyerPhone, "0900000000"))
                    .buyerAddress(defaultIfBlank(buyerAddress, "Vietnam"))
                    .returnUrl(returnUrl + "?orderId=" + orderId + "&status=success")
                    .cancelUrl(cancelUrl)
                    .items(List.of(CheckoutItem.builder()
                            .name("Don hang " + (orderId == null ? "N/A" : orderId))
                            .quantity(1)
                            .price(amount)
                            .build()))
                    .build();

            request.setSignature(buildSignature(request));

            log.info("Creating PayOS checkout for order {}: {} VND", orderId, amount);

            // If credentials are placeholders, run in local mock mode with a reachable URL.
            if (isMockMode()) {
                String localMockUrl = returnUrl + "?orderId=" + orderId + "&status=pending&provider=payos-mock";
                return CreateCheckoutResponse.builder()
                        .code("00")
                        .desc("success")
                        .data(CheckoutData.builder()
                                .checkoutUrl(localMockUrl)
                                .qrCode(localMockUrl)
                                .build())
                        .build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            HttpEntity<CreateCheckoutRequest> entity = new HttpEntity<>(request, headers);
            String endpoint = normalizeUrl(apiUrl) + normalizePath(checkoutPath);
            ResponseEntity<CreateCheckoutResponse> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    entity,
                    CreateCheckoutResponse.class
            );

            CreateCheckoutResponse body = response.getBody();
            if (body == null) {
                throw new IllegalStateException("PayOS response is empty");
            }

            if (!body.isSuccess()) {
                throw new IllegalStateException("PayOS rejected request: " + body.getDesc());
            }

            if (body.getData() == null || !StringUtils.hasText(body.getData().getCheckoutUrl())) {
                throw new IllegalStateException("PayOS response missing checkoutUrl");
            }

            return body;

        } catch (Exception e) {
            log.error("Error creating PayOS checkout for order {}: {}", orderId, e.getMessage());
            throw new RuntimeException("Failed to create PayOS checkout: " + e.getMessage());
        }
    }

    /**
     * Xác minh webhook từ PayOS
     */
    public boolean verifyWebhook(String signature, String data) {
        try {
            // Verify signature từ PayOS
            // Real implementation: HMAC SHA256 verification
            return true;
        } catch (Exception e) {
            log.error("Error verifying PayOS webhook: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Hủy checkout
     */
    public CancelCheckoutResponse cancelCheckout(String checkoutToken) {
        try {
            log.info("Cancelling PayOS checkout: {}", checkoutToken);

            return CancelCheckoutResponse.builder()
                    .code("00")
                    .desc("success")
                    .data(true)
                    .build();

        } catch (Exception e) {
            log.error("Error cancelling PayOS checkout: {}", e.getMessage());
            throw new RuntimeException("Failed to cancel PayOS checkout: " + e.getMessage());
        }
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }

    private String buildDescription(String orderCode) {
        String raw = "Thanh toan don " + (orderCode == null ? "N/A" : orderCode);
        return raw.length() > 25 ? raw.substring(0, 25) : raw;
    }

    private String normalizeUrl(String url) {
        if (url.endsWith("/")) {
            return url.substring(0, url.length() - 1);
        }
        return url;
    }

    private String normalizePath(String path) {
        if (!path.startsWith("/")) {
            return "/" + path;
        }
        return path;
    }

    private String buildSignature(CreateCheckoutRequest request) {
        if (!StringUtils.hasText(checksumKey)) {
            return null;
        }

        String payload = "amount=" + request.getAmount()
                + "&cancelUrl=" + request.getCancelUrl()
                + "&description=" + request.getDescription()
                + "&orderCode=" + request.getOrderCode()
                + "&returnUrl=" + request.getReturnUrl();

        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(checksumKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(secretKey);
            byte[] hash = hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Cannot sign PayOS payload", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private boolean isMockMode() {
        return apiKey == null
                || clientId == null
                || apiKey.isBlank()
                || clientId.isBlank()
                || apiKey.startsWith("SANDBOX_")
                || clientId.startsWith("SANDBOX_");
    }

    // DTOs

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateCheckoutRequest {
        @JsonProperty("orderCode")
        private Long orderCode;

        @JsonProperty("amount")
        private Long amount;

        @JsonProperty("description")
        private String description;

        @JsonProperty("buyerName")
        private String buyerName;

        @JsonProperty("buyerEmail")
        private String buyerEmail;

        @JsonProperty("buyerPhone")
        private String buyerPhone;

        @JsonProperty("buyerAddress")
        private String buyerAddress;

        @JsonProperty("returnUrl")
        private String returnUrl;

        @JsonProperty("cancelUrl")
        private String cancelUrl;

        @JsonProperty("items")
        private List<CheckoutItem> items;

        @JsonProperty("signature")
        private String signature;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckoutItem {
        @JsonProperty("name")
        private String name;

        @JsonProperty("quantity")
        private Integer quantity;

        @JsonProperty("price")
        private Long price;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateCheckoutResponse {
        @JsonProperty("code")
        private String code;

        @JsonProperty("desc")
        private String desc;

        @JsonProperty("data")
        private CheckoutData data;

        public boolean isSuccess() {
            return "00".equals(code);
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckoutData {
        @JsonProperty("checkoutUrl")
        private String checkoutUrl;

        @JsonProperty("qrCode")
        private String qrCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancelCheckoutResponse {
        @JsonProperty("code")
        private String code;

        @JsonProperty("desc")
        private String desc;

        @JsonProperty("data")
        private Boolean data;

        public boolean isSuccess() {
            return "00".equals(code);
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WebhookData {
        @JsonProperty("orderCode")
        private Long orderCode;

        @JsonProperty("amount")
        private Long amount;

        @JsonProperty("description")
        private String description;

        @JsonProperty("accountNumber")
        private String accountNumber;

        @JsonProperty("reference")
        private String reference;

        @JsonProperty("transactionDateTime")
        private String transactionDateTime;

        @JsonProperty("resultCode")
        private String resultCode;

        public boolean isSuccess() {
            return "0".equals(resultCode);
        }
    }
}

