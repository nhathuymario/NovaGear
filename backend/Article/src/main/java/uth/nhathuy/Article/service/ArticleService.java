package uth.nhathuy.Article.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import uth.nhathuy.Article.dto.ArticleListResponse;
import uth.nhathuy.Article.dto.ArticleRequest;
import uth.nhathuy.Article.dto.ArticleResponse;
import uth.nhathuy.Article.model.Article;
import uth.nhathuy.Article.model.ArticleImage;
import uth.nhathuy.Article.repository.ArticleRepository;
import uth.nhathuy.Article.dto.ArticleImageResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final ObjectMapper objectMapper;

    public ArticleResponse createArticle(ArticleRequest request) {
        Article article = new Article();
        article.setId(UUID.randomUUID().toString());
        article.setTitle(request.getTitle());
        article.setSlug(StringUtils.hasText(request.getSlug()) ? request.getSlug() : slugify(request.getTitle()));
        article.setSummary(request.getSummary());
        article.setContent(request.getContent());
        article.setCoverImageUrl(request.getCoverImageUrl());
        article.setCategory(request.getCategory());
        article.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        article.setAuthor(request.getAuthor() != null ? request.getAuthor() : "Admin");

        try {
            article.setTagsJson(objectMapper.writeValueAsString(request.getTags() != null ? request.getTags() : new ArrayList<>()));
        } catch (JsonProcessingException e) {
            article.setTagsJson("[]");
        }

        if (request.getImages() != null) {
            List<ArticleImage> images = request.getImages().stream().map(imgReq -> ArticleImage.builder()
                    .article(article)
                    .imageUrl(imgReq.getImageUrl())
                    .caption(imgReq.getCaption())
                    .displayOrder(imgReq.getDisplayOrder())
                    .build()).collect(Collectors.toList());
            article.setImages(images);
        }

        Article saved = articleRepository.save(article);
        return mapToResponse(saved);
    }

    public ArticleResponse updateArticle(String id, ArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        if (request.getTitle() != null) article.setTitle(request.getTitle());
        if (request.getSlug() != null) article.setSlug(request.getSlug());
        if (request.getSummary() != null) article.setSummary(request.getSummary());
        if (request.getContent() != null) article.setContent(request.getContent());
        if (request.getCoverImageUrl() != null) article.setCoverImageUrl(request.getCoverImageUrl());
        if (request.getCategory() != null) article.setCategory(request.getCategory());
        if (request.getStatus() != null) article.setStatus(request.getStatus());
        if (request.getAuthor() != null) article.setAuthor(request.getAuthor());
        if (request.getTags() != null) {
            try {
                article.setTagsJson(objectMapper.writeValueAsString(request.getTags()));
            } catch (JsonProcessingException e) {
                // ignore
            }
        }
        
        if (request.getImages() != null) {
            article.getImages().clear();
            List<ArticleImage> images = request.getImages().stream().map(imgReq -> ArticleImage.builder()
                    .article(article)
                    .imageUrl(imgReq.getImageUrl())
                    .caption(imgReq.getCaption())
                    .displayOrder(imgReq.getDisplayOrder())
                    .build()).collect(Collectors.toList());
            article.getImages().addAll(images);
        }

        Article updated = articleRepository.save(article);
        return mapToResponse(updated);
    }

    public void deleteArticle(String id) {
        articleRepository.deleteById(id);
    }

    public ArticleResponse getArticle(String idOrSlug) {
        Article article = articleRepository.findById(idOrSlug)
                .orElseGet(() -> articleRepository.findBySlug(idOrSlug)
                        .orElseThrow(() -> new RuntimeException("Article not found")));
        return mapToResponse(article);
    }

    public ArticleListResponse listArticles(int page, int limit, String category, String status) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("createdAt").descending());
        Page<Article> articlePage;

        if (StringUtils.hasText(category) && StringUtils.hasText(status)) {
            articlePage = articleRepository.findByCategoryAndStatus(category, status, pageable);
        } else if (StringUtils.hasText(category)) {
            articlePage = articleRepository.findByCategory(category, pageable);
        } else if (StringUtils.hasText(status)) {
            articlePage = articleRepository.findByStatus(status, pageable);
        } else {
            articlePage = articleRepository.findAll(pageable);
        }

        List<ArticleResponse> items = articlePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ArticleListResponse.builder()
                .items(items)
                .total(articlePage.getTotalElements())
                .page(page)
                .limit(limit)
                .build();
    }

    private ArticleResponse mapToResponse(Article article) {
        List<String> tags = new ArrayList<>();
        if (StringUtils.hasText(article.getTagsJson())) {
            try {
                tags = objectMapper.readValue(article.getTagsJson(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
            }
        }

        List<ArticleImageResponse> imageResponses = article.getImages() != null ? 
                article.getImages().stream().map(img -> ArticleImageResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .caption(img.getCaption())
                        .displayOrder(img.getDisplayOrder())
                        .build()).collect(Collectors.toList()) : new ArrayList<>();

        return ArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .summary(article.getSummary())
                .content(article.getContent())
                .coverImageUrl(article.getCoverImageUrl())
                .category(article.getCategory())
                .tags(tags)
                .images(imageResponses)
                .status(article.getStatus())
                .author(article.getAuthor())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }

    private String slugify(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }
}
