package uth.nhathuy.Product.service;

import uth.nhathuy.Product.dto.*;
import uth.nhathuy.Product.entity.*;
import uth.nhathuy.Product.exception.BadRequestException;
import uth.nhathuy.Product.exception.ResourceNotFoundException;
import uth.nhathuy.Product.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductSpecificationRepository specificationRepository;
    private final ProductImageRepository imageRepository;
    private final CategoryService categoryService;

    public Page<ProductResponse> publicSearch(String keyword, Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return productRepository.searchPublic(buildKeywordPattern(keyword), categoryId, pageable)
                .map(this::mapToResponse);
    }

    public Page<ProductResponse> adminSearch(String keyword, Long categoryId, ProductStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return productRepository.search(buildKeywordPattern(keyword), categoryId, status, pageable)
                .map(this::mapToResponse);
    }

    public ProductResponse getPublicDetailBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm");
        }

        return mapToResponse(product);
    }

    public ProductResponse getAdminDetail(Long id) {
        Product product = getProduct(id);
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug sản phẩm đã tồn tại");
        }

        Category category = categoryService.getEntity(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .brand(request.getBrand())
                .category(category)
                .shortDescription(request.getShortDescription())
                .description(request.getDescription())
                .thumbnail(request.getThumbnail())
                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.DRAFT)
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = getProduct(id);

        if (!product.getSlug().equals(request.getSlug()) && productRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug sản phẩm đã tồn tại");
        }

        Category category = categoryService.getEntity(request.getCategoryId());

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setBrand(request.getBrand());
        product.setCategory(category);
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setThumbnail(request.getThumbnail());
        product.setStatus(request.getStatus() != null ? request.getStatus() : product.getStatus());
        product.setFeatured(request.getFeatured() != null ? request.getFeatured() : product.getFeatured());
        product.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProduct(id);
        productRepository.delete(product);
    }

    @Transactional
    public ProductVariantResponse addVariant(Long productId, ProductVariantRequest request) {
        Product product = getProduct(productId);

        if (variantRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("SKU đã tồn tại");
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(request.getSku())
                .color(request.getColor())
                .ram(request.getRam())
                .storage(request.getStorage())
                .versionName(request.getVersionName())
                .price(request.getPrice())
                .salePrice(request.getSalePrice())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .imageUrl(request.getImageUrl())
                .status(request.getStatus() != null ? request.getStatus() : VariantStatus.ACTIVE)
                .build();

        return mapVariant(variantRepository.save(variant));
    }

    @Transactional
    public ProductVariantResponse updateVariant(Long variantId, ProductVariantRequest request) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy variant"));

        if (!variant.getSku().equals(request.getSku()) && variantRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("SKU đã tồn tại");
        }

        variant.setSku(request.getSku());
        variant.setColor(request.getColor());
        variant.setRam(request.getRam());
        variant.setStorage(request.getStorage());
        variant.setVersionName(request.getVersionName());
        variant.setPrice(request.getPrice());
        variant.setSalePrice(request.getSalePrice());
        variant.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : variant.getStockQuantity());
        variant.setImageUrl(request.getImageUrl());
        variant.setStatus(request.getStatus() != null ? request.getStatus() : variant.getStatus());

        return mapVariant(variantRepository.save(variant));
    }

    @Transactional
    public void deleteVariant(Long variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy variant"));
        variantRepository.delete(variant);
    }

    @Transactional
    public ProductSpecificationResponse addSpecification(Long productId, ProductSpecificationRequest request) {
        Product product = getProduct(productId);

        ProductSpecification specification = ProductSpecification.builder()
                .product(product)
                .groupName(request.getGroupName())
                .specKey(request.getSpecKey())
                .specValue(request.getSpecValue())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        return mapSpecification(specificationRepository.save(specification));
    }

    @Transactional
    public ProductSpecificationResponse updateSpecification(Long specificationId, ProductSpecificationRequest request) {
        ProductSpecification specification = specificationRepository.findById(specificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy specification"));

        specification.setGroupName(request.getGroupName());
        specification.setSpecKey(request.getSpecKey());
        specification.setSpecValue(request.getSpecValue());
        specification.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        return mapSpecification(specificationRepository.save(specification));
    }

    @Transactional
    public void deleteSpecification(Long specificationId) {
        ProductSpecification specification = specificationRepository.findById(specificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy specification"));
        specificationRepository.delete(specification);
    }

    @Transactional
    public ProductImageResponse addImage(Long productId, ProductImageRequest request) {
        Product product = getProduct(productId);

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(request.getImageUrl())
                .thumbnail(request.getThumbnail() != null ? request.getThumbnail() : false)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        ProductImage saved = imageRepository.save(image);

        if (Boolean.TRUE.equals(saved.getThumbnail())) {
            product.setThumbnail(saved.getImageUrl());
            productRepository.save(product);
        }

        return mapImage(saved);
    }

    @Transactional
    public ProductImageResponse updateImage(Long imageId, ProductImageRequest request) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy image"));

        image.setImageUrl(request.getImageUrl());
        image.setThumbnail(request.getThumbnail() != null ? request.getThumbnail() : image.getThumbnail());
        image.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : image.getSortOrder());

        ProductImage saved = imageRepository.save(image);

        if (Boolean.TRUE.equals(saved.getThumbnail())) {
            Product product = saved.getProduct();
            product.setThumbnail(saved.getImageUrl());
            productRepository.save(product);
        }

        return mapImage(saved);
    }

    @Transactional
    public void deleteImage(Long imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy image"));
        imageRepository.delete(image);
    }

    private Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));
    }

    private String buildKeywordPattern(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        return "%" + keyword.trim().toLowerCase() + "%";
    }

    private ProductResponse mapToResponse(Product product) {
        List<ProductVariantResponse> variants = variantRepository.findByProductIdOrderByIdAsc(product.getId())
                .stream()
                .map(this::mapVariant)
                .toList();

        List<ProductSpecificationResponse> specifications =
                specificationRepository.findByProductIdOrderByGroupNameAscSortOrderAscIdAsc(product.getId())
                        .stream()
                        .map(this::mapSpecification)
                        .toList();

        List<ProductImageResponse> images = imageRepository.findByProductIdOrderBySortOrderAscIdAsc(product.getId())
                .stream()
                .map(this::mapImage)
                .toList();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .brand(product.getBrand())
                .category(CategoryResponse.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .slug(product.getCategory().getSlug())
                        .active(product.getCategory().getActive())
                        .build())
                .shortDescription(product.getShortDescription())
                .description(product.getDescription())
                .thumbnail(product.getThumbnail())
                .status(product.getStatus())
                .featured(product.getFeatured())
                .variants(variants)
                .specifications(specifications)
                .images(images)
                .build();
    }

    private ProductVariantResponse mapVariant(ProductVariant variant) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .productId(variant.getProduct().getId())
                .productName(variant.getProduct().getName())
                .sku(variant.getSku())
                .color(variant.getColor())
                .ram(variant.getRam())
                .storage(variant.getStorage())
                .versionName(variant.getVersionName())
                .price(variant.getPrice())
                .salePrice(variant.getSalePrice())
                .stockQuantity(variant.getStockQuantity())
                .imageUrl(variant.getImageUrl())
                .status(variant.getStatus())
                .build();
    }

    private ProductSpecificationResponse mapSpecification(ProductSpecification specification) {
        return ProductSpecificationResponse.builder()
                .id(specification.getId())
                .groupName(specification.getGroupName())
                .specKey(specification.getSpecKey())
                .specValue(specification.getSpecValue())
                .sortOrder(specification.getSortOrder())
                .build();
    }

    private ProductImageResponse mapImage(ProductImage image) {
        return ProductImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .thumbnail(image.getThumbnail())
                .sortOrder(image.getSortOrder())
                .build();
    }
}