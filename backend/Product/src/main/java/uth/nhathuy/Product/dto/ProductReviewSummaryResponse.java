package uth.nhathuy.Product.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductReviewSummaryResponse {
    private Double averageRating;
    private Long totalReviews;
    private Long fiveStar;
    private Long fourStar;
    private Long threeStar;
    private Long twoStar;
    private Long oneStar;
}

