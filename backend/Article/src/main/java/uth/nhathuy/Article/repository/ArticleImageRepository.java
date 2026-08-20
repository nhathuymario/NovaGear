package uth.nhathuy.Article.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uth.nhathuy.Article.model.ArticleImage;

@Repository
public interface ArticleImageRepository extends JpaRepository<ArticleImage, Long> {
}
