// gọi InventoryExportRequest

package uth.nhathuy.Order.dto;

public record InventoryExportRequest(
        Long variantId,
        Integer quantity,
        String note
) {
}