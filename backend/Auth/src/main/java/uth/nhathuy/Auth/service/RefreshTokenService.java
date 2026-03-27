package uth.nhathuy.Auth.service;

import uth.nhathuy.Auth.entity.RefreshToken;
import uth.nhathuy.Auth.entity.User;
import uth.nhathuy.Auth.exception.BadRequestException;
import uth.nhathuy.Auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationMs;

    public RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);

        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryAt(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(token);
    }

    public RefreshToken verify(String tokenValue) {
        RefreshToken token = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new BadRequestException("Refresh token không hợp lệ"));

        if (Boolean.TRUE.equals(token.getRevoked())) {
            throw new BadRequestException("Refresh token đã bị thu hồi");
        }

        if (token.getExpiryAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token đã hết hạn");
        }

        return token;
    }

    public void revokeByUser(User user) {
        refreshTokenRepository.findByUser(user).forEach(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }
}