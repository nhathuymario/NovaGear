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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final AddressRepository addressRepository;

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

    public List<UserSummaryResponse> getAllUsers() {
        return userProfileRepository.findAll().stream()
                .map(u -> UserSummaryResponse.builder()
                        .authUserId(u.getAuthUserId())
                        .email(u.getEmail())
                        .username(u.getUsername())
                        .fullName(u.getFullName())
                        .phone(u.getPhone())
                        .status(u.getStatus())
                        .role(u.getRole())
                        .build())
                .toList();
    }

    private void clearDefaultAddress(Long authUserId) {
        addressRepository.findByAuthUserIdAndIsDefaultTrue(authUserId)
                .ifPresent(addr -> {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                });
    }
}