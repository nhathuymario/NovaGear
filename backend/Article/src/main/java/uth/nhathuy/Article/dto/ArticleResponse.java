package uth.nhathuy.Article.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("cover_image_url")
    private String coverImageUrl;
    private String category;
    private List<String> tags;
    private String status;
    private String author;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    private List<ArticleImageResponse> images;
}
