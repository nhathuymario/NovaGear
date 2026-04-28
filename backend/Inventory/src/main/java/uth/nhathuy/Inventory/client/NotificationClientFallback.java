package uth.nhathuy.Inventory.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fallback khi Notification Service down
 */
@Component
@Slf4j
public class NotificationClientFallback implements NotificationClient {

    @Override
    public void notifyLowStock(NotificationClient.LowStockAlert alert) {
        log.warn("Notification Service unavailable, fallback for low-stock alert: {}", alert.productId());
        // TODO: Queue event
    }
}

