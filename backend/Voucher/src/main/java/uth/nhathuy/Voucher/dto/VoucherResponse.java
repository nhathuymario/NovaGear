package uth.nhathuy.Voucher.dto;

import uth.nhathuy.Voucher.entity.DiscountType;
import uth.nhathuy.Voucher.entity.VoucherScopeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minimumOrderValue;
    private BigDecimal maximumDiscountAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer remainingUsage;
    private Integer userUsageLimit;
    private Boolean active;
    private VoucherScopeType scopeType;
    private List<Long> productIds;
    private List<Long> categoryIds;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
