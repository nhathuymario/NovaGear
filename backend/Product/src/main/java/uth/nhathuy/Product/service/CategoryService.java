package uth.nhathuy.Product.service;

import uth.nhathuy.Product.dto.CategoryRequest;
import uth.nhathuy.Product.dto.CategoryResponse;
import uth.nhathuy.Product.entity.Category;
import uth.nhathuy.Product.exception.BadRequestException;
import uth.nhathuy.Product.exception.ResourceNotFoundException;
import uth.nhathuy.Product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getPublicCategories() {
        return categoryRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug category đã tồn tại");
        }

        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException("Tên category đã tồn tại");
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return mapToResponse(categoryRepository.save(category));
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category"));

        if (!category.getSlug().equals(request.getSlug()) && categoryRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug category đã tồn tại");
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setActive(request.getActive() != null ? request.getActive() : category.getActive());

        return mapToResponse(categoryRepository.save(category));
    }

    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category"));
        categoryRepository.delete(category);
    }

    public Category getEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category"));
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .active(category.getActive())
                .build();
    }
}