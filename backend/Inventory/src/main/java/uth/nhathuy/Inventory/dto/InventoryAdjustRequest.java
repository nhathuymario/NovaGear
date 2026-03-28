package uth.nhathuy.Inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryAdjustRequest {

    @NotNull
    private Long variantId;

    @NotNull
    @Min(0)
    private Integer availableQuantity;

    @NotNull
    @Min(0)
    private Integer reservedQuantity;

    @Min(0)
    private Integer lowStockThreshold;

    private String note;
}