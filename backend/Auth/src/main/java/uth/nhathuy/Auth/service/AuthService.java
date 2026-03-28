package uth.nhathuy.Auth.service;

import org.springframework.transaction.annotation.Transactional;
import uth.nhathuy.Auth.dto.*;
import uth.nhathuy.Auth.entity.*;
import uth.nhathuy.Auth.exception.BadRequestException;
import uth.nhathuy.Auth.exception.ResourceNotFoundException;
import uth.nhathuy.Auth.repository.RoleRepository;
import uth.nhathuy.Auth.repository.UserRepository;
import uth.nhathuy.Auth.security.CustomUserDetails;
import uth.nhathuy.Auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username đã tồn tại");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        Role roleUser = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ROLE_USER"));

        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .authProvider("LOCAL")
                .enabled(true)
                .build();

        user.getRoles().add(roleUser);
        User saved = userRepository.save(user);

        CustomUserDetails principal = new CustomUserDetails(saved);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = refreshTokenService.createRefreshToken(saved).getToken();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(saved.getId())
                .username(saved.getUsername())
                .email(saved.getEmail())
                .roles(principal.getRoleNames())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();

        User user = userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new BadRequestException("Tài khoản đã bị khóa");
        }

        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(principal.getRoleNames())
                .build();
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verify(request.getRefreshToken());
        User user = refreshToken.getUser();

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new BadRequestException("Tài khoản đã bị khóa");
        }

        CustomUserDetails principal = new CustomUserDetails(user);
        String newAccessToken = jwtService.generateAccessToken(principal);
        String newRefreshToken = refreshTokenService.createRefreshToken(user).getToken();

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(principal.getRoleNames())
                .build();
    }

    public MeResponse me(CustomUserDetails currentUser) {
        return MeResponse.builder()
                .id(currentUser.getId())
                .fullName(currentUser.getFullName())
                .username(currentUser.getUsername())
                .email(currentUser.getEmail())
                .roles(currentUser.getRoleNames())
                .build();
    }

    public void changePassword(CustomUserDetails currentUser, ChangePasswordRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu cũ không đúng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenService.revokeByUser(user);
    }
}