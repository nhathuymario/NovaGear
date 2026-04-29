package uth.nhathuy.Order.controller;

import uth.nhathuy.Order.entity.Order;
import uth.nhathuy.Order.repository.OrderRepository;
import uth.nhathuy.Order.exception.ResourceNotFoundException;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/internal/orders")
@RequiredArgsConstructor
public class InternalOrderController {

    private final OrderRepository orderRepository;

    @GetMapping("/{orderId}")
    public OrderInfoResponse getOrder(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return OrderInfoResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .paymentStatus(normalizePaymentStatus(order.getPaymentStatus()))
                .build();
    }

    @PutMapping("/{orderId}/payment-status")
    public void updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestParam String status
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setPaymentStatus(status);
        orderRepository.save(order);
    }

    private String normalizePaymentStatus(String paymentStatus) {
        if (paymentStatus == null || paymentStatus.isBlank()) {
            return "UNPAID";
        }
        return paymentStatus.trim().toUpperCase();
    }

    @Data
    @Builder
    static class OrderInfoResponse {
        private Long id;
        private Long userId;
        private BigDecimal totalAmount;
        private String status;
        private String paymentStatus;
    }
}
