package uth.nhathuy.Order.event;

import java.time.Instant;
import java.util.Map;

public record NotificationEvent(
        String eventType,
        String source,
        String entityId,
        Long userId,
        Instant occurredAt,
        String traceId,
        Map<String, Object> data
) {
}
