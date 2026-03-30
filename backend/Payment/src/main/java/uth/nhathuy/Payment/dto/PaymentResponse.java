package uth.nhathuy.Payment.dto;

import uth.nhathuy.Payment.entity.PaymentMethod;
import uth.nhathuy.Payment.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private String transactionRef;
    private String paymentUrl;
    private String note;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}