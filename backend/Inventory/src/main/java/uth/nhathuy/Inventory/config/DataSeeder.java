package uth.nhathuy.Inventory.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
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
@Slf4j
@RequiredArgsConstructor
@Transactional
public class DataSeeder implements CommandLineRunner {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;

    @Override
    public void run(String... args) {
        try {
            log.info("Starting data seeding for Inventory service...");
            List<Inventory> seeded = new ArrayList<>();
        seeded.add(upsertInventory(1L, 1L, 40, 2, 5));
        seeded.add(upsertInventory(1L, 2L, 24, 1, 5));
        seeded.add(upsertInventory(2L, 3L, 18, 1, 5));
        seeded.add(upsertInventory(2L, 4L, 8, 0, 5));
        seeded.add(upsertInventory(3L, 5L, 36, 3, 5));
        seeded.add(upsertInventory(3L, 6L, 16, 1, 5));
        seeded.add(upsertInventory(4L, 7L, 20, 0, 5));
        seeded.add(upsertInventory(4L, 8L, 10, 0, 5));
        seeded.add(upsertInventory(5L, 9L, 55, 4, 5));

            seedInitialImportTransactionsIfMissing(seeded);
            log.info("Data seeding completed successfully for Inventory service!");
        } catch (Exception e) {
            log.error("Error during data seeding for Inventory service: ", e);
        }
    }

    private Inventory upsertInventory(Long productId, Long variantId, int available, int reserved, int threshold) {
        return inventoryRepository.findByVariantId(variantId)
                .map(existing -> {
                    existing.setProductId(productId);
                    existing.setAvailableQuantity(available);
                    existing.setReservedQuantity(reserved);
                    existing.setLowStockThreshold(threshold);
                    existing.setStatus(resolveStatus(available, threshold));
                    return inventoryRepository.save(existing);
                })
                .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                        .productId(productId)
                        .variantId(variantId)
                        .availableQuantity(available)
                        .reservedQuantity(reserved)
                        .lowStockThreshold(threshold)
                        .status(resolveStatus(available, threshold))
                        .build()));
    }

    private void seedInitialImportTransactionsIfMissing(List<Inventory> inventories) {
        for (Inventory item : inventories) {
            if (!transactionRepository.findByInventoryIdOrderByIdDesc(item.getId()).isEmpty()) {
                continue;
            }

            transactionRepository.save(InventoryTransaction.builder()
                    .inventoryId(item.getId())
                    .productId(item.getProductId())
                    .variantId(item.getVariantId())
                    .type(InventoryTransactionType.IMPORT)
                    .quantity(item.getAvailableQuantity())
                    .note("Seed initial stock")
                    .build());
        }
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


