package uth.nhathuy.Product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_specifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false, length = 120)
    private String groupName;

    @Column(nullable = false, length = 180)
    private String specKey;

    @Column(nullable = false, length = 1000)
    private String specValue;

    @Builder.Default
    @Column(nullable = false)
    private Integer sortOrder = 0;
}