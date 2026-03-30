package uth.nhathuy.Order.dto;

import jakarta.validation.constraints.NotNull;
import uth.nhathuy.Order.entity.OrderStatus;

public record UpdateOrderStatusRequest(
        @NotNull OrderStatus status
) {
}