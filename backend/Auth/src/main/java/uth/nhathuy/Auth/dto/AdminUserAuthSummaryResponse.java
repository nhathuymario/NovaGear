package uth.nhathuy.Auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserAuthSummaryResponse {
    private Long userId;
    private String email;
    private String username;
    private String fullName;
    private Boolean enabled;
    private String role;
}

