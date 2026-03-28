package uth.nhathuy.Inventory.dto;

import uth.nhathuy.Inventory.entity.InventoryStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryResponse {
    private Long id;
    private Long productId;
    private Long variantId;
    private Integer availableQuantity;
    private Integer reservedQuantity;
    private Integer sellableQuantity;
    private Integer lowStockThreshold;
    private InventoryStatus status;
}