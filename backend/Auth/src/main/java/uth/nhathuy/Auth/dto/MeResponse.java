package uth.nhathuy.Auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class MeResponse {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private Set<String> roles;
}