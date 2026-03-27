package uth.nhathuy.Product.dto;

import uth.nhathuy.Product.entity.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    @NotBlank
    private String brand;

    @NotNull
    private Long categoryId;

    private String shortDescription;
    private String description;
    private String thumbnail;
    private ProductStatus status;
    private Boolean featured;
}