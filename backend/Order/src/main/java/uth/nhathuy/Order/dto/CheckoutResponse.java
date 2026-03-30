package uth.nhathuy.Order.dto;

import lombok.Builder;

@Builder
public record CheckoutResponse(
        Long orderId,
        String message
) {
}