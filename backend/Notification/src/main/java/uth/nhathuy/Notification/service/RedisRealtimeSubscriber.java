package uth.nhathuy.Notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Service;
import uth.nhathuy.Notification.model.RealtimeEvent;

import java.nio.charset.StandardCharsets;

@Service
@Slf4j
@RequiredArgsConstructor
public class RedisRealtimeSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final RealtimeEventDispatchService dispatchService;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String payload = new String(message.getBody(), StandardCharsets.UTF_8);
            RealtimeEvent event = objectMapper.readValue(payload, RealtimeEvent.class);
            dispatchService.dispatch(event);
        } catch (Exception ex) {
            log.warn("Cannot parse realtime event: {}", ex.getMessage());
        }
    }
}