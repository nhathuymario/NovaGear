package uth.nhathuy.Order.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fallback implementation khi Notification Service down
 * Events sẽ được queue và retry sau
 */
@Component
@Slf4j
public class NotificationClientFallback implements NotificationClient {

    @Override
    public void notifyOrderUpdate(NotificationClient.OrderUpdateNotification notification) {
        log.warn("Notification Service unavailable, falling back for order update: {}", notification.orderId());
        // TODO: Queue event to DB hoặc message broker (Redis/Kafka)
        // Có thể retry sau khi service khôi phục
    }

    @Override
    public void notifyPaymentUpdate(NotificationClient.PaymentUpdateNotification notification) {
        log.warn("Notification Service unavailable, falling back for payment update: {}", notification.orderId());
        // TODO: Queue event
    }
}

