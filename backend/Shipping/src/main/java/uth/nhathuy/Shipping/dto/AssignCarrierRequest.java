package uth.nhathuy.Shipping.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AssignCarrierRequest(
        @NotBlank String carrierName,
        @NotBlank String trackingNumber,
        String shippingMethod,
        BigDecimal shippingFee,
        LocalDateTime estimatedDeliveryAt,
        String note
) {
}

