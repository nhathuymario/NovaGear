package uth.nhathuy.Notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import uth.nhathuy.Notification.model.RealtimeEvent;

@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "features.kafka-notifications-enabled", havingValue = "true")
public class KafkaNotificationConsumer {

    private final ObjectMapper objectMapper;
    private final RealtimeEventDispatchService dispatchService;

    @KafkaListener(topics = "${app.kafka.notification-topic}")
    public void consume(String payload) {
        try {
            RealtimeEvent event = objectMapper.readValue(payload, RealtimeEvent.class);
            dispatchService.dispatch(event);
        } catch (Exception ex) {
            log.warn("Failed to consume Kafka notification event payload: {}", payload, ex);
        }
    }
}
