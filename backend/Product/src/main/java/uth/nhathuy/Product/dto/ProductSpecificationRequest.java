package uth.nhathuy.Product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductSpecificationRequest {

    @NotBlank
    private String groupName;

    @NotBlank
    private String specKey;

    @NotBlank
    private String specValue;

    private Integer sortOrder;
}