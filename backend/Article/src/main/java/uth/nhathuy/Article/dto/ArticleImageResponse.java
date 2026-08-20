package uth.nhathuy.Article.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ArticleImageResponse {
    private Long id;
    private String imageUrl;
    private String caption;
    private Integer displayOrder;
}
