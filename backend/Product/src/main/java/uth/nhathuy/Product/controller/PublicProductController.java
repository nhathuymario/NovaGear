package uth.nhathuy.Product.controller;

import uth.nhathuy.Product.dto.*;
import uth.nhathuy.Product.service.CategoryService;
import uth.nhathuy.Product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/public")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;
    private final CategoryService categoryService;

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
            @Valid @RequestBody ProductReviewRequest request
    ) {
        if (userIdHeader == null || userIdHeader.isBlank() || username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.<ProductReviewResponse>builder()
                    .message("Vui lòng đăng nhập để đánh giá")
                    .data(null)
                    .build());
        }

        Long userId;
        try {
            userId = Long.parseLong(userIdHeader.trim());
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.<ProductReviewResponse>builder()
                    .message("Thông tin đăng nhập không hợp lệ")
                    .data(null)
                    .build());
        }

        ProductReviewResponse result = productService.createOrUpdateReview(
                slug,
                userId,
                username,
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
}