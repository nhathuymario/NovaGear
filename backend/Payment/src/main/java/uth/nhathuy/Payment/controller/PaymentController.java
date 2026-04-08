package uth.nhathuy.Payment.controller;

import uth.nhathuy.Payment.service.PaymentService;
import uth.nhathuy.Payment.dto.CreatePaymentRequest;
import uth.nhathuy.Payment.dto.PaymentResponse;
import uth.nhathuy.Payment.entity.PaymentStatus;
import uth.nhathuy.Payment.client.PayOSClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public PaymentResponse createPayment(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody CreatePaymentRequest request
    ) {
        Long userId = parseUserId(userIdHeader);
        return paymentService.createPayment(userId, request);
    }

    @GetMapping("/me")
    public List<PaymentResponse> getMyPayments(
            @RequestHeader("X-User-Id") String userIdHeader
    ) {
        Long userId = parseUserId(userIdHeader);
        return paymentService.getMyPayments(userId);
    }

    @GetMapping("/order/{orderId}")
    public PaymentResponse getPaymentByOrderId(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable Long orderId
    ) {
        Long userId = parseUserId(userIdHeader);
        return paymentService.getMyPaymentByOrderId(userId, orderId);
    }

    @GetMapping("/mock-callback")
    public PaymentResponse mockCallback(
            @RequestParam Long orderId,
            @RequestParam PaymentStatus status,
            @RequestParam(required = false) String note
    ) {
        return paymentService.mockCallback(orderId, status, note);
    }

    /**
     * PayOS Webhook Callback
     * Called by PayOS when payment is completed
     */
    @PostMapping("/webhook/payos")
    public ResponseEntity<Map<String, Object>> payosWebhook(
            @RequestBody PayOSClient.WebhookData webhookData,
            @RequestHeader(value = "X-Signature", required = false) String signature
    ) {
        try {
            PaymentResponse response = paymentService.handlePayOSWebhook(webhookData);
            return ResponseEntity.ok(Map.of(
                    "code", "00",
                    "desc", "Webhook received",
                    "data", response != null ? response.getId() : null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "code", "01",
                    "desc", "Webhook processing failed: " + e.getMessage()
            ));
        }
    }

    private Long parseUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new IllegalArgumentException("Thiếu header X-User-Id");
        }
        try {
            return Long.parseLong(userIdHeader);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("X-User-Id không hợp lệ: " + userIdHeader);
        }
    }
}
