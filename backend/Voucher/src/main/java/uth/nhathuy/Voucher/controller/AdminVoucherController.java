package uth.nhathuy.Voucher.controller;

import uth.nhathuy.Voucher.dto.ApiResponse;
import uth.nhathuy.Voucher.dto.VoucherRequest;
import uth.nhathuy.Voucher.dto.VoucherResponse;
import uth.nhathuy.Voucher.entity.VoucherScopeType;
import uth.nhathuy.Voucher.exception.BadRequestException;
import uth.nhathuy.Voucher.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
public class AdminVoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<Page<VoucherResponse>> search(
            @RequestHeader("X-Role") String role,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) VoucherScopeType scopeType,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(voucherService.search(keyword, scopeType, active, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponse> detail(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(voucherService.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VoucherResponse>> create(
            @RequestHeader("X-Role") String role,
            @Valid @RequestBody VoucherRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .message("Tạo voucher thành công")
                .data(voucherService.create(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> update(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .message("Cập nhật voucher thành công")
                .data(voucherService.update(id, request))
                .build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<VoucherResponse>> toggleActive(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .message("Cập nhật trạng thái voucher thành công")
                .data(voucherService.toggleActive(id))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(
            @RequestHeader("X-Role") String role,
            @PathVariable Long id
    ) {
        requireAdmin(role);
        voucherService.delete(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Xóa voucher thành công")
                .data(null)
                .build());
    }

    private void requireAdmin(String role) {
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new BadRequestException("Bạn không có quyền ADMIN");
        }
    }
}
