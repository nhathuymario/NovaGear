package uth.nhathuy.Order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

/**
 * Feign client để gọi Notification Service
 * Emit realtime events qua WebSocket
 */
@FeignClient(
        name = "notification-service",
        url = "${notification.service.url:http://localhost:8083}",
        fallback = NotificationClientFallback.class
)
public interface NotificationClient {

    @PostMapping("/api/notifications/realtime/order-update")
    void notifyOrderUpdate(@RequestBody OrderUpdateNotification notification);

    @PostMapping("/api/notifications/realtime/payment-update")
    void notifyPaymentUpdate(@RequestBody PaymentUpdateNotification notification);

    // ===== DTOs =====
    record OrderUpdateNotification(
            String eventType,
            Long orderId,
            Long userId,
            Map<String, Object> data
    ) {}

    record PaymentUpdateNotification(
            String eventType,
            Long orderId,
            Long userId,
            String status,
            Map<String, Object> data
    ) {}
}

