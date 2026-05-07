package uth.nhathuy.Shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import uth.nhathuy.Shipping.entity.ShipmentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateShipmentRequest(
        @NotNull Long orderId,
        @NotNull Long userId,
        @NotBlank String orderCode,
        @NotBlank String receiverName,
        @NotBlank String receiverPhone,
        @NotBlank String shippingAddress,
        String note,
        String carrierName,
        String trackingNumber,
        String shippingMethod,
        BigDecimal shippingFee,
        LocalDateTime estimatedDeliveryAt,
        ShipmentStatus status
) {
}

