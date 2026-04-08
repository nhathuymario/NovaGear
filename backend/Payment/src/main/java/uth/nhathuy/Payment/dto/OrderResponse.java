package uth.nhathuy.Payment.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderResponse {
    private Long id;
    private Long userId;
    private BigDecimal totalAmount;
    private String status;
    private String paymentStatus;
    private String orderCode;
    private String customerName;
    private String receiverName;
    private String receiverPhone;
    private String address;
}