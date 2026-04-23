package uth.nhathuy.Product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductImageRequest {

    @NotBlank
    private String imageUrl;

    private Long variantId;

    private Boolean thumbnail;
    private Integer sortOrder;
}