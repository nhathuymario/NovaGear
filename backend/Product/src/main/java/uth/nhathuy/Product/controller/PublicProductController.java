package uth.nhathuy.Product.controller;

import uth.nhathuy.Product.dto.*;
import uth.nhathuy.Product.service.CategoryService;
import uth.nhathuy.Product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/public")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(productService.publicSearch(keyword, categoryId, page, size));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> getDetail(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getPublicDetailBySlug(slug));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getPublicCategories());
    }
}