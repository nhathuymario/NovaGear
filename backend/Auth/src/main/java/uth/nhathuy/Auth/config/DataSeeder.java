package uth.nhathuy.Auth.config;

import uth.nhathuy.Auth.entity.*;
import uth.nhathuy.Auth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@Profile("seed")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
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
    }

    private Role createRoleIfNotExists(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
    }

    private void createUserIfNotExists(
            String fullName,
            String username,
            String email,
            String rawPassword,
            Set<Role> roles
    ) {
        if (userRepository.existsByUsername(username)) {
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
    }
}