package uth.nhathuy.Article.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ArticleResponse {
    private String id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String coverImageUrl;
    private String category;
    private List<String> tags;
    private String status;
    private String author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ArticleImageResponse> images;
}
