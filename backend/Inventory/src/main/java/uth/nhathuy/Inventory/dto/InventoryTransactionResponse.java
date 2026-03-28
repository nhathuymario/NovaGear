package uth.nhathuy.Inventory.dto;

import uth.nhathuy.Inventory.entity.InventoryTransactionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InventoryTransactionResponse {
    private Long id;
    private Long inventoryId;
    private Long productId;
    private Long variantId;
    private InventoryTransactionType type;
    private Integer quantity;
    private String note;
    private LocalDateTime createdAt;
}