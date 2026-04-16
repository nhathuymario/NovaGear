package uth.nhathuy.User.service;

import uth.nhathuy.User.dto.AddressRequest;
import uth.nhathuy.User.dto.ProfileResponse;
import uth.nhathuy.User.dto.UpdateProfileRequest;
import uth.nhathuy.User.dto.UserSummaryResponse;
import uth.nhathuy.User.entity.Address;
import uth.nhathuy.User.entity.UserProfile;
import uth.nhathuy.User.exception.ResourceNotFoundException;
import uth.nhathuy.User.repository.AddressRepository;
import uth.nhathuy.User.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final AddressRepository addressRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${auth-service.base-url:http://localhost:8081}")
    private String authServiceBaseUrl;

    @Transactional
    public UserProfile bootstrapIfMissing(Long authUserId, String email, String username, String role) {
        return userProfileRepository.findByAuthUserId(authUserId)
                .orElseGet(() -> userProfileRepository.save(
                        UserProfile.builder()
                                .authUserId(authUserId)
                                .email(email)
                                .username(username)
                                .fullName(username)
                                .status("ACTIVE")
                                .role(role == null || role.isBlank() ? "USER" : role)
                                .build()
                ));
    }

    public ProfileResponse getMyProfile(Long authUserId) {
        UserProfile profile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        List<Address> addresses = addressRepository.findByAuthUserIdOrderByIsDefaultDescIdDesc(authUserId);

        return ProfileResponse.builder()
                .authUserId(profile.getAuthUserId())
                .email(profile.getEmail())
                .username(profile.getUsername())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .avatarUrl(profile.getAvatarUrl())
                .gender(profile.getGender())
                .dateOfBirth(profile.getDateOfBirth())
                .status(profile.getStatus())
                .role(profile.getRole())
                .addresses(addresses)
                .build();
    }

    @Transactional
    public ProfileResponse updateMyProfile(Long authUserId, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setAvatarUrl(request.getAvatarUrl());
        profile.setGender(request.getGender());
        profile.setDateOfBirth(request.getDateOfBirth());

        userProfileRepository.save(profile);
        return getMyProfile(authUserId);
    }

    @Transactional
    public Address addAddress(Long authUserId, AddressRequest request) {
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddress(authUserId);
        }

        Address address = Address.builder()
                .authUserId(authUserId)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .line1(request.getLine1())
                .line2(request.getLine2())
                .ward(request.getWard())
                .district(request.getDistrict())
                .province(request.getProvince())
                .postalCode(request.getPostalCode())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        return addressRepository.save(address);
    }

    public List<Address> getMyAddresses(Long authUserId) {
        return addressRepository.findByAuthUserIdOrderByIsDefaultDescIdDesc(authUserId);
    }

    @Transactional
    public Address updateAddress(Long authUserId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findByIdAndAuthUserId(addressId, authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddress(authUserId);
        }

        address.setReceiverName(request.getReceiverName());
        address.setReceiverPhone(request.getReceiverPhone());
        address.setLine1(request.getLine1());
        address.setLine2(request.getLine2());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());
        address.setPostalCode(request.getPostalCode());
        address.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long authUserId, Long addressId) {
        Address address = addressRepository.findByIdAndAuthUserId(addressId, authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        addressRepository.delete(address);
    }

    @Transactional
    public Address setDefaultAddress(Long authUserId, Long addressId) {
        Address address = addressRepository.findByIdAndAuthUserId(addressId, authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        clearDefaultAddress(authUserId);
        address.setIsDefault(true);
        return addressRepository.save(address);
    }

    public List<UserSummaryResponse> getAllUsers(String authorizationHeader) {
        Map<Long, UserProfile> profilesByAuthId = userProfileRepository.findAll().stream()
                .filter(profile -> profile.getAuthUserId() != null)
                .collect(HashMap::new, (map, profile) -> map.put(profile.getAuthUserId(), profile), HashMap::putAll);

        // Pick one phone per user, prefer default address then latest address.
        Map<Long, String> addressPhoneByAuthId = new HashMap<>();
        for (Address address : addressRepository.findAllByOrderByAuthUserIdAscIsDefaultDescIdDesc()) {
            if (address.getAuthUserId() == null) {
                continue;
            }
            addressPhoneByAuthId.putIfAbsent(address.getAuthUserId(), firstNonBlank(address.getReceiverPhone()));
        }

        Map<Long, AuthUserSummary> authUsersById = getAuthUsers(authorizationHeader);

        return Stream.concat(profilesByAuthId.keySet().stream(), authUsersById.keySet().stream())
                .distinct()
                .sorted(Comparator.reverseOrder())
                .map(id -> {
                    UserProfile profile = profilesByAuthId.get(id);
                    AuthUserSummary authUser = authUsersById.get(id);

                    String email = firstNonBlank(
                            authUser == null ? null : authUser.email,
                            profile == null ? null : profile.getEmail()
                    );
                    String username = firstNonBlank(
                            authUser == null ? null : authUser.username,
                            profile == null ? null : profile.getUsername()
                    );
                    String fullName = firstNonBlank(
                            profile == null ? null : profile.getFullName(),
                            authUser == null ? null : authUser.fullName,
                            username
                    );
                    String phone = firstNonBlank(
                            profile == null ? null : profile.getPhone(),
                            addressPhoneByAuthId.get(id)
                    );
                    String status = authUser == null
                            ? normalizeStatus(profile == null ? null : profile.getStatus())
                            : (Boolean.TRUE.equals(authUser.enabled) ? "ACTIVE" : "INACTIVE");
                    String role = normalizeRole(firstNonBlank(
                            authUser == null ? null : authUser.role,
                            profile == null ? null : profile.getRole()
                    ));

                    return UserSummaryResponse.builder()
                            .authUserId(id)
                            .email(email)
                            .username(username)
                            .fullName(fullName)
                            .phone(phone)
                            .status(status)
                            .role(role)
                            .build();
                })
                .toList();
    }

    private Map<Long, AuthUserSummary> getAuthUsers(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return Map.of();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authorizationHeader);

            ResponseEntity<List<AuthUserSummary>> response = restTemplate.exchange(
                    authServiceBaseUrl + "/api/admin/users/auth-summaries",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    new ParameterizedTypeReference<>() {}
            );

            List<AuthUserSummary> items = response.getBody();
            if (items == null || items.isEmpty()) {
                return Map.of();
            }

            Map<Long, AuthUserSummary> map = new HashMap<>();
            for (AuthUserSummary item : items) {
                if (item.userId != null) {
                    map.put(item.userId, item);
                }
            }
            return map;
        } catch (Exception ex) {
            // Fallback to profile data if auth-service is unavailable.
            return Map.of();
        }
    }

    private String normalizeRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return "USER";
        }

        String cleaned = rawRole.replace("[", "").replace("]", "").trim();
        if (cleaned.startsWith("ROLE_")) {
            cleaned = cleaned.substring(5);
        }

        int commaIndex = cleaned.indexOf(',');
        if (commaIndex >= 0) {
            cleaned = cleaned.substring(0, commaIndex).trim();
        }

        return cleaned.isBlank() ? "USER" : cleaned.toUpperCase();
    }

    private String normalizeStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return "ACTIVE";
        }
        return rawStatus.trim().toUpperCase();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private static class AuthUserSummary {
        public Long userId;
        public String email;
        public String username;
        public String fullName;
        public Boolean enabled;
        public String role;
    }

    private void clearDefaultAddress(Long authUserId) {
        addressRepository.findByAuthUserIdAndIsDefaultTrue(authUserId)
                .ifPresent(addr -> {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                });
    }
}