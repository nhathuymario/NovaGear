package uth.nhathuy.Product.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductReviewOverviewResponse {
    private ProductReviewSummaryResponse summary;
    private List<ProductReviewResponse> reviews;
}

