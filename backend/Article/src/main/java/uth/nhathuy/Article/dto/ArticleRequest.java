package uth.nhathuy.Article.dto;

import lombok.Data;
import java.util.List;

@Data
public class ArticleRequest {
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String coverImageUrl;
    private String category;
    private List<String> tags;
    private String status;
    private String author;
    private List<ArticleImageRequest> images;
}
