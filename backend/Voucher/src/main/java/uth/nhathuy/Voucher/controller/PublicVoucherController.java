package uth.nhathuy.Voucher.controller;

import uth.nhathuy.Voucher.dto.ApiResponse;
import uth.nhathuy.Voucher.dto.VoucherResponse;
import uth.nhathuy.Voucher.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class PublicVoucherController {

    private final VoucherService voucherService;

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<VoucherResponse>> validate(
            @RequestParam String code,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal subtotal
    ) {
        VoucherResponse voucher = voucherService.validateVoucher(code, productId, categoryId, subtotal);
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .message("Voucher hợp lệ")
                .data(voucher)
                .build());
    }
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<VoucherResponse>>> getActiveVouchers(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long categoryId
    ) {
        // Find all active vouchers, then filter by product/category if provided
        org.springframework.data.domain.Page<VoucherResponse> page = voucherService.search(null, null, true, 0, 100);
        java.util.List<VoucherResponse> activeVouchers = page.getContent();
        
        if (productId != null || categoryId != null) {
            activeVouchers = activeVouchers.stream().filter(v -> {
                if (v.getScopeType() == uth.nhathuy.Voucher.entity.VoucherScopeType.GLOBAL) return true;
                if (v.getScopeType() == uth.nhathuy.Voucher.entity.VoucherScopeType.PRODUCT && productId != null) {
                    return v.getProductIds() != null && v.getProductIds().contains(productId);
                }
                if (v.getScopeType() == uth.nhathuy.Voucher.entity.VoucherScopeType.CATEGORY && categoryId != null) {
                    return v.getCategoryIds() != null && v.getCategoryIds().contains(categoryId);
                }
                if (v.getScopeType() == uth.nhathuy.Voucher.entity.VoucherScopeType.MIXED) {
                    boolean productMatch = productId != null && v.getProductIds() != null && v.getProductIds().contains(productId);
                    boolean categoryMatch = categoryId != null && v.getCategoryIds() != null && v.getCategoryIds().contains(categoryId);
                    return productMatch || categoryMatch;
                }
                return false;
            }).toList();
        }
        
        return ResponseEntity.ok(ApiResponse.<java.util.List<VoucherResponse>>builder()
                .message("Lấy danh sách voucher thành công")
                .data(activeVouchers)
                .build());
    }
}
