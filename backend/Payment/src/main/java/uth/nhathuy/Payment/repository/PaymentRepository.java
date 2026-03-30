package uth.nhathuy.Payment.repository;

import uth.nhathuy.Payment.entity.Payment;
import uth.nhathuy.Payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    List<Payment> findByUserIdOrderByIdDesc(Long userId);
    List<Payment> findByStatusOrderByIdDesc(PaymentStatus status);
}