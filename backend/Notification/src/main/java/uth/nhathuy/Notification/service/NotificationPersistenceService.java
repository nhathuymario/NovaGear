package uth.nhathuy.Notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import uth.nhathuy.Notification.model.NotificationEntity;
import uth.nhathuy.Notification.model.RealtimeEvent;
import uth.nhathuy.Notification.repository.NotificationRepository;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPersistenceService {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    public NotificationEntity persistFromEvent(RealtimeEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event.data());

            NotificationEntity entity = NotificationEntity.builder()
                    .userId(event.userId())
                    .eventType(event.eventType())
                    .source(event.source())
                    .entityId(event.entityId())
                    .occurredAt(event.occurredAt())
                    .traceId(event.traceId())
                    .payloadJson(payload)
                    .readFlag(false)
                    .createdAt(Instant.now())
                    .build();

            return notificationRepository.save(entity);
        } catch (Exception ex) {
            log.warn("Failed to persist notification event: {}", event, ex);
            return null;
        }
    }

    public Page<NotificationEntity> findByUser(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByOccurredAtDesc(userId, pageable);
    }

    public Page<NotificationEntity> findByUserAndPrefix(Long userId, String prefix, Pageable pageable) {
        return notificationRepository.findByUserIdAndEventTypeStartingWithOrderByOccurredAtDesc(userId, prefix, pageable);
    }

    public long cleanupOlderThanDays(int days) {
        java.time.Instant cutoff = java.time.Instant.now().minus(java.time.Duration.ofDays(Math.max(1, days)));
        return notificationRepository.deleteByCreatedAtBefore(cutoff);
    }

    public Page<NotificationEntity> findByEventPrefix(String prefix, Pageable pageable) {
        return notificationRepository.findByEventTypeStartingWithOrderByOccurredAtDesc(prefix, pageable);
    }

    public NotificationEntity markAsRead(Long id, Long userId) {
        return notificationRepository.findById(id).map(n -> {
            if (n.getUserId() == null || !n.getUserId().equals(userId)) {
                // can't mark someone else's notification
                return null;
            }
            n.setReadFlag(true);
            return notificationRepository.save(n);
        }).orElse(null);
    }
}


