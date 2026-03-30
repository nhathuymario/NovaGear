package uth.nhathuy.User.dto;

import uth.nhathuy.User.entity.Address;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ProfileResponse {
    private Long authUserId;
    private String email;
    private String username;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String gender;
    private LocalDate dateOfBirth;
    private String status;
    private String role;
    private List<Address> addresses;
}