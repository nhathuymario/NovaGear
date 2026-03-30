package uth.nhathuy.Cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AddCartItemRequest(
        @NotNull Long productId,
        Long variantId,
        @NotBlank String productName,
        String variantName,
        String thumbnail,
        @NotNull BigDecimal price,
        @NotNull @Min(1) Integer quantity
) {
}