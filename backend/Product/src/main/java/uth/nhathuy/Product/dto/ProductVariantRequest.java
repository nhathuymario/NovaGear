package uth.nhathuy.Product.dto;

import uth.nhathuy.Product.entity.VariantStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductVariantRequest {

    @NotBlank
    private String sku;

    private String color;
    private String ram;
    private String storage;
    private String versionName;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal price;

    @DecimalMin("0.0")
    private BigDecimal salePrice;

    @NotNull
    @Min(0)
    private Integer stockQuantity;

    private String imageUrl;
    private VariantStatus status;
}