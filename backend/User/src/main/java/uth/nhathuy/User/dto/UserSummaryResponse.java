package uth.nhathuy.User.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummaryResponse {
    private Long authUserId;
    private String email;
    private String username;
    private String fullName;
    private String phone;
    private String status;
    private String role;
}