package uth.nhathuy.Voucher.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(
    name = "vouchers",
    indexes = {
        @Index(name = "idx_vouchers_code", columnList = "code", unique = true),
        @Index(name = "idx_vouchers_active", columnList = "active"),
        @Index(name = "idx_vouchers_scope_type", columnList = "scope_type")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String code;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "minimum_order_value", precision = 14, scale = 2)
    private BigDecimal minimumOrderValue;

    @Column(name = "maximum_discount_amount", precision = 14, scale = 2)
    private BigDecimal maximumDiscountAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope_type", nullable = false, length = 20)
    @Builder.Default
    private VoucherScopeType scopeType = VoucherScopeType.GLOBAL;

    @Column(name = "product_ids_json", columnDefinition = "TEXT")
    private String productIdsJson;

    @Column(name = "category_ids_json", columnDefinition = "TEXT")
    private String categoryIdsJson;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "user_usage_limit")
    private Integer userUsageLimit;

    @Builder.Default
    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.systemDefault());

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now(ZoneId.systemDefault());

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (usedCount == null) {
            usedCount = 0;
        }
        if (active == null) {
            active = true;
        }
        if (scopeType == null) {
            scopeType = VoucherScopeType.GLOBAL;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now(ZoneId.systemDefault());
    }
}
