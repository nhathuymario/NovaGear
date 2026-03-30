package uth.nhathuy.gateway.config;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable) // Vô hiệu hóa CSRF
                .cors(ServerHttpSecurity.CorsSpec::disable) // Tạm thời disable CORS ở Security để dùng cấu hình ở .yml
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/api/auth/**").permitAll()
                        .pathMatchers("/api/products/**").permitAll() // Cho phép công khai
                        .anyExchange().authenticated()
                )
                .build();
    }
}