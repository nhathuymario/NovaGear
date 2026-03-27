package uth.nhathuy.Auth.security;

import uth.nhathuy.Auth.entity.Role;
import uth.nhathuy.Auth.entity.RoleName;
import uth.nhathuy.Auth.entity.User;
import uth.nhathuy.Auth.repository.RoleRepository;
import uth.nhathuy.Auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from Google");
        }

        userRepository.findByEmail(email).orElseGet(() -> {
            Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));

            User user = User.builder()
                    .fullName(name != null ? name : email)
                    .username(email.split("@")[0])
                    .email(email)
                    .password(null)
                    .enabled(true)
                    .authProvider("GOOGLE")
                    .build();

            user.getRoles().add(userRole);
            return userRepository.save(user);
        });

        return oAuth2User;
    }
}