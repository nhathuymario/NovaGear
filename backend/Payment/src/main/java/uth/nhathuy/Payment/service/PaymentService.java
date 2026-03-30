package uth.nhathuy.Payment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uth.nhathuy.Payment.client.OrderClient;
import uth.nhathuy.Payment.dto.CreatePaymentRequest;
import uth.nhathuy.Payment.dto.OrderResponse;
import uth.nhathuy.Payment.dto.PaymentResponse;
import uth.nhathuy.Payment.entity.Payment;
import uth.nhathuy.Payment.entity.PaymentStatus;
import uth.nhathuy.Payment.exception.ResourceNotFoundException;
import uth.nhathuy.Payment.repository.PaymentRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;

    @Transactional
    public PaymentResponse createPayment(Long currentUserId, CreatePaymentRequest request) {
        paymentRepository.findByOrderId(request.getOrderId())
                .ifPresent(payment -> {
                    throw new RuntimeException("Đơn hàng này đã có payment");
                });

        OrderResponse order = orderClient.getOrderById(request.getOrderId());

        if (order == null) {
            throw new ResourceNotFoundException("Không tìm thấy order");
        }

        if (!order.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không thể thanh toán đơn của người khác");
        }

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new RuntimeException("Đơn hàng đã thanh toán");
        }

        String txRef = "PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        Payment payment = Payment.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .amount(order.getTotalAmount())
                .method(request.getMethod())
                .status(PaymentStatus.PENDING)
                .transactionRef(txRef)
                .paymentUrl(buildMockPaymentUrl(order.getId(), txRef))
                .note(request.getNote())
                .build();

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
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
            throw new RuntimeException("Không có quyền truy cập payment này");
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
}