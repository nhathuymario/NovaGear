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
                throw new SecurityException("Không có quyền truy cập payment này");
            }

            if (requestedMethod == PaymentMethod.BANK_TRANSFER
                    && existingPayment.getStatus() == PaymentStatus.PENDING
                    && existingPayment.getMethod() == PaymentMethod.BANK_TRANSFER
                    && existingPayment.getPaymentUrl() != null
                    && !existingPayment.getPaymentUrl().isBlank()) {
                return mapToResponse(existingPayment);
            }

            if (requestedMethod == PaymentMethod.BANK_TRANSFER
                    && existingPayment.getStatus() == PaymentStatus.PENDING
                    && (existingPayment.getMethod() == PaymentMethod.COD
                    || existingPayment.getPaymentUrl() == null
                    || existingPayment.getPaymentUrl().isBlank())) {
                String txRef = "PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
                String checkoutUrl = createPayOSCheckoutUrl(
                        existingPayment.getOrderId(),
                        existingPayment.getAmount(),
                        txRef
                );

                existingPayment.setMethod(PaymentMethod.BANK_TRANSFER);
                existingPayment.setTransactionRef(txRef);
                existingPayment.setPaymentUrl(checkoutUrl);
                existingPayment.setNote(request.getNote());
                existingPayment.setUpdatedAt(LocalDateTime.now());

                Payment upgraded = paymentRepository.save(existingPayment);
                return mapToResponse(upgraded);
            }

            return mapToResponse(existingPayment);
        }

        OrderResponse order = orderClient.getOrderById(request.getOrderId());

        if (order == null) {
            throw new ResourceNotFoundException("Không tìm thấy order");
        }

        if (!order.getUserId().equals(currentUserId)) {
            throw new SecurityException("Bạn không thể thanh toán đơn của người khác");
        }

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("Đơn hàng đã thanh toán");
        }

        String txRef = "PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        PaymentMethod method = requestedMethod;

        // Generate PayOS checkout URL if payment method is BANK_TRANSFER
        String paymentUrl = null;
        if (method == PaymentMethod.BANK_TRANSFER) {
            paymentUrl = createPayOSCheckoutUrl(order.getId(), order.getTotalAmount(), txRef);
        }

        Payment payment = Payment.builder()
                .orderId(order.getId())
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

    private String createPayOSCheckoutUrl(Long orderId, java.math.BigDecimal amount, String txRef) {
        OrderResponse order = orderClient.getOrderById(orderId);
        try {
            PayOSClient.CreateCheckoutResponse checkoutResponse = payOSClient.createCheckout(
                    orderId,
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy payment"));

        if (!payment.getUserId().equals(userId)) {
            throw new SecurityException("Không có quyền truy cập payment này");
        }

        return mapToResponse(payment);
    }

    @Transactional
    public PaymentResponse mockCallback(Long orderId, PaymentStatus status, String note) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy payment"));

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

    private String buildMockPaymentUrl(Long orderId, String txRef) {
        return "http://localhost:8086/api/payments/mock-callback?orderId=" + orderId
                + "&status=SUCCESS"
                + "&note=" + txRef;
    }

    /**
     * PayOS Webhook handler - called from PayOS when payment is confirmed
     */
    @Transactional
    public PaymentResponse handlePayOSWebhook(PayOSClient.WebhookData webhookData) {
        if (webhookData == null || !webhookData.isSuccess()) {
            log.warn("PayOS webhook received with failed status");
            return null;
        }

        Long orderId = webhookData.getOrderCode();
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order " + orderId));

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setNote("PayOS: " + webhookData.getReference());
        payment.setPaidAt(java.time.LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);
        
        // Update order payment status
        orderClient.updatePaymentStatus(orderId, "PAID");
        
        log.info("PayOS webhook processed for order {}, payment {}", orderId, payment.getId());
        return mapToResponse(saved);
    }
}