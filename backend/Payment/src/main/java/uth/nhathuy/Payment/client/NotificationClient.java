package uth.nhathuy.Payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

/**
 * Feign client để gọi Notification Service từ Payment Service
 */
@FeignClient(
        name = "notification-service-payment",
        url = "${notification.service.url:http://localhost:8083}",
        fallback = NotificationClientFallback.class
)
public interface NotificationClient {

    @PostMapping("/api/notifications/realtime/payment-update")
    void notifyPaymentUpdate(@RequestBody PaymentUpdateNotification notification);

    record PaymentUpdateNotification(
            String eventType,
            Long orderId,
            Long userId,
            String status,
            Map<String, Object> data
    ) {}
}

