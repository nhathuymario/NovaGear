package uth.nhathuy.Product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductReviewReplyRequest {
    @NotBlank
    private String reply;
}
