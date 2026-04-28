package uth.nhathuy.Payment.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fallback khi Notification Service down
 */
@Component
@Slf4j
public class NotificationClientFallback implements NotificationClient {

    @Override
    public void notifyPaymentUpdate(NotificationClient.PaymentUpdateNotification notification) {
        log.warn("Notification Service unavailable, fallback for payment update: {}", notification.orderId());
        // TODO: Queue event to message broker or DB
    }
}

