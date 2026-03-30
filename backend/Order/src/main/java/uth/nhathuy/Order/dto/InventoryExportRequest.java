// gọi InventoryExportRequest

package uth.nhathuy.Order.dto;

public record InventoryExportRequest(
        Long productId,
        Long variantId,
        Integer quantity,
        String note
) {
}