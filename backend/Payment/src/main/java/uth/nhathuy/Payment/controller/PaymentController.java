package uth.nhathuy.Payment.controller;

import uth.nhathuy.Payment.dto.CreatePaymentRequest;
import uth.nhathuy.Payment.dto.PaymentResponse;
import uth.nhathuy.Payment.entity.PaymentStatus;
import uth.nhathuy.Payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        Long userId = Long.parseLong(userIdHeader);
        return paymentService.createPayment(userId, request);
    }

    @GetMapping("/me")
    public List<PaymentResponse> getMyPayments(
            @RequestHeader("X-User-Id") String userIdHeader
    ) {
        Long userId = Long.parseLong(userIdHeader);
        return paymentService.getMyPayments(userId);
    }

    @GetMapping("/order/{orderId}")
    public PaymentResponse getPaymentByOrderId(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable Long orderId
    ) {
        Long userId = Long.parseLong(userIdHeader);
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
}