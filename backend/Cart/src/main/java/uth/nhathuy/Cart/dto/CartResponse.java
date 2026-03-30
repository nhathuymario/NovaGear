package uth.nhathuy.Cart.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record CartResponse(
        Long cartId,
        Long userId,
        Integer totalItems,
        BigDecimal totalAmount,
        List<CartItemResponse> items
) {
}