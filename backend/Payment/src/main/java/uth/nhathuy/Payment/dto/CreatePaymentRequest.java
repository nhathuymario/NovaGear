package uth.nhathuy.Payment.dto;

import uth.nhathuy.Payment.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePaymentRequest {

    @NotNull
    private Long orderId;

    @NotNull
    private PaymentMethod method;

    private String note;
}