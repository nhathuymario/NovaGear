package uth.nhathuy.Product.repository;

import uth.nhathuy.Product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderBySortOrderAscIdAsc(Long productId);
    List<ProductImage> findByProductIdAndVariantIsNullOrderBySortOrderAscIdAsc(Long productId);
    List<ProductImage> findByProductIdAndVariantIdOrderBySortOrderAscIdAsc(Long productId, Long variantId);
    List<ProductImage> findByProductIdAndVariantIdAndThumbnailTrueOrderBySortOrderAscIdAsc(Long productId, Long variantId);
}