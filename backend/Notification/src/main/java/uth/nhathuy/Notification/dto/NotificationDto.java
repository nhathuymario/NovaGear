package uth.nhathuy.Notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private Long userId;
    private String eventType;
    private String source;
    private String entityId;
    private Instant occurredAt;
    private String traceId;
    private Map<String, Object> payload;
    private boolean readFlag;
    private Instant createdAt;
}

