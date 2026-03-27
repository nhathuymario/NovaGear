package uth.nhathuy.Product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false, unique = true, length = 120)
    private String sku;

    @Column(length = 100)
    private String color;

    @Column(length = 50)
    private String ram;

    @Column(length = 50)
    private String storage;

    @Column(length = 50)
    private String versionName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(precision = 15, scale = 2)
    private BigDecimal salePrice;

    @Builder.Default
    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @Column(length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private VariantStatus status = VariantStatus.ACTIVE;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}