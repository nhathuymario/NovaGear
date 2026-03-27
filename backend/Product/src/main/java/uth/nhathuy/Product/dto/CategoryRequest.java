package uth.nhathuy.Product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    private Boolean active;
}