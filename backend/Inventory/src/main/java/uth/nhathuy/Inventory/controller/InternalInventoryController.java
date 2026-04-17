package uth.nhathuy.Inventory.controller;

import uth.nhathuy.Inventory.dto.*;
import uth.nhathuy.Inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/internal")
@RequiredArgsConstructor
public class InternalInventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/variant/{variantId}")
    public ResponseEntity<InventoryResponse> getByVariant(@PathVariable Long variantId) {
        return ResponseEntity.ok(inventoryService.getByVariantIdOrCreate(variantId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<ApiResponse<InventoryResponse>> reserve(
            @Valid @RequestBody ReserveStockRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .message("Reserve stock thành công")
                .data(inventoryService.reserveStock(request))
                .build());
    }

    @PostMapping("/release")
    public ResponseEntity<ApiResponse<InventoryResponse>> release(
            @Valid @RequestBody ReleaseStockRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .message("Release stock thành công")
                .data(inventoryService.releaseStock(request))
                .build());
    }

    @PostMapping("/deduct")
    public ResponseEntity<ApiResponse<InventoryResponse>> deduct(
            @Valid @RequestBody DeductStockRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .message("Deduct stock thành công")
                .data(inventoryService.deductStock(request))
                .build());
    }
}