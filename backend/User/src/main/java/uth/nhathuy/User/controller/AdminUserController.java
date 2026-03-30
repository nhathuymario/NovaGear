package uth.nhathuy.User.controller;

import uth.nhathuy.User.dto.UserSummaryResponse;
import uth.nhathuy.User.security.CurrentUser;
import uth.nhathuy.User.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserProfileService userProfileService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<UserSummaryResponse> getAllUsers(
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        if (!currentUser.isAdmin(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
        return userProfileService.getAllUsers();
    }
}