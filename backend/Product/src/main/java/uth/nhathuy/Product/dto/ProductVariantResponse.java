package uth.nhathuy.Product.dto;

import uth.nhathuy.Product.entity.VariantStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProductVariantResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private String color;
    private String ram;
    private String storage;
    private String versionName;
    private BigDecimal price;
    private BigDecimal salePrice;
    private Integer stockQuantity;
    private String imageUrl;
    private List<ProductImageResponse> images;
    private VariantStatus status;
}