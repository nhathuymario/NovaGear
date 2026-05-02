package uth.nhathuy.Payment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import uth.nhathuy.Payment.event.NotificationEvent;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentNotificationEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.kafka.notification-topic}")
    private String notificationTopic;

    public void publishPaymentEvent(String eventType, Long orderId, Long userId, String status, Map<String, Object> data) {
        NotificationEvent event = new NotificationEvent(
                eventType,
                "PAYMENT",
                String.valueOf(orderId),
                userId,
                Instant.now(),
                UUID.randomUUID().toString(),
                merge(status, data)
        );

        send(event, userId != null ? userId.toString() : String.valueOf(orderId));
    }

    private Map<String, Object> merge(String status, Map<String, Object> data) {
        java.util.LinkedHashMap<String, Object> payload = new java.util.LinkedHashMap<>();
        if (status != null && !status.isBlank()) {
            payload.put("status", status);
        }
        if (data != null) {
            payload.putAll(data);
        }
        return payload;
    }

    private void send(NotificationEvent event, String key) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(notificationTopic, key, payload)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.warn("Failed to publish Kafka payment event {}", event.eventType(), ex);
                            return;
                        }
                        log.info("Published Kafka payment event {} to topic {}", event.eventType(), notificationTopic);
                    });
        } catch (JsonProcessingException ex) {
            log.warn("Failed to serialize Kafka payment event {}", event.eventType(), ex);
        }
    }
}
