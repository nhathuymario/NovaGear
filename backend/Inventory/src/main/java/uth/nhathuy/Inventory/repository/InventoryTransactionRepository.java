package uth.nhathuy.Inventory.repository;

import uth.nhathuy.Inventory.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByVariantIdOrderByIdDesc(Long variantId);
    List<InventoryTransaction> findByInventoryIdOrderByIdDesc(Long inventoryId);
}