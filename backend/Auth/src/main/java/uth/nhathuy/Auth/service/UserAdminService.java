package uth.nhathuy.Auth.service;

import uth.nhathuy.Auth.dto.UserStatusUpdateRequest;
import uth.nhathuy.Auth.entity.User;
import uth.nhathuy.Auth.exception.ResourceNotFoundException;
import uth.nhathuy.Auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

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