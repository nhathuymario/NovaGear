package uth.nhathuy.Product.controller;

import uth.nhathuy.Product.dto.*;
import uth.nhathuy.Product.exception.BadRequestException;
import uth.nhathuy.Product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll(
            @RequestHeader("X-Role") String role
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(categoryService.getAll());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @RequestHeader("X-Role") String role,
            @Valid @RequestBody CategoryRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .message("Tạo category thành công")
                .data(categoryService.create(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .message("Cập nhật category thành công")
                .data(categoryService.update(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id
    ) {
        requireAdmin(role);
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Xóa category thành công")
                .data(null)
                .build());
    }

    private void requireAdmin(String role) {
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new BadRequestException("Bạn không có quyền ADMIN");
        }
    }
}