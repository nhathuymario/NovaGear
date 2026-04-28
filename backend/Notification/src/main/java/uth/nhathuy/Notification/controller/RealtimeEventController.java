package uth.nhathuy.Notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uth.nhathuy.Notification.service.RealtimeNotificationService;

import java.util.Map;

/**
 * REST endpoints để receive events từ Order, Payment, Inventory services
 * Services sẽ POST tới đây, và ta emit qua WebSocket
 */
@RestController
@RequestMapping("/api/notifications/realtime")
@RequiredArgsConstructor
public class RealtimeEventController {

    private final RealtimeNotificationService notificationService;

    /**
     * Called by Order Service
     * POST /api/notifications/realtime/order-update
     */
    @PostMapping("/order-update")
    public ResponseEntity<Void> notifyOrderUpdate(@RequestBody OrderUpdateRequest request) {
        notificationService.notifyOrderUpdate(
                request.eventType,
                request.orderId,
                request.userId,
                request.data
        );
        return ResponseEntity.accepted().build();
    }

    /**
     * Called by Payment Service
     * POST /api/notifications/realtime/payment-update
     */
    @PostMapping("/payment-update")
    public ResponseEntity<Void> notifyPaymentUpdate(@RequestBody PaymentUpdateRequest request) {
        notificationService.notifyPaymentUpdate(
                request.eventType,
                request.orderId,
                request.userId,
                request.data
        );
        return ResponseEntity.accepted().build();
    }

    /**
     * Called by Inventory Service
     * POST /api/notifications/realtime/low-stock
     */
    @PostMapping("/low-stock")
    public ResponseEntity<Void> notifyLowStock(@RequestBody LowStockRequest request) {
        notificationService.notifyLowStock(request.productId, request.currentStock, request.threshold);
        return ResponseEntity.accepted().build();
    }

    /**
     * Broadcast system-wide event
     */
    @PostMapping("/system-alert")
    public ResponseEntity<Void> broadcastSystemAlert(@RequestBody SystemAlertRequest request) {
        notificationService.broadcastSystemEvent(request.message, request.severity);
        return ResponseEntity.accepted().build();
    }

    // ===== DTOs =====
    public record OrderUpdateRequest(
            String eventType,
            Long orderId,
            Long userId,
            Map<String, Object> data
    ) {}

    public record PaymentUpdateRequest(
            String eventType,
            Long orderId,
            Long userId,
            Map<String, Object> data
    ) {}

    public record LowStockRequest(
            Long productId,
            Integer currentStock,
            Integer threshold
    ) {}

    public record SystemAlertRequest(
            String message,
            String severity
    ) {}
}

