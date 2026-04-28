package uth.nhathuy.Inventory.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client để gọi Notification Service từ Inventory Service
 */
@FeignClient(
        name = "notification-service-inventory",
        url = "${notification.service.url:http://localhost:8083}",
        fallback = NotificationClientFallback.class
)
public interface NotificationClient {

    @PostMapping("/api/notifications/realtime/low-stock")
    void notifyLowStock(@RequestBody LowStockAlert alert);

    record LowStockAlert(
            Long productId,
            Integer currentStock,
            Integer threshold
    ) {}
}

