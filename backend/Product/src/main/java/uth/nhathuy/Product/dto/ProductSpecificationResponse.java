package uth.nhathuy.Product.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductSpecificationResponse {
    private Long id;
    private String groupName;
    private String specKey;
    private String specValue;
    private Integer sortOrder;
}