package uth.nhathuy.Article.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uth.nhathuy.Article.model.Article;

import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, String> {
    Optional<Article> findBySlug(String slug);
    Page<Article> findByCategory(String category, Pageable pageable);
    Page<Article> findByStatus(String status, Pageable pageable);
    Page<Article> findByCategoryAndStatus(String category, String status, Pageable pageable);
}
