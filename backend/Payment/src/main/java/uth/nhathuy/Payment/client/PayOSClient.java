package uth.nhathuy.Payment.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * PayOS Sandbox Integration
 * PayOS cung cấp gateway thanh toán đơn giản cho Việt Nam
 * Sandbox: https://sandbox-api.payos.vn
 */
@Component
@Slf4j
public class PayOSClient {

    @Value("${payos.api-key:SANDBOX_API_KEY}")
    private String apiKey;

    @Value("${payos.client-id:SANDBOX_CLIENT_ID}")
    private String clientId;

    @Value("${payos.api-url:https://sandbox-api.payos.vn}")
    private String apiUrl;

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
    public CreateCheckoutResponse createCheckout(Long orderId, Long amount, String orderCode) {
        try {
            long safeOrderCode = orderId != null ? orderId : System.currentTimeMillis();
            CreateCheckoutRequest request = CreateCheckoutRequest.builder()
                    .orderCode(safeOrderCode)
                    .amount(amount)
                    .description("Thanh toán đơn hàng " + orderCode)
                    .buyerName("Customer")
                    .buyerEmail("customer@example.com")
                    .buyerPhone("0000000000")
                    .buyerAddress("Vietnam")
                    .returnUrl(returnUrl + "?orderId=" + orderId + "&status=success")
                    .cancelUrl(cancelUrl)
                    .build();

            log.info("Creating PayOS checkout for order {}: {} VND", orderId, amount);

            // Mock response cho sandbox (real integration sẽ gọi API PayOS)
            return CreateCheckoutResponse.builder()
                    .code("00")
                    .desc("success")
                    .data(CheckoutData.builder()
                            .checkoutUrl("https://sandbox.payos.vn/checkout/" + generateMockToken())
                            .qrCode("https://qr.payos.vn/" + generateMockToken())
                            .build())
                    .build();

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

    private String generateMockToken() {
        return "mock_token_" + System.currentTimeMillis();
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

        @JsonProperty("signature")
        private String signature;
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

