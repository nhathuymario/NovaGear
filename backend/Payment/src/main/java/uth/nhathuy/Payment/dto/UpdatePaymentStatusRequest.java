package uth.nhathuy.Payment.dto;

import uth.nhathuy.Payment.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdatePaymentStatusRequest {

    @NotNull
    private PaymentStatus status;

    private String note;
}