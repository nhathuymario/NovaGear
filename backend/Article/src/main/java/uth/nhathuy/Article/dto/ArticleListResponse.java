package uth.nhathuy.Article.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleListResponse {
    private List<ArticleResponse> items;
    private long total;
    private int page;
    private int limit;
}
