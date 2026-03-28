package uth.nhathuy.Inventory.controller;

import uth.nhathuy.Inventory.dto.*;
import uth.nhathuy.Inventory.entity.InventoryStatus;
import uth.nhathuy.Inventory.exception.BadRequestException;
import uth.nhathuy.Inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<Page<InventoryResponse>> search(
            @RequestHeader("X-Role") String role,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) InventoryStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(inventoryService.search(keyword, status, page, size));
    }

    @GetMapping("/variant/{variantId}")
    public ResponseEntity<InventoryResponse> getByVariant(
            @RequestHeader("X-Role") String role,
            @PathVariable Long variantId
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(inventoryService.getByVariantId(variantId));
    }

    @GetMapping("/variant/{variantId}/transactions")
    public ResponseEntity<List<InventoryTransactionResponse>> transactions(
            @RequestHeader("X-Role") String role,
            @PathVariable Long variantId
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(inventoryService.getTransactionsByVariantId(variantId));
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<InventoryResponse>> importStock(
            @RequestHeader("X-Role") String role,
            @Valid @RequestBody InventoryImportRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .message("Nhập kho thành công")
                .data(inventoryService.importStock(request))
                .build());
    }

    @PutMapping("/adjust")
    public ResponseEntity<ApiResponse<InventoryResponse>> adjustStock(
            @RequestHeader("X-Role") String role,
            @Valid @RequestBody InventoryAdjustRequest request
    ) {
        requireAdmin(role);
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .message("Điều chỉnh tồn kho thành công")
                .data(inventoryService.adjustStock(request))
                .build());
    }

    private void requireAdmin(String role) {
        if (role == null || !role.contains("ROLE_ADMIN")) {
            throw new BadRequestException("Bạn không có quyền ADMIN");
        }
    }
}