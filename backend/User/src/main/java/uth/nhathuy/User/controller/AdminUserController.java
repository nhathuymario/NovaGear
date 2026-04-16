package uth.nhathuy.User.controller;

import uth.nhathuy.User.dto.UserSummaryResponse;
import uth.nhathuy.User.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserProfileService userProfileService;

    @GetMapping
    public List<UserSummaryResponse> getAllUsers(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        // SecurityConfig already enforces /api/admin/users/** requires ROLE_ADMIN.
        return userProfileService.getAllUsers(authorizationHeader);
    }
}