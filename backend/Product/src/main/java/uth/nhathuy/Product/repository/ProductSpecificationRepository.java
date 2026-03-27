package uth.nhathuy.Product.repository;

import uth.nhathuy.Product.entity.ProductSpecification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductSpecificationRepository extends JpaRepository<ProductSpecification, Long> {
    List<ProductSpecification> findByProductIdOrderByGroupNameAscSortOrderAscIdAsc(Long productId);
}