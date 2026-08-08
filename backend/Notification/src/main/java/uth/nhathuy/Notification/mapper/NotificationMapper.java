package uth.nhathuy.Notification.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import uth.nhathuy.Notification.dto.NotificationDto;
import uth.nhathuy.Notification.model.NotificationEntity;

import java.util.Map;

@Component
public class NotificationMapper {

    private final ObjectMapper objectMapper;

    public NotificationMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public NotificationDto toDto(NotificationEntity e) {
        Map<String, Object> payload = null;
        try {
            if (e.getPayloadJson() != null) {
                payload = objectMapper.readValue(e.getPayloadJson(), Map.class);
            }
        } catch (Exception ex) {
            // fallback: leave payload null
        }

        return NotificationDto.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .eventType(e.getEventType())
                .source(e.getSource())
                .entityId(e.getEntityId())
                .occurredAt(e.getOccurredAt())
                .traceId(e.getTraceId())
                .payload(payload)
                .readFlag(e.isReadFlag())
                .createdAt(e.getCreatedAt())
                .build();
    }
}

