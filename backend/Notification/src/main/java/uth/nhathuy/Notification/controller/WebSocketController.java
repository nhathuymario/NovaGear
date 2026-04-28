package uth.nhathuy.Notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

/**
 * WebSocket Controller cho STOMP/SockJS connections
 * Endpoints: /app/subscribe/{channel}, /app/ping, etc.
 */
@RestController
@Slf4j
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Ping endpoint để check connection health
     * Client gửi: /app/ping
     * Response: /topic/pong
     */
    @MessageMapping("/ping")
    @SendTo("/topic/pong")
    public PingResponse ping(PingRequest request) {
        log.debug("Received ping from client");
        return new PingResponse("pong", System.currentTimeMillis());
    }

    /**
     * Subscribe to order updates cho một user
     */
    @MessageMapping("/subscribe/orders")
    public void subscribeToOrders(@Payload SubscriptionRequest request) {
        Long userId = request.userId();
        log.info("User {} subscribed to orders", userId);
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/orders",
                new SubscriptionAck("subscribed", "orders")
        );
    }

    /**
     * Subscribe to inventory updates
     */
    @MessageMapping("/subscribe/inventory")
    public void subscribeToInventory(@Payload SubscriptionRequest request) {
        log.info("Client subscribed to inventory updates");
        messagingTemplate.convertAndSend(
                "/topic/admin/inventory",
                new SubscriptionAck("subscribed", "inventory")
        );
    }

    // ===== DTOs =====
    public record PingRequest(long timestamp) {}

    public record PingResponse(String status, long timestamp) {}

    public record SubscriptionRequest(Long userId) {}

    public record SubscriptionAck(String status, String channel) {}
}

