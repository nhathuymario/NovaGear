package uth.nhathuy.Inventory.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uth.nhathuy.Inventory.entity.Inventory;
import uth.nhathuy.Inventory.entity.InventoryStatus;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByVariantId(Long variantId);

    @Query("""
                select i from Inventory i
                where (:status is null or i.status = :status)
                  and (:keywordId is null or i.productId = :keywordId or i.variantId = :keywordId)
            """)
    Page<Inventory> search(
            @Param("keywordId") Long keywordId,
            @Param("status") InventoryStatus status,
            Pageable pageable
    );
}