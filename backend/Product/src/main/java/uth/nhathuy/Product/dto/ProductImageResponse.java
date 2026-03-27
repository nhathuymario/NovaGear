package uth.nhathuy.Product.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private Boolean thumbnail;
    private Integer sortOrder;
}