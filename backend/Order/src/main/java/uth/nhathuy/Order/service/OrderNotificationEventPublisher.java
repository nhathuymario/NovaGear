package uth.nhathuy.Order.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import uth.nhathuy.Order.event.NotificationEvent;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderNotificationEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.kafka.notification-topic}")
    private String notificationTopic;

    public void publishOrderEvent(String eventType, Long orderId, Long userId, Map<String, Object> data) {
        NotificationEvent event = new NotificationEvent(
                eventType,
                "ORDER",
                String.valueOf(orderId),
                userId,
                Instant.now(),
                UUID.randomUUID().toString(),
                data
        );

        send(event, userId != null ? userId.toString() : String.valueOf(orderId));
    }

    private void send(NotificationEvent event, String key) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(notificationTopic, key, payload)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.warn("Failed to publish Kafka notification event {}", event.eventType(), ex);
                            return;
                        }
                        log.info("Published Kafka notification event {} to topic {}", event.eventType(), notificationTopic);
                    });
        } catch (JsonProcessingException ex) {
            log.warn("Failed to serialize Kafka notification event {}", event.eventType(), ex);
        }
    }
}
