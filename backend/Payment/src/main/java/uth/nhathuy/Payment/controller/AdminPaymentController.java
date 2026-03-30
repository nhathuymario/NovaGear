package uth.nhathuy.Payment.controller;

import uth.nhathuy.Payment.dto.PaymentResponse;
import uth.nhathuy.Payment.entity.PaymentStatus;
import uth.nhathuy.Payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public List<PaymentResponse> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @PutMapping("/{orderId}/success")
    public PaymentResponse markSuccess(@PathVariable Long orderId) {
        return paymentService.mockCallback(orderId, PaymentStatus.SUCCESS, "Marked success by admin");
    }

    @PutMapping("/{orderId}/failed")
    public PaymentResponse markFailed(@PathVariable Long orderId) {
        return paymentService.mockCallback(orderId, PaymentStatus.FAILED, "Marked failed by admin");
    }

    @PutMapping("/{orderId}/refund")
    public PaymentResponse refund(@PathVariable Long orderId) {
        return paymentService.mockCallback(orderId, PaymentStatus.REFUNDED, "Refunded by admin");
    }
}