package uth.nhathuy.Order.config;

import lombok.RequiredArgsConstructor;
import uth.nhathuy.Order.security.GatewayHeaderAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayHeaderAuthFilter gatewayHeaderAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/admin/orders/**").hasRole("ADMIN")
                        .requestMatchers("/api/orders/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(gatewayHeaderAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}