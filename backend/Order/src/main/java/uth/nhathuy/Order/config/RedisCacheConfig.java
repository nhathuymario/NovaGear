package uth.nhathuy.Order.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Redis Cache Configuration cho Order Service
 * Hot endpoints sẽ cache results
 */
@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default cache config: 5 phút TTL
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration
                .defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper()))
                );

        // Custom configs cho từng cache
        RedisCacheConfiguration ordersConfig = defaultConfig
                .entryTtl(Duration.ofMinutes(3))
                .prefixCacheNameWith("orders:");

        RedisCacheConfiguration inventoryConfig = defaultConfig
                .entryTtl(Duration.ofMinutes(2))
                .prefixCacheNameWith("inventory:");

        RedisCacheConfiguration productConfig = defaultConfig
                .entryTtl(Duration.ofMinutes(10))
                .prefixCacheNameWith("products:");

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withCacheConfiguration("orders:myOrders", ordersConfig)
                .withCacheConfiguration("orders:detail", ordersConfig)
                .withCacheConfiguration("inventory:stock", inventoryConfig)
                .withCacheConfiguration("inventory:lowStock", inventoryConfig)
                .withCacheConfiguration("products:list", productConfig)
                .withCacheConfiguration("products:detail", productConfig)
                .build();
    }

    private ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}

