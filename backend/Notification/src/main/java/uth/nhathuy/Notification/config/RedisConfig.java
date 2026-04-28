package uth.nhathuy.Notification.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import uth.nhathuy.Notification.service.RedisRealtimeSubscriber;

@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "features.redis-realtime-enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class RedisConfig {

    @Value("${realtime.redis.channel:realtime-events}")
    private String realtimeChannel;

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            RedisRealtimeSubscriber subscriber
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(subscriber, new ChannelTopic(realtimeChannel));
        return container;
    }
}