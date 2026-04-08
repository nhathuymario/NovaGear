package uth.nhathuy.User.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import uth.nhathuy.User.entity.Address;
import uth.nhathuy.User.entity.UserProfile;
import uth.nhathuy.User.repository.AddressRepository;
import uth.nhathuy.User.repository.UserProfileRepository;

import java.time.LocalDate;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserProfileRepository userProfileRepository;
    private final AddressRepository addressRepository;

    @Override
    public void run(String... args) {
        seedProfileAndAddress(
                1L,
                "admin",
                "admin@gmail.com",
                "System Admin",
                "ADMIN",
                "0900000001",
                "Toa nha NovaGear",
                "Phuong Ben Nghe",
                "Quan 1",
                "TP HCM"
        );
        seedProfileAndAddress(
                2L,
                "staff",
                "staff@gmail.com",
                "Staff User",
                "STAFF",
                "0900000002",
                "123 Nguyen Van Linh",
                "Tan Phong",
                "Quan 7",
                "TP HCM"
        );
        seedProfileAndAddress(
                3L,
                "user",
                "user@gmail.com",
                "Normal User",
                "USER",
                "0900000003",
                "456 Le Loi",
                "Phuong Ben Thanh",
                "Quan 1",
                "TP HCM"
        );
    }

    private void seedProfileAndAddress(
            Long authUserId,
            String username,
            String email,
            String fullName,
            String role,
            String phone,
            String line1,
            String ward,
            String district,
            String province
    ) {
        UserProfile profile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseGet(() -> UserProfile.builder().authUserId(authUserId).build());

        profile.setUsername(username);
        profile.setEmail(email);
        profile.setFullName(fullName);
        profile.setRole(role);
        profile.setStatus("ACTIVE");
        profile.setPhone(phone);
        profile.setGender("MALE");
        profile.setDateOfBirth(LocalDate.of(1998, 1, 1));

        userProfileRepository.save(profile);

        if (addressRepository.findByAuthUserIdOrderByIsDefaultDescIdDesc(authUserId).isEmpty()) {
            addressRepository.save(Address.builder()
                    .authUserId(authUserId)
                    .receiverName(fullName)
                    .receiverPhone(phone)
                    .line1(line1)
                    .line2("")
                    .ward(ward)
                    .district(district)
                    .province(province)
                    .postalCode("700000")
                    .isDefault(true)
                    .build());
        }
    }
}


