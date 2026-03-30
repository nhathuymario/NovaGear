package uth.nhathuy.User.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {

    @Size(max = 150)
    private String fullName;

    @Size(max = 20)
    private String phone;

    @Size(max = 500)
    private String avatarUrl;

    @Size(max = 10)
    private String gender;

    private LocalDate dateOfBirth;
}