package uth.nhathuy.Product.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import uth.nhathuy.Product.entity.*;
import uth.nhathuy.Product.repository.*;

import java.math.BigDecimal;
import java.util.List;

@Component
@Profile("seed")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductSpecificationRepository specificationRepository;
    private final ProductImageRepository imageRepository;

    @Override
    public void run(String... args) {
        Category laptop = upsertCategory("Laptop", "laptop", true);
        Category smartphone = upsertCategory("Dien thoai", "dien-thoai", true);
        Category monitor = upsertCategory("Man hinh", "man-hinh", true);
        Category accessories = upsertCategory("Phu kien", "phu-kien", true);

        Product macbook = upsertProduct(
                "MacBook Air M3 13 inch",
                "macbook-air-m3-13",
                "Apple",
                laptop,
                "Laptop sieu nhe cho hoc tap va cong viec",
                "MacBook Air M3 13 inch vo nhom, pin ben, man hinh dep va hieu nang tot cho nhu cau hieu suat cao.",
                "/product-placeholder.svg",
                ProductStatus.ACTIVE,
                true
        );
        upsertVariant(macbook, "MBA-M3-8-256", "Midnight", "8GB", "256GB", "Base", "27990000", "25990000", 40, "/product-placeholder.svg", VariantStatus.ACTIVE);
        upsertVariant(macbook, "MBA-M3-16-512", "Silver", "16GB", "512GB", "Premium", "34990000", "32990000", 24, "/product-placeholder.svg", VariantStatus.ACTIVE);
        seedSpecificationsIfMissing(macbook, List.of(
                spec(macbook, "Hieu nang", "CPU", "Apple M3", 1),
                spec(macbook, "Hieu nang", "RAM", "8GB/16GB", 2),
                spec(macbook, "Man hinh", "Kich thuoc", "13.6 inch Liquid Retina", 3),
                spec(macbook, "Pin", "Thoi luong", "Den 18 gio", 4)
        ));
        seedImagesIfMissing(macbook, List.of(
                image(macbook, "/product-placeholder.svg", true, 1),
                image(macbook, "/product-placeholder.svg", false, 2)
        ));

        Product rog = upsertProduct(
                "ASUS ROG Zephyrus G14",
                "asus-rog-zephyrus-g14",
                "ASUS",
                laptop,
                "Laptop gaming gon nhe, man dep",
                "ROG Zephyrus G14 toi uu cho gaming va sang tao noi dung voi GPU manh me, tan nhiet tot.",
                "/product-placeholder.svg",
                ProductStatus.ACTIVE,
                true
        );
        upsertVariant(rog, "ROG-G14-16-1TB", "Moonlight White", "16GB", "1TB", "RTX 4060", "45990000", "42990000", 18, "/product-placeholder.svg", VariantStatus.ACTIVE);
        upsertVariant(rog, "ROG-G14-32-1TB", "Eclipse Gray", "32GB", "1TB", "RTX 4070", "54990000", null, 8, "/product-placeholder.svg", VariantStatus.ACTIVE);
        seedSpecificationsIfMissing(rog, List.of(
                spec(rog, "Hieu nang", "CPU", "AMD Ryzen 9", 1),
                spec(rog, "Hieu nang", "GPU", "NVIDIA RTX 4060/4070", 2),
                spec(rog, "Man hinh", "Tan so quet", "165Hz", 3),
                spec(rog, "Khoi luong", "Can nang", "1.65kg", 4)
        ));
        seedImagesIfMissing(rog, List.of(
                image(rog, "/product-placeholder.svg", true, 1),
                image(rog, "/product-placeholder.svg", false, 2)
        ));

        Product iphone = upsertProduct(
                "iPhone 15 Pro Max",
                "iphone-15-pro-max",
                "Apple",
                smartphone,
                "Flagship camera va hieu nang cao",
                "iPhone 15 Pro Max khung titan, camera zoom 5x va chip A17 Pro cho trai nghiem cao cap.",
                "/product-placeholder.svg",
                ProductStatus.ACTIVE,
                true
        );
        upsertVariant(iphone, "IP15PM-256-TN", "Titan Tu Nhien", "8GB", "256GB", "Standard", "33990000", "31990000", 36, "/product-placeholder.svg", VariantStatus.ACTIVE);
        upsertVariant(iphone, "IP15PM-512-BL", "Titan Xanh", "8GB", "512GB", "Pro Storage", "39990000", null, 16, "/product-placeholder.svg", VariantStatus.ACTIVE);
        seedSpecificationsIfMissing(iphone, List.of(
                spec(iphone, "Camera", "Camera chinh", "48MP", 1),
                spec(iphone, "Man hinh", "Do sang", "2000 nits", 2),
                spec(iphone, "Pin", "Sac nhanh", "USB-C", 3),
                spec(iphone, "Hieu nang", "Chip", "A17 Pro", 4)
        ));
        seedImagesIfMissing(iphone, List.of(
                image(iphone, "/product-placeholder.svg", true, 1),
                image(iphone, "/product-placeholder.svg", false, 2)
        ));

        Product monitorProduct = upsertProduct(
                "LG UltraFine 27 inch 4K",
                "lg-ultrafine-27-4k",
                "LG",
                monitor,
                "Man hinh 4K cho cong viec sang tao",
                "Man hinh LG UltraFine 27 inch 4K voi mau sac chuan va ket noi da dang cho workstation.",
                "/product-placeholder.svg",
                ProductStatus.ACTIVE,
                false
        );
        upsertVariant(monitorProduct, "LG-UF27-4K", "Den", "-", "-", "27 inch", "11990000", "9990000", 20, "/product-placeholder.svg", VariantStatus.ACTIVE);
        upsertVariant(monitorProduct, "LG-UF32-4K", "Den", "-", "-", "32 inch", "14990000", null, 10, "/product-placeholder.svg", VariantStatus.ACTIVE);
        seedSpecificationsIfMissing(monitorProduct, List.of(
                spec(monitorProduct, "Thong so", "Do phan giai", "4K UHD", 1),
                spec(monitorProduct, "Thong so", "Tam nen", "IPS", 2),
                spec(monitorProduct, "Ket noi", "Cong", "HDMI/DisplayPort/USB-C", 3)
        ));
        seedImagesIfMissing(monitorProduct, List.of(
                image(monitorProduct, "/product-placeholder.svg", true, 1),
                image(monitorProduct, "/product-placeholder.svg", false, 2)
        ));

        Product keyboard = upsertProduct(
                "Keychron K2 Wireless",
                "keychron-k2-wireless",
                "Keychron",
                accessories,
                "Ban phim co khong day da nen tang",
                "Keychron K2 layout gon, ho tro bluetooth va hot-swap, phu hop cho ca macOS va Windows.",
                "/product-placeholder.svg",
                ProductStatus.ACTIVE,
                false
        );
        upsertVariant(keyboard, "K2-BROWN", "Xam", "-", "-", "Brown Switch", "2290000", "1990000", 55, "/product-placeholder.svg", VariantStatus.ACTIVE);
        seedSpecificationsIfMissing(keyboard, List.of(
                spec(keyboard, "Ket noi", "Bluetooth", "Bluetooth 5.1", 1),
                spec(keyboard, "Pin", "Dung luong", "4000mAh", 2),
                spec(keyboard, "Switch", "Loai", "Gateron Brown", 3)
        ));
        seedImagesIfMissing(keyboard, List.of(
                image(keyboard, "/product-placeholder.svg", true, 1)
        ));
    }

    private Category upsertCategory(String name, String slug, boolean active) {
        return categoryRepository.findBySlug(slug)
                .map(existing -> {
                    existing.setName(name);
                    existing.setActive(active);
                    return categoryRepository.save(existing);
                })
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name(name)
                        .slug(slug)
                        .active(active)
                        .build()));
    }

    private Product upsertProduct(
            String name,
            String slug,
            String brand,
            Category category,
            String shortDescription,
            String description,
            String thumbnail,
            ProductStatus status,
            boolean featured
    ) {
        return productRepository.findBySlug(slug)
                .map(existing -> {
                    existing.setName(name);
                    existing.setBrand(brand);
                    existing.setCategory(category);
                    existing.setShortDescription(shortDescription);
                    existing.setDescription(description);
                    existing.setThumbnail(thumbnail);
                    existing.setStatus(status);
                    existing.setFeatured(featured);
                    return productRepository.save(existing);
                })
                .orElseGet(() -> productRepository.save(Product.builder()
                        .name(name)
                        .slug(slug)
                        .brand(brand)
                        .category(category)
                        .shortDescription(shortDescription)
                        .description(description)
                        .thumbnail(thumbnail)
                        .status(status)
                        .featured(featured)
                        .build()));
    }

    private void upsertVariant(
            Product product,
            String sku,
            String color,
            String ram,
            String storage,
            String versionName,
            String price,
            String salePrice,
            int stockQuantity,
            String imageUrl,
            VariantStatus status
    ) {
        variantRepository.findBySku(sku)
                .map(existing -> {
                    existing.setProduct(product);
                    existing.setColor(color);
                    existing.setRam(ram);
                    existing.setStorage(storage);
                    existing.setVersionName(versionName);
                    existing.setPrice(new BigDecimal(price));
                    existing.setSalePrice(salePrice == null ? null : new BigDecimal(salePrice));
                    existing.setStockQuantity(stockQuantity);
                    existing.setImageUrl(imageUrl);
                    existing.setStatus(status);
                    return variantRepository.save(existing);
                })
                .orElseGet(() -> variantRepository.save(ProductVariant.builder()
                        .product(product)
                        .sku(sku)
                        .color(color)
                        .ram(ram)
                        .storage(storage)
                        .versionName(versionName)
                        .price(new BigDecimal(price))
                        .salePrice(salePrice == null ? null : new BigDecimal(salePrice))
                        .stockQuantity(stockQuantity)
                        .imageUrl(imageUrl)
                        .status(status)
                        .build()));
    }

    private void seedSpecificationsIfMissing(Product product, List<ProductSpecification> specifications) {
        if (!specificationRepository.findByProductIdOrderByGroupNameAscSortOrderAscIdAsc(product.getId()).isEmpty()) {
            return;
        }
        specificationRepository.saveAll(specifications);
    }

    private void seedImagesIfMissing(Product product, List<ProductImage> images) {
        if (!imageRepository.findByProductIdOrderBySortOrderAscIdAsc(product.getId()).isEmpty()) {
            return;
        }
        imageRepository.saveAll(images);
    }

    private ProductSpecification spec(Product product, String group, String key, String value, int order) {
        return ProductSpecification.builder()
                .product(product)
                .groupName(group)
                .specKey(key)
                .specValue(value)
                .sortOrder(order)
                .build();
    }

    private ProductImage image(Product product, String imageUrl, boolean thumbnail, int sortOrder) {
        return ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .thumbnail(thumbnail)
                .sortOrder(sortOrder)
                .build();
    }
}


