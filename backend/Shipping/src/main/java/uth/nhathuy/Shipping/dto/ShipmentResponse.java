package uth.nhathuy.Shipping.dto;

import uth.nhathuy.Shipping.entity.ShipmentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ShipmentResponse(
        Long id,
        Long orderId,
        Long userId,
        String orderCode,
        String receiverName,
        String receiverPhone,
        String shippingAddress,
        String note,
        String carrierName,
        String trackingNumber,
        String shippingMethod,
        BigDecimal shippingFee,
        LocalDateTime estimatedDeliveryAt,
        ShipmentStatus status,
        String statusNote,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime shippedAt,
        LocalDateTime deliveredAt,
        List<ShipmentTrackingEventResponse> events
) {
    public record ShipmentTrackingEventResponse(
            Long id,
            ShipmentStatus fromStatus,
            ShipmentStatus toStatus,
            String note,
            String changedBy,
            LocalDateTime createdAt
    ) {
    }
}

