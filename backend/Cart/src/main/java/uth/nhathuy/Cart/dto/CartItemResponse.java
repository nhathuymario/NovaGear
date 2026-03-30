package uth.nhathuy.Cart.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record CartItemResponse(
        Long id,
        Long productId,
        Long variantId,
        String productName,
        String variantName,
        String thumbnail,
        BigDecimal price,
        Integer quantity,
        BigDecimal lineTotal
) {
}