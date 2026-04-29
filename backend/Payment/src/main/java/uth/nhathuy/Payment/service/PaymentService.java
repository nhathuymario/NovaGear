package uth.nhathuy.Payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uth.nhathuy.Payment.client.OrderClient;
import uth.nhathuy.Payment.client.PayOSClient;
import uth.nhathuy.Payment.dto.CreatePaymentRequest;
import uth.nhathuy.Payment.dto.OrderResponse;
import uth.nhathuy.Payment.dto.PaymentResponse;
import uth.nhathuy.Payment.entity.Payment;
import uth.nhathuy.Payment.entity.PaymentMethod;
import uth.nhathuy.Payment.entity.PaymentStatus;
import uth.nhathuy.Payment.exception.PaymentGatewayException;
import uth.nhathuy.Payment.exception.ResourceNotFoundException;
import uth.nhathuy.Payment.repository.PaymentRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;
    private final PayOSClient payOSClient;

    @Transactional
    public PaymentResponse createPayment(Long currentUserId, CreatePaymentRequest request) {
        PaymentMethod requestedMethod = parsePaymentMethod(request.getMethod());

        Payment existingPayment = paymentRepository.findByOrderId(request.getOrderId()).orElse(null);
        if (existingPayment != null) {
            if (!existingPayment.getUserId().equals(currentUserId)) {
                throw new SecurityException("Khong co quyen truy cap payment nay");
            }

            if (requestedMethod == PaymentMethod.COD
                    && existingPayment.getStatus() != PaymentStatus.SUCCESS
                    && existingPayment.getStatus() != PaymentStatus.REFUNDED) {
                existingPayment.setMethod(PaymentMethod.COD);
                existingPayment.setStatus(PaymentStatus.PENDING);
                existingPayment.setProviderOrderCode(null);
                existingPayment.setTransactionRef(null);
                existingPayment.setPaymentUrl(null);
                existingPayment.setPaidAt(null);
                existingPayment.setNote(request.getNote());
                existingPayment.setUpdatedAt(LocalDateTime.now());

                Payment codPayment = paymentRepository.save(existingPayment);
                return mapToResponse(codPayment);
            }

            if (requestedMethod == PaymentMethod.BANK_TRANSFER
                    && existingPayment.getStatus() != PaymentStatus.SUCCESS
                    && existingPayment.getStatus() != PaymentStatus.REFUNDED) {
                Payment refreshed = refreshOnlineCheckout(existingPayment, request.getNote());
                return mapToResponse(refreshed);
            }

            return mapToResponse(existingPayment);
        }

        OrderResponse order = orderClient.getOrderById(request.getOrderId());

        if (order == null) {
            throw new ResourceNotFoundException("Khong tim thay order");
        }

        if (!order.getUserId().equals(currentUserId)) {
            throw new SecurityException("Ban khong the thanh toan don cua nguoi khac");
        }

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("Don hang da thanh toan");
        }

        String txRef = "PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        PaymentMethod method = requestedMethod;
        Long providerOrderCode = method == PaymentMethod.BANK_TRANSFER ? generateProviderOrderCode() : null;

        String paymentUrl = null;
        if (method == PaymentMethod.BANK_TRANSFER) {
            paymentUrl = createPayOSCheckoutUrl(order.getId(), providerOrderCode, order.getTotalAmount(), txRef);
        }

        Payment payment = Payment.builder()
                .orderId(order.getId())
                .providerOrderCode(providerOrderCode)
                .userId(order.getUserId())
                .amount(order.getTotalAmount())
                .method(method)
                .status(PaymentStatus.PENDING)
                .transactionRef(txRef)
                .paymentUrl(paymentUrl)
                .note(request.getNote())
                .build();

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
    }

    private PaymentMethod parsePaymentMethod(String methodRaw) {
        try {
            String rawMethod = methodRaw == null ? "COD" : methodRaw.trim().toUpperCase();
            if ("ONLINE".equals(rawMethod)) {
                rawMethod = "BANK_TRANSFER";
            }
            return PaymentMethod.valueOf(rawMethod);
        } catch (IllegalArgumentException e) {
            return PaymentMethod.COD;
        }
    }

    private Payment refreshOnlineCheckout(Payment payment, String note) {
        String txRef = "PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        Long providerOrderCode = generateProviderOrderCode();
        String checkoutUrl = createPayOSCheckoutUrl(
                payment.getOrderId(),
                providerOrderCode,
                payment.getAmount(),
                txRef
        );

        payment.setMethod(PaymentMethod.BANK_TRANSFER);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProviderOrderCode(providerOrderCode);
        payment.setTransactionRef(txRef);
        payment.setPaymentUrl(checkoutUrl);
        payment.setPaidAt(null);
        payment.setNote(note);
        payment.setUpdatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    private Long generateProviderOrderCode() {
        long now = System.currentTimeMillis();
        long randomSuffix = Math.abs(UUID.randomUUID().hashCode()) % 1000;
        return now * 1000 + randomSuffix;
    }

    private String createPayOSCheckoutUrl(Long orderId, Long providerOrderCode, java.math.BigDecimal amount, String txRef) {
        OrderResponse order = orderClient.getOrderById(orderId);
        try {
            PayOSClient.CreateCheckoutResponse checkoutResponse = payOSClient.createCheckout(
                    orderId,
                    providerOrderCode,
                    amount.longValue(),
                    orderId + "_" + txRef,
                    order != null ? order.getReceiverName() : null,
                    order != null ? order.getReceiverPhone() : null,
                    null,
                    order != null ? order.getAddress() : null
            );
            if (checkoutResponse.isSuccess()
                    && checkoutResponse.getData() != null
                    && checkoutResponse.getData().getCheckoutUrl() != null
                    && !checkoutResponse.getData().getCheckoutUrl().isBlank()) {
                return checkoutResponse.getData().getCheckoutUrl();
            }
            throw new PaymentGatewayException("Khong tao duoc link thanh toan online");
        } catch (Exception e) {
            log.warn("Failed to create PayOS checkout for order {}: {}", orderId, e.getMessage());
            throw new PaymentGatewayException("Khong tao duoc link thanh toan online. Vui long thu lai.");
        }
    }

    public List<PaymentResponse> getMyPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PaymentResponse getMyPaymentByOrderId(Long userId, Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay payment"));

        if (!payment.getUserId().equals(userId)) {
            throw new SecurityException("Khong co quyen truy cap payment nay");
        }

        return mapToResponse(payment);
    }

    @Transactional
    public PaymentResponse mockCallback(Long orderId, PaymentStatus status, String note) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay payment"));

        payment.setStatus(status);
        payment.setNote(note);

        if (status == PaymentStatus.SUCCESS) {
            payment.setPaidAt(LocalDateTime.now());
            orderClient.updatePaymentStatus(orderId, "PAID");
        } else if (status == PaymentStatus.FAILED) {
            orderClient.updatePaymentStatus(orderId, "UNPAID");
        } else if (status == PaymentStatus.REFUNDED) {
            orderClient.updatePaymentStatus(orderId, "REFUNDED");
        }

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .providerOrderCode(payment.getProviderOrderCode())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .transactionRef(payment.getTransactionRef())
                .paymentUrl(payment.getPaymentUrl())
                .note(payment.getNote())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    @Transactional
    public PaymentResponse handlePayOSWebhook(PayOSClient.WebhookData webhookData) {
        if (webhookData == null || !webhookData.isSuccess()) {
            log.warn("PayOS webhook received with failed status");
            return null;
        }

        Long providerOrderCode = webhookData.getOrderCode();
        Payment payment = paymentRepository.findByProviderOrderCode(providerOrderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for provider order code " + providerOrderCode));
        Long orderId = payment.getOrderId();

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setNote("PayOS: " + webhookData.getReference());
        payment.setPaidAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        orderClient.updatePaymentStatus(orderId, "PAID");

        log.info("PayOS webhook processed for order {}, payment {}", orderId, payment.getId());
        return mapToResponse(saved);
    }
}
