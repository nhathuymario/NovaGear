package uth.nhathuy.Auth.security;

import uth.nhathuy.Auth.entity.Role;
import uth.nhathuy.Auth.entity.RoleName;
import uth.nhathuy.Auth.entity.User;
import uth.nhathuy.Auth.repository.RoleRepository;
import uth.nhathuy.Auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class OAuth2UserAccountService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public User resolveOrCreateUser(String rawEmail, String displayName) {
        String email = normalizeEmail(rawEmail);

        return userRepository.findByEmailIgnoreCase(email)
                .map(existing -> updateExistingOAuthUser(existing, displayName))
                .orElseGet(() -> createGoogleUser(email, displayName));
    }

    private User updateExistingOAuthUser(User user, String displayName) {
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException("ROLE_USER not found"));

        boolean changed = false;
        boolean hasUserRole = user.getRoles() != null
                && user.getRoles().stream().anyMatch(role -> role.getName() == RoleName.ROLE_USER);

        if (!hasUserRole) {
            user.getRoles().add(userRole);
            changed = true;
        }

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            user.setEnabled(true);
            changed = true;
        }

        if (user.getAuthProvider() == null || user.getAuthProvider().isBlank()) {
            user.setAuthProvider("GOOGLE");
            changed = true;
        }

        if ((user.getFullName() == null || user.getFullName().isBlank()) && displayName != null && !displayName.isBlank()) {
            user.setFullName(displayName);
            changed = true;
        }

        return changed ? userRepository.save(user) : user;
    }

    private User createGoogleUser(String email, String displayName) {
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException("ROLE_USER not found"));

        User user = User.builder()
                .fullName((displayName != null && !displayName.isBlank()) ? displayName : email)
                .username(generateUniqueUsername(email))
                .email(email)
                .password(null)
                .enabled(true)
                .authProvider("GOOGLE")
                .build();

        user.getRoles().add(userRole);
        return userRepository.save(user);
    }

    private String generateUniqueUsername(String email) {
        String base = email.split("@")[0]
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9._-]", "");

        if (base.isEmpty()) {
            base = "google_user";
        }

        String candidate = base;
        int counter = 1;

        while (userRepository.existsByUsernameIgnoreCase(candidate)) {
            candidate = base + counter;
            counter++;
        }

        return candidate;
    }

    private String normalizeEmail(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new IllegalArgumentException("Email not found from OAuth2 provider");
        }
        return rawEmail.trim().toLowerCase(Locale.ROOT);
    }
}



