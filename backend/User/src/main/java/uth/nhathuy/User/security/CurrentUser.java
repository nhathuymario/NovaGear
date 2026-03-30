package uth.nhathuy.User.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CurrentUser {

    public Long getUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        try {
            return Long.parseLong(userIdHeader);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid X-User-Id header");
        }
    }

    public String getRole(String roleHeader) {
        return roleHeader == null ? "" : roleHeader;
    }

    public boolean isAdmin(String roleHeader) {
        return roleHeader != null &&
                (roleHeader.equalsIgnoreCase("ADMIN") || roleHeader.equalsIgnoreCase("ROLE_ADMIN"));
    }
}