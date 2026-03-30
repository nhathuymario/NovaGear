package uth.nhathuy.User.controller;

import uth.nhathuy.User.dto.AddressRequest;
import uth.nhathuy.User.dto.ProfileResponse;
import uth.nhathuy.User.dto.UpdateProfileRequest;
import uth.nhathuy.User.entity.Address;
import uth.nhathuy.User.entity.UserProfile;
import uth.nhathuy.User.security.CurrentUser;
import uth.nhathuy.User.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserProfileService userProfileService;
    private final CurrentUser currentUser;

    @PostMapping("/me/bootstrap")
    public UserProfile bootstrapProfile(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-Email", required = false) String email,
            @RequestHeader(value = "X-Role", required = false) String role
    ) {
        Long authUserId = currentUser.getUserId(userIdHeader);
        return userProfileService.bootstrapIfMissing(
                authUserId,
                email == null ? ("user" + authUserId + "@local.dev") : email,
                username == null ? ("user" + authUserId) : username,
                role
        );
    }

    @GetMapping("/me")
    public ProfileResponse getMyProfile(
            @RequestHeader("X-User-Id") String userIdHeader
    ) {
        return userProfileService.getMyProfile(currentUser.getUserId(userIdHeader));
    }

    @PutMapping("/me")
    public ProfileResponse updateMyProfile(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return userProfileService.updateMyProfile(currentUser.getUserId(userIdHeader), request);
    }

    @GetMapping("/me/addresses")
    public List<Address> getMyAddresses(
            @RequestHeader("X-User-Id") String userIdHeader
    ) {
        return userProfileService.getMyAddresses(currentUser.getUserId(userIdHeader));
    }

    @PostMapping("/me/addresses")
    public Address addAddress(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody AddressRequest request
    ) {
        return userProfileService.addAddress(currentUser.getUserId(userIdHeader), request);
    }

    @PutMapping("/me/addresses/{addressId}")
    public Address updateAddress(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request
    ) {
        return userProfileService.updateAddress(currentUser.getUserId(userIdHeader), addressId, request);
    }

    @PutMapping("/me/addresses/{addressId}/default")
    public Address setDefaultAddress(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable Long addressId
    ) {
        return userProfileService.setDefaultAddress(currentUser.getUserId(userIdHeader), addressId);
    }

    @DeleteMapping("/me/addresses/{addressId}")
    public void deleteAddress(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable Long addressId
    ) {
        userProfileService.deleteAddress(currentUser.getUserId(userIdHeader), addressId);
    }
}