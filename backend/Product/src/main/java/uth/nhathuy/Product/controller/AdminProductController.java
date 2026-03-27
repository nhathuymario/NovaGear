package uth.nhathuy.Product.controller;

import uth.nhathuy.Product.dto.*;
import uth.nhathuy.Product.entity.ProductStatus;
import uth.nhathuy.Product.exception.BadRequestException;
import uth.nhathuy.Product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> search(
            @RequestHeader("X-Role") String role,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(productService.adminSearch(keyword, categoryId, status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> detail(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(productService.getAdminDetail(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @RequestHeader("X-Role") String role,
            @Valid @RequestBody ProductRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .message("Tạo product thành công")
                .data(productService.createProduct(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .message("Cập nhật product thành công")
                .data(productService.updateProduct(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id
    ) {
        requireAdmin(role);
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Xóa product thành công")
                .data(null)
                .build());
    }

    @PostMapping("/{productId}/variants")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> addVariant(
            @RequestHeader("X-Role") String role,
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<ProductVariantResponse>builder()
                .message("Thêm variant thành công")
                .data(productService.addVariant(productId, request))
                .build());
    }

    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> updateVariant(
            @RequestHeader("X-Role") String role,
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<ProductVariantResponse>builder()
                .message("Cập nhật variant thành công")
                .data(productService.updateVariant(variantId, request))
                .build());
    }

    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<ApiResponse<Object>> deleteVariant(
            @RequestHeader("X-Role") String role,
            @PathVariable Long variantId
    ) {
        requireAdmin(role);
        productService.deleteVariant(variantId);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Xóa variant thành công")
                .data(null)
                .build());
    }

    @PostMapping("/{productId}/specifications")
    public ResponseEntity<ApiResponse<ProductSpecificationResponse>> addSpecification(
            @RequestHeader("X-Role") String role,
            @PathVariable Long productId,
            @Valid @RequestBody ProductSpecificationRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<ProductSpecificationResponse>builder()
                .message("Thêm specification thành công")
                .data(productService.addSpecification(productId, request))
                .build());
    }

    @PutMapping("/specifications/{specificationId}")
    public ResponseEntity<ApiResponse<ProductSpecificationResponse>> updateSpecification(
            @RequestHeader("X-Role") String role,
            @PathVariable Long specificationId,
            @Valid @RequestBody ProductSpecificationRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<ProductSpecificationResponse>builder()
                .message("Cập nhật specification thành công")
                .data(productService.updateSpecification(specificationId, request))
                .build());
    }

    @DeleteMapping("/specifications/{specificationId}")
    public ResponseEntity<ApiResponse<Object>> deleteSpecification(
            @RequestHeader("X-Role") String role,
            @PathVariable Long specificationId
    ) {
        requireAdmin(role);
        productService.deleteSpecification(specificationId);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Xóa specification thành công")
                .data(null)
                .build());
    }

    @PostMapping("/{productId}/images")
    public ResponseEntity<ApiResponse<ProductImageResponse>> addImage(
            @RequestHeader("X-Role") String role,
            @PathVariable Long productId,
            @Valid @RequestBody ProductImageRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<ProductImageResponse>builder()
                .message("Thêm image thành công")
                .data(productService.addImage(productId, request))
                .build());
    }

    @PutMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<ProductImageResponse>> updateImage(
            @RequestHeader("X-Role") String role,
            @PathVariable Long imageId,
            @Valid @RequestBody ProductImageRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<ProductImageResponse>builder()
                .message("Cập nhật image thành công")
                .data(productService.updateImage(imageId, request))
                .build());
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<Object>> deleteImage(
            @RequestHeader("X-Role") String role,
            @PathVariable Long imageId
    ) {
        requireAdmin(role);
        productService.deleteImage(imageId);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Xóa image thành công")
                .data(null)
                .build());
    }

    private void requireAdmin(String role) {
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new BadRequestException("Bạn không có quyền ADMIN");
        }
    }
}