package uth.nhathuy.Shipping.dto;

import jakarta.validation.constraints.NotNull;
import uth.nhathuy.Shipping.entity.ShipmentStatus;

public record UpdateShipmentStatusRequest(
        @NotNull ShipmentStatus status,
        String note
) {
}

