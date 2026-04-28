package uth.nhathuy.Notification.model;

import java.time.Instant;
import java.util.Map;

public record RealtimeEvent(
        String eventType,
        String source,
        String entityId,
        Long userId,
        Instant occurredAt,
        String traceId,
        Map<String, Object> data
) {
}

