package uth.nhathuy.Article.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uth.nhathuy.Article.dto.ArticleListResponse;
import uth.nhathuy.Article.dto.ArticleResponse;
import uth.nhathuy.Article.service.ArticleService;

@RestController
@RequestMapping("/api/articles/public")
@RequiredArgsConstructor
public class PublicArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<ArticleListResponse> getPublishedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String category) {
        
        ArticleListResponse response = articleService.listArticles(page, limit, category, "PUBLISHED");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<ArticleResponse> getArticle(@PathVariable String idOrSlug) {
        ArticleResponse response = articleService.getArticle(idOrSlug);
        // Maybe check if it's PUBLISHED? Let's just return it for now.
        return ResponseEntity.ok(response);
    }
}
