package uth.nhathuy.Notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import uth.nhathuy.Notification.model.RealtimeEvent;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Service để emit realtime events qua WebSocket
 * Called by Order, Payment, Inventory services
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class RealtimeNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Emit realtime event cho order updates
     */
    public void notifyOrderUpdate(String eventType, Long orderId, Long userId, Map<String, Object> data) {
        RealtimeEvent event = new RealtimeEvent(
                eventType,
                "ORDER",
                String.valueOf(orderId),
                userId,
                Instant.now(),
                UUID.randomUUID().toString(),
                data
        );

        // Broadcast to admin
        messagingTemplate.convertAndSend("/topic/admin/orders", event);

        // Send to specific user
        if (userId != null) {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/orders",
                    event
            );
        }

        log.info("Order event {} sent to user {}", eventType, userId);
    }

    /**
     * Emit realtime event cho payment updates
     */
    public void notifyPaymentUpdate(String eventType, Long orderId, Long userId, Map<String, Object> data) {
        RealtimeEvent event = new RealtimeEvent(
                eventType,
                "PAYMENT",
                String.valueOf(orderId),
                userId,
                Instant.now(),
                UUID.randomUUID().toString(),
                data
        );

        messagingTemplate.convertAndSend("/topic/admin/orders", event);

        if (userId != null) {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/payments",
                    event
            );
        }

        log.info("Payment event {} sent to user {}", eventType, userId);
    }

    /**
     * Emit low stock alerts
     */
    public void notifyLowStock(Long productId, Integer currentStock, Integer threshold) {
        RealtimeEvent event = new RealtimeEvent(
                "INVENTORY_LOW_STOCK",
                "INVENTORY",
                String.valueOf(productId),
                null,
                Instant.now(),
                UUID.randomUUID().toString(),
                Map.of(
                        "productId", productId,
                        "currentStock", currentStock,
                        "threshold", threshold
                )
        );

        messagingTemplate.convertAndSend("/topic/admin/inventory/low-stock", event);
        log.warn("Low stock alert for product {}: {} remaining", productId, currentStock);
    }

    /**
     * Broadcast system-wide event (e.g., maintenance, announcements)
     */
    public void broadcastSystemEvent(String message, String severity) {
        RealtimeEvent event = new RealtimeEvent(
                "SYSTEM_ALERT",
                "SYSTEM",
                "SYSTEM",
                null,
                Instant.now(),
                UUID.randomUUID().toString(),
                Map.of("message", message, "severity", severity)
        );

        messagingTemplate.convertAndSend("/topic/system/events", event);
        log.info("System event broadcast: {}", message);
    }
}

