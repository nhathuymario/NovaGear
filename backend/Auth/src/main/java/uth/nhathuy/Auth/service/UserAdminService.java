package uth.nhathuy.Auth.service;

import uth.nhathuy.Auth.dto.AdminUserAuthSummaryResponse;
import uth.nhathuy.Auth.dto.UserStatusUpdateRequest;
import uth.nhathuy.Auth.entity.User;
import uth.nhathuy.Auth.exception.ResourceNotFoundException;
import uth.nhathuy.Auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    public List<AdminUserAuthSummaryResponse> getAllUserSummaries() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getId).reversed())
                .map(user -> AdminUserAuthSummaryResponse.builder()
                        .userId(user.getId())
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .enabled(Boolean.TRUE.equals(user.getEnabled()))
                        .role(user.getRoles().stream()
                                .map(role -> role.getName().name())
                                .findFirst()
                                .orElse("ROLE_USER"))
                        .build())
                .toList();
    }

    public void updateUserStatus(Long userId, UserStatusUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        user.setEnabled(request.getEnabled());
        userRepository.save(user);

        if (Boolean.FALSE.equals(request.getEnabled())) {
            refreshTokenService.revokeByUser(user);
        }
    }
}