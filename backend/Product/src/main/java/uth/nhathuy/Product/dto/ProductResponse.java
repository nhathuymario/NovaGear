package uth.nhathuy.Product.dto;

import uth.nhathuy.Product.entity.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String brand;
    private CategoryResponse category;
    private String shortDescription;
    private String description;
    private String thumbnail;
    private ProductStatus status;
    private Boolean featured;
    private List<ProductVariantResponse> variants;
    private List<ProductSpecificationResponse> specifications;
    private List<ProductImageResponse> images;
}