package uth.nhathuy.Inventory.repository;

import uth.nhathuy.Inventory.entity.Inventory;
import uth.nhathuy.Inventory.entity.InventoryStatus;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByVariantId(Long variantId);

    @Query("""
        select i from Inventory i
        where (:keyword is null
               or cast(i.productId as string) like concat('%', :keyword, '%')
               or cast(i.variantId as string) like concat('%', :keyword, '%'))
          and (:status is null or i.status = :status)
    """)
    Page<Inventory> search(
            @Param("keyword") String keyword,
            @Param("status") InventoryStatus status,
            Pageable pageable
    );
}