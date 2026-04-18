package uth.nhathuy.Product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uth.nhathuy.Product.entity.ProductReview;

import java.util.List;
import java.util.Optional;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    List<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId);

    Optional<ProductReview> findByProductIdAndUserId(Long productId, Long userId);
}

