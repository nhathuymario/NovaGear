package uth.nhathuy.Order.dto;

import jakarta.validation.constraints.NotBlank;

public record CheckoutRequest(
        @NotBlank String customerName,
        @NotBlank String phone,
        @NotBlank String address,
        String note
) {
}