package uth.nhathuy.Auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final OAuth2UserAccountService oAuth2UserAccountService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from Google");
        }

        try {
            oAuth2UserAccountService.resolveOrCreateUser(email, name);
        } catch (RuntimeException ex) {
            OAuth2Error error = new OAuth2Error("oauth2_user_provisioning_failed", ex.getMessage(), null);
            throw new OAuth2AuthenticationException(error, ex.getMessage(), ex);
        }

        return oAuth2User;
    }
}