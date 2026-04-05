package uth.nhathuy.Payment.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import uth.nhathuy.Payment.entity.Payment;
import uth.nhathuy.Payment.entity.PaymentMethod;
import uth.nhathuy.Payment.entity.PaymentStatus;
import uth.nhathuy.Payment.repository.PaymentRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("seed")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PaymentRepository paymentRepository;

    @Override
    public void run(String... args) {
        if (paymentRepository.count() > 0) {
            return;
        }

        Payment payment1 = Payment.builder()
                .orderId(1L)
                .userId(3L)
                .amount(new BigDecimal("27980000"))
                .method(PaymentMethod.BANK_TRANSFER)
                .status(PaymentStatus.SUCCESS)
                .transactionRef("SEED-TXN-0001")
                .paymentUrl(null)
                .note("Seed paid order")
                .paidAt(LocalDateTime.now().minusDays(2))
                .build();

        Payment payment2 = Payment.builder()
                .orderId(2L)
                .userId(3L)
                .amount(new BigDecimal("31990000"))
                .method(PaymentMethod.COD)
                .status(PaymentStatus.PENDING)
                .transactionRef("SEED-TXN-0002")
                .paymentUrl("https://sandbox-pay.example.com/orders/2")
                .note("Seed pending COD")
                .build();

        paymentRepository.saveAll(List.of(payment1, payment2));
    }
}


