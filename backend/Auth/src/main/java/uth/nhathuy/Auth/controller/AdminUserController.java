package uth.nhathuy.Auth.controller;

import uth.nhathuy.Auth.dto.UserStatusUpdateRequest;
import uth.nhathuy.Auth.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserAdminService userAdminService;

    @PutMapping("/{userId}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        userAdminService.updateUserStatus(userId, request);
        return ResponseEntity.ok("Cập nhật trạng thái user thành công");
    }
}