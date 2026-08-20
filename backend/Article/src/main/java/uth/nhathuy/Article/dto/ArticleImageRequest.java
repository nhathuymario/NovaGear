package uth.nhathuy.Article.dto;

import lombok.Data;

@Data
public class ArticleImageRequest {
    private String imageUrl;
    private String caption;
    private Integer displayOrder;
}
