package uth.nhathuy.Inventory.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import uth.nhathuy.Inventory.entity.Inventory;
import uth.nhathuy.Inventory.entity.InventoryStatus;
import uth.nhathuy.Inventory.entity.InventoryTransaction;
import uth.nhathuy.Inventory.entity.InventoryTransactionType;
import uth.nhathuy.Inventory.repository.InventoryRepository;
import uth.nhathuy.Inventory.repository.InventoryTransactionRepository;

import java.util.ArrayList;
import java.util.List;

@Component
@Profile("seed")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;

    @Override
    public void run(String... args) {
        if (inventoryRepository.count() > 0) {
            return;
        }

        List<Inventory> inventories = new ArrayList<>();
        inventories.add(buildInventory(1L, 1L, 40, 2, 5));
        inventories.add(buildInventory(1L, 2L, 24, 1, 5));
        inventories.add(buildInventory(2L, 3L, 18, 1, 5));
        inventories.add(buildInventory(2L, 4L, 8, 0, 5));
        inventories.add(buildInventory(3L, 5L, 36, 3, 5));
        inventories.add(buildInventory(3L, 6L, 16, 1, 5));
        inventories.add(buildInventory(4L, 7L, 20, 0, 5));
        inventories.add(buildInventory(4L, 8L, 10, 0, 5));
        inventories.add(buildInventory(5L, 9L, 55, 4, 5));

        List<Inventory> saved = inventoryRepository.saveAll(inventories);

        List<InventoryTransaction> transactions = saved.stream()
                .map(item -> InventoryTransaction.builder()
                        .inventoryId(item.getId())
                        .productId(item.getProductId())
                        .variantId(item.getVariantId())
                        .type(InventoryTransactionType.IMPORT)
                        .quantity(item.getAvailableQuantity())
                        .note("Seed initial stock")
                        .build())
                .toList();

        transactionRepository.saveAll(transactions);
    }

    private Inventory buildInventory(Long productId, Long variantId, int available, int reserved, int threshold) {
        return Inventory.builder()
                .productId(productId)
                .variantId(variantId)
                .availableQuantity(available)
                .reservedQuantity(reserved)
                .lowStockThreshold(threshold)
                .status(resolveStatus(available, threshold))
                .build();
    }

    private InventoryStatus resolveStatus(int availableQuantity, int threshold) {
        if (availableQuantity <= 0) {
            return InventoryStatus.OUT_OF_STOCK;
        }
        if (availableQuantity <= threshold) {
            return InventoryStatus.LOW_STOCK;
        }
        return InventoryStatus.IN_STOCK;
    }
}


