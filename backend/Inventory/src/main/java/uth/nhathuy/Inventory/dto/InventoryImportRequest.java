package uth.nhathuy.Inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryImportRequest {

    @NotNull
    private Long productId;

    @NotNull
    private Long variantId;

    @NotNull
    @Min(1)
    private Integer quantity;

    @Min(0)
    private Integer lowStockThreshold;

    private String note;
}