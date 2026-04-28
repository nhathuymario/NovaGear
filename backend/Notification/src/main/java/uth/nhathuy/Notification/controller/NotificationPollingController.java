package uth.nhathuy.Notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints cho polling fallback
 * Khi WebSocket không hoạt động, client sẽ poll những endpoints này
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationPollingController {

    // TODO: Inject NotificationRepository khi có
    // private final NotificationRepository notificationRepository;

    /**
     * Polling endpoint: GET /api/notifications/orders/me
     * Frontend sẽ poll this every 5-10 seconds nếu WS down
     */
    @GetMapping("/orders/me")
    public ResponseEntity<List<?>> getMyOrderNotifications(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit
    ) {
        // TODO: Query notifications từ DB, filter by userId
        return ResponseEntity.ok(List.of());
    }

    /**
     * Polling endpoint: GET /api/notifications/payments/me
     */
    @GetMapping("/payments/me")
    public ResponseEntity<List<?>> getMyPaymentNotifications(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit
    ) {
        // TODO: Query payment notifications
        return ResponseEntity.ok(List.of());
    }

    /**
     * Polling endpoint cho admin: GET /api/admin/notifications/low-stock
     */
    @GetMapping("/admin/low-stock")
    public ResponseEntity<List<?>> getLowStockAlerts(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit
    ) {
        // TODO: Query low stock notifications
        return ResponseEntity.ok(List.of());
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @RequestHeader("X-User-Id") Long userId
    ) {
        // TODO: Update notification status
        return ResponseEntity.noContent().build();
    }
}

