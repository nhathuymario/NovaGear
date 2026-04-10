package uth.nhathuy.Auth.security;

import uth.nhathuy.Auth.entity.User;
import uth.nhathuy.Auth.service.RefreshTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final String FRONTEND_SUCCESS_URL = "http://localhost:5173/oauth2/success";
    private static final String FRONTEND_LOGIN_URL = "http://localhost:5173/login";

    private final OAuth2UserAccountService oAuth2UserAccountService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        Object authPrincipal = authentication.getPrincipal();
        if (!(authPrincipal instanceof OAuth2User oauthUser)) {
            log.error("OAuth2 principal is not an OAuth2User: {}", authPrincipal != null ? authPrincipal.getClass().getName() : "null");
            response.sendRedirect(FRONTEND_LOGIN_URL + "?error=google_auth_failed");
            return;
        }

        String email = extractEmail(oauthUser);
        String name = oauthUser.getAttribute("name");

        if (email == null || email.isBlank()) {
            response.sendRedirect(FRONTEND_LOGIN_URL + "?error=google_auth_failed");
            return;
        }

        try {
            User user = oAuth2UserAccountService.resolveOrCreateUser(email, name);

            CustomUserDetails principal = new CustomUserDetails(user);
            String accessToken = jwtService.generateAccessToken(principal);
            String refreshToken = refreshTokenService.createRefreshToken(user).getToken();

            String redirectUrl = FRONTEND_SUCCESS_URL
                    + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                    + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);

            response.sendRedirect(redirectUrl);
        } catch (Exception ex) {
            log.error("OAuth2 login success handler failed for email {}", email, ex);
            response.sendRedirect(FRONTEND_LOGIN_URL + "?error=google_auth_failed");
        }
    }

    private String extractEmail(OAuth2User oauthUser) {
        String email = oauthUser.getAttribute("email");
        if (email != null && !email.isBlank()) {
            return email;
        }

        if (oauthUser instanceof OidcUser oidcUser) {
            String oidcEmail = oidcUser.getEmail();
            if (oidcEmail != null && !oidcEmail.isBlank()) {
                return oidcEmail;
            }
        }

        return null;
    }
}