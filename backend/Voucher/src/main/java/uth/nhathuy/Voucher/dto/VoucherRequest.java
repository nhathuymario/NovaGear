package uth.nhathuy.Voucher.dto;

import uth.nhathuy.Voucher.entity.DiscountType;
import uth.nhathuy.Voucher.entity.VoucherScopeType;
import jakarta.validation.constraints.*;
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
public class VoucherRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    @Size(min = 3, max = 60, message = "Mã voucher phải từ 3 đến 60 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "Mã voucher chỉ được chứa chữ, số, dấu - và _")
    private String code;

    @NotBlank(message = "Tên voucher không được để trống")
    @Size(max = 180, message = "Tên voucher tối đa 180 ký tự")
    private String name;

    @Size(max = 1000, message = "Mô tả tối đa 1000 ký tự")
    private String description;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.00", message = "Đơn tối thiểu không hợp lệ")
    private BigDecimal minimumOrderValue;

    @DecimalMin(value = "0.00", message = "Mức giảm tối đa không hợp lệ")
    private BigDecimal maximumDiscountAmount;

    private Integer usageLimit;

    private Integer userUsageLimit;

    private Boolean active;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    @NotNull(message = "Kiểu áp dụng voucher không được để trống")
    private VoucherScopeType scopeType;

    private List<Long> productIds;

    private List<Long> categoryIds;
}
