package uth.nhathuy.gateway.filter;

import io.jsonwebtoken.Claims;
import uth.nhathuy.gateway.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBufferFactory; // THÊM DÒNG NÀY
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest; // QUAN TRỌNG: Phải là .reactive
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/oauth2/",
            "/oauth2/",
            "/login/oauth2/",
            "/api/products/public",
            "/api/ai",
            "/api/inventory/internal/variant/"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        if (isPublicPath(path, exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.isValid(token)) {
            return unauthorized(exchange, "Invalid token");
        }

        Claims claims = jwtUtil.extractAllClaims(token);

        String userId = extractClaimAsString(claims, "userId");
        String username = extractClaimAsString(claims, "username");
        if (!isNumeric(userId) || username == null || username.isBlank()) {
            return unauthorized(exchange, "Token payload thiếu thông tin người dùng");
        }
        Object rolesObj = claims.get("roles");
        String roles = rolesObj != null ? rolesObj.toString() : "";

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User-Id", userId)
                .header("X-Username", username)
                .header("X-Role", roles)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublicPath(String path, HttpMethod method) {
        String normalizedPath = normalizePath(path);
        // Reviews submit must pass through JWT validation so gateway can inject X-User-* headers.
        if (method == HttpMethod.POST && normalizedPath.matches("^/api/products/public/[^/]+/reviews$")) {
            return false;
        }
        return PUBLIC_PATHS.stream().anyMatch(normalizedPath::startsWith);
    }

    private String normalizePath(String path) {
        if (path == null || path.isBlank() || "/".equals(path)) {
            return "/";
        }
        // Keep one canonical form to avoid auth bypass differences like '/reviews/' vs '/reviews'.
        return path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
    }

    private String extractClaimAsString(Claims claims, String key) {
        Object value = claims.get(key);
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty() || "null".equalsIgnoreCase(text)) {
            return null;
        }
        return text;
    }

    private boolean isNumeric(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        for (int i = 0; i < value.length(); i++) {
            if (!Character.isDigit(value.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        exchange.getResponse().getHeaders().add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173");
        exchange.getResponse().getHeaders().add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
        exchange.getResponse().getHeaders().add(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
        exchange.getResponse().getHeaders().add(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET,POST,PUT,DELETE,OPTIONS");

        String body = """
                {"status":401,"error":"Unauthorized","message":"%s"}
                """.formatted(message);

        DataBufferFactory bufferFactory = exchange.getResponse().bufferFactory();
        return exchange.getResponse().writeWith(
                Mono.just(bufferFactory.wrap(body.getBytes()))
        );
    }

    @Override
    public int getOrder() {
        return -1;
    }
}