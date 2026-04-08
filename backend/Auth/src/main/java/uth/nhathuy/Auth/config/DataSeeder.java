package uth.nhathuy.Auth.config;

import uth.nhathuy.Auth.entity.*;
import uth.nhathuy.Auth.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            log.info("Starting data seeding for Auth service...");
            
            Role adminRole = createRoleIfNotExists(RoleName.ROLE_ADMIN);
            Role staffRole = createRoleIfNotExists(RoleName.ROLE_STAFF);
            Role userRole = createRoleIfNotExists(RoleName.ROLE_USER);

            createUserIfNotExists(
                    "System Admin",
                    "admin",
                    "admin@gmail.com",
                    "123456",
                    Set.of(adminRole)
            );

            createUserIfNotExists(
                    "Staff User",
                    "staff",
                    "staff@gmail.com",
                    "123456",
                    Set.of(staffRole)
            );

            createUserIfNotExists(
                    "Normal User",
                    "user",
                    "user@gmail.com",
                    "123456",
                    Set.of(userRole)
            );
            
            log.info("Data seeding completed successfully!");
        } catch (Exception e) {
            log.error("Error during data seeding: ", e);
        }
    }

    private Role createRoleIfNotExists(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = roleRepository.save(Role.builder().name(roleName).build());
                    log.info("Role {} created successfully", roleName);
                    return role;
                });
    }

    private void createUserIfNotExists(
            String fullName,
            String username,
            String email,
            String rawPassword,
            Set<Role> roles
    ) {
        if (userRepository.existsByUsername(username)) {
            log.info("User {} already exists, skipping", username);
            return;
        }

        User user = User.builder()
                .fullName(fullName)
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .roles(roles)
                .enabled(true)
                .build();

        userRepository.save(user);
        log.info("User {} created successfully with roles {}", username, roles);
    }
}