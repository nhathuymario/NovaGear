package uth.nhathuy.Order.dto;

import uth.nhathuy.Order.entity.OrderStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record OrderResponse(
        Long id,
        Long userId,
        String username,
        String customerName,
        String phone,
        String address,
        String note,
        OrderStatus status,
        String paymentStatus,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
}