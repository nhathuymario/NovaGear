package uth.nhathuy.Notification.controller;

import lombok.RequiredArgsConstructor;
// ...existing code... (removed unused imports)
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

    private final uth.nhathuy.Notification.service.NotificationPersistenceService notificationPersistenceService;
    private final uth.nhathuy.Notification.mapper.NotificationMapper notificationMapper;

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
        var pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, offset), Math.max(1, limit));
        var page = notificationPersistenceService.findByUserAndPrefix(userId, "ORDER_", pageable);
        var dtos = page.getContent().stream().map(notificationMapper::toDto).toList();
        return ResponseEntity.ok(dtos);
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
        var pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, offset), Math.max(1, limit));
        var page = notificationPersistenceService.findByUserAndPrefix(userId, "PAYMENT_", pageable);
        var dtos = page.getContent().stream().map(notificationMapper::toDto).toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * Polling endpoint cho admin: GET /api/admin/notifications/low-stock
     */
    @GetMapping("/admin/low-stock")
    public ResponseEntity<List<?>> getLowStockAlerts(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit
    ) {
        var pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, offset), Math.max(1, limit));
        var page = notificationPersistenceService.findByEventPrefix("INVENTORY_", pageable);
        var dtos = page.getContent().stream().map(notificationMapper::toDto).toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @RequestHeader("X-User-Id") Long userId
    ) {
        var updated = notificationPersistenceService.markAsRead(notificationId, userId);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}

