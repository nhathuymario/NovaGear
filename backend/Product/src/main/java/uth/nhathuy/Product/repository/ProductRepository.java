package uth.nhathuy.Product.repository;

import uth.nhathuy.Product.entity.Product;
import uth.nhathuy.Product.entity.ProductStatus;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = {"category"})
    @Query("""
        select p from Product p
        where (:keyword is null or lower(p.name) like lower(concat('%', :keyword, '%'))
               or lower(p.brand) like lower(concat('%', :keyword, '%')))
          and (:categoryId is null or p.category.id = :categoryId)
          and (:status is null or p.status = :status)
    """)
    Page<Product> search(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("status") ProductStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"category"})
    @Query("""
        select p from Product p
        where p.status = uth.nhathuy.Product.entity.ProductStatus.ACTIVE
          and (:keyword is null or lower(p.name) like lower(concat('%', :keyword, '%'))
               or lower(p.brand) like lower(concat('%', :keyword, '%')))
          and (:categoryId is null or p.category.id = :categoryId)
    """)
    Page<Product> searchPublic(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            Pageable pageable
    );
}