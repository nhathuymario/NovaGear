package uth.nhathuy.Product.controller;

import uth.nhathuy.Product.dto.*;
import uth.nhathuy.Product.service.CategoryService;
import uth.nhathuy.Product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/products/public")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;
    private final CategoryService categoryService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(productService.publicSearch(keyword, categoryId, page, size));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> getDetail(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getPublicDetailBySlug(slug));
    }

    @GetMapping("/{slug}/related")
    public ResponseEntity<List<ProductResponse>> getRelatedProducts(
            @PathVariable String slug,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ResponseEntity.ok(productService.getRelatedProductsBySlug(slug, size));
    }

    @GetMapping("/{slug}/reviews")
    public ResponseEntity<ProductReviewOverviewResponse> getReviews(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getReviewsBySlug(slug));
    }

    @PostMapping("/{slug}/reviews")
    public ResponseEntity<ApiResponse<ProductReviewResponse>> submitReview(
            @PathVariable String slug,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody ProductReviewRequest request
    ) {
        ResolvedIdentity identity = resolveIdentity(userIdHeader, username, authorization);
        if (identity == null) {
            return ResponseEntity.badRequest().body(ApiResponse.<ProductReviewResponse>builder()
                    .message("Vui lòng đăng nhập để đánh giá")
                    .data(null)
                    .build());
        }

        ProductReviewResponse result = productService.createOrUpdateReview(
                slug,
                identity.userId(),
                identity.username(),
                request
        );

        return ResponseEntity.ok(ApiResponse.<ProductReviewResponse>builder()
                .message("Đã lưu đánh giá")
                .data(result)
                .build());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getPublicCategories());
    }

    private ResolvedIdentity resolveIdentity(String userIdHeader, String username, String authorization) {
        if (isValidIdentity(userIdHeader, username)) {
            return new ResolvedIdentity(Long.parseLong(userIdHeader.trim()), username.trim());
        }

        String token = extractBearerToken(authorization);
        if (token == null) {
            return null;
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Object userIdClaim = claims.get("userId");
            Object usernameClaim = claims.get("username");
            if (userIdClaim == null || usernameClaim == null) {
                return null;
            }

            String userIdText = String.valueOf(userIdClaim).trim();
            String usernameText = String.valueOf(usernameClaim).trim();
            if (userIdText.isBlank() || usernameText.isBlank() || !isNumeric(userIdText)) {
                return null;
            }

            return new ResolvedIdentity(Long.parseLong(userIdText), usernameText);
        } catch (Exception ex) {
            return null;
        }
    }

    private boolean isValidIdentity(String userIdHeader, String username) {
        return userIdHeader != null && !userIdHeader.isBlank()
                && username != null && !username.isBlank()
                && isNumeric(userIdHeader.trim());
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || authorization.isBlank()) {
            return null;
        }
        if (!authorization.startsWith("Bearer ")) {
            return null;
        }
        String token = authorization.substring(7).trim();
        return token.isBlank() ? null : token;
    }

    private boolean isNumeric(String value) {
        for (int i = 0; i < value.length(); i++) {
            if (!Character.isDigit(value.charAt(i))) {
                return false;
            }
        }
        return !value.isBlank();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
                Base64.getEncoder().encodeToString(jwtSecret.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private record ResolvedIdentity(Long userId, String username) {}
}