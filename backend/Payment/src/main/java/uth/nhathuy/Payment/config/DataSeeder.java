package uth.nhathuy.Payment.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import uth.nhathuy.Payment.entity.Payment;
import uth.nhathuy.Payment.entity.PaymentMethod;
import uth.nhathuy.Payment.entity.PaymentStatus;
import uth.nhathuy.Payment.repository.PaymentRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@Profile("seed")
@Slf4j
@RequiredArgsConstructor
@Transactional
public class DataSeeder implements CommandLineRunner {

    private final PaymentRepository paymentRepository;

    @Override
    public void run(String... args) {
        try {
            log.info("Starting data seeding for Payment service...");
            upsertPayment(
                    1L,
                3L,
                "27980000",
                PaymentMethod.BANK_TRANSFER,
                PaymentStatus.SUCCESS,
                "SEED-TXN-0001",
                null,
                "Seed paid order",
                LocalDateTime.now().minusDays(2)
        );

        upsertPayment(
                2L,
                3L,
                "31990000",
                PaymentMethod.COD,
                PaymentStatus.PENDING,
                "SEED-TXN-0002",
                "https://sandbox-pay.example.com/orders/2",
                "Seed pending COD",
                null
        );
        } catch (Exception e) {
            log.error("Error during data seeding for Payment service: ", e);
        }
        log.info("Data seeding completed successfully for Payment service!");
    }

    private void upsertPayment(
            Long orderId,
            Long userId,
            String amount,
            PaymentMethod method,
            PaymentStatus status,
            String transactionRef,
            String paymentUrl,
            String note,
            LocalDateTime paidAt
    ) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(Payment::new);

        payment.setOrderId(orderId);
        payment.setUserId(userId);
        payment.setAmount(new BigDecimal(amount));
        payment.setMethod(method);
        payment.setStatus(status);
        payment.setTransactionRef(transactionRef);
        payment.setPaymentUrl(paymentUrl);
        payment.setNote(note);
        payment.setPaidAt(paidAt);

        paymentRepository.save(payment);
    }
}


