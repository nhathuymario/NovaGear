//Gọi cartItemDto

package uth.nhathuy.Order.dto;

import java.math.BigDecimal;

public record CartItemDto(
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