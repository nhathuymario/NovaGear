package uth.nhathuy.Voucher.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import uth.nhathuy.Voucher.dto.VoucherRequest;
import uth.nhathuy.Voucher.dto.VoucherResponse;
import uth.nhathuy.Voucher.entity.DiscountType;
import uth.nhathuy.Voucher.entity.Voucher;
import uth.nhathuy.Voucher.entity.VoucherScopeType;
import uth.nhathuy.Voucher.exception.BadRequestException;
import uth.nhathuy.Voucher.exception.ResourceNotFoundException;
import uth.nhathuy.Voucher.repository.VoucherRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class VoucherService {

    private static final Pattern CODE_PATTERN = Pattern.compile("^[A-Z0-9_-]{3,60}$");

    private final VoucherRepository voucherRepository;
    private final ObjectMapper objectMapper;

    public Page<VoucherResponse> search(String keyword, VoucherScopeType scopeType, Boolean active, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Voucher> spec = Specification.where(keywordSpec(keyword))
                .and(scopeSpec(scopeType))
                .and(activeSpec(active));
        return voucherRepository.findAll(spec, pageable).map(this::toResponse);
    }

    public VoucherResponse get(Long id) {
        return toResponse(findVoucher(id));
    }

    public VoucherResponse create(VoucherRequest request) {
        VoucherRequest normalized = normalizeRequest(request);
        validateRequest(normalized, null);

        Voucher voucher = Voucher.builder()
                .code(normalized.getCode())
                .name(normalized.getName().trim())
                .description(trimToNull(normalized.getDescription()))
                .discountType(normalized.getDiscountType())
                .discountValue(normalized.getDiscountValue())
                .minimumOrderValue(normalized.getMinimumOrderValue())
                .maximumDiscountAmount(normalized.getMaximumDiscountAmount())
                .scopeType(normalized.getScopeType())
                .productIdsJson(writeIds(normalized.getProductIds()))
                .categoryIdsJson(writeIds(normalized.getCategoryIds()))
                .usageLimit(normalized.getUsageLimit())
                .userUsageLimit(normalized.getUserUsageLimit())
                .active(normalized.getActive() == null || normalized.getActive())
                .startAt(normalized.getStartAt())
                .endAt(normalized.getEndAt())
                .build();

        return toResponse(voucherRepository.save(voucher));
    }

    public VoucherResponse update(Long id, VoucherRequest request) {
        Voucher voucher = findVoucher(id);
        VoucherRequest normalized = normalizeRequest(request);
        validateRequest(normalized, id);

        voucher.setCode(normalized.getCode());
        voucher.setName(normalized.getName().trim());
        voucher.setDescription(trimToNull(normalized.getDescription()));
        voucher.setDiscountType(normalized.getDiscountType());
        voucher.setDiscountValue(normalized.getDiscountValue());
        voucher.setMinimumOrderValue(normalized.getMinimumOrderValue());
        voucher.setMaximumDiscountAmount(normalized.getMaximumDiscountAmount());
        voucher.setScopeType(normalized.getScopeType());
        voucher.setProductIdsJson(writeIds(normalized.getProductIds()));
        voucher.setCategoryIdsJson(writeIds(normalized.getCategoryIds()));
        voucher.setUsageLimit(normalized.getUsageLimit());
        voucher.setUserUsageLimit(normalized.getUserUsageLimit());
        voucher.setActive(normalized.getActive() == null || normalized.getActive());
        voucher.setStartAt(normalized.getStartAt());
        voucher.setEndAt(normalized.getEndAt());

        return toResponse(voucherRepository.save(voucher));
    }

    public void delete(Long id) {
        Voucher voucher = findVoucher(id);
        voucherRepository.delete(voucher);
    }

    public VoucherResponse toggleActive(Long id) {
        Voucher voucher = findVoucher(id);
        voucher.setActive(!Boolean.TRUE.equals(voucher.getActive()));
        return toResponse(voucherRepository.save(voucher));
    }

    public VoucherResponse validateVoucher(String code, Long productId, Long categoryId, BigDecimal subtotal) {
        if (!StringUtils.hasText(code)) {
            throw new BadRequestException("Mã voucher không được để trống");
        }

        Voucher voucher = voucherRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Voucher không tồn tại"));

        ensureVoucherCanBeApplied(voucher, productId, categoryId, subtotal);
        return toResponse(voucher);
    }

    private void ensureVoucherCanBeApplied(Voucher voucher, Long productId, Long categoryId, BigDecimal subtotal) {
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());

        if (!Boolean.TRUE.equals(voucher.getActive())) {
            throw new BadRequestException("Voucher hiện không hoạt động");
        }
        if (voucher.getStartAt() != null && now.isBefore(voucher.getStartAt())) {
            throw new BadRequestException("Voucher chưa đến thời gian áp dụng");
        }
        if (voucher.getEndAt() != null && now.isAfter(voucher.getEndAt())) {
            throw new BadRequestException("Voucher đã hết hạn");
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("Voucher đã hết lượt sử dụng");
        }

        if (voucher.getMinimumOrderValue() != null && subtotal != null && subtotal.compareTo(voucher.getMinimumOrderValue()) < 0) {
            throw new BadRequestException("Đơn hàng chưa đạt mức tối thiểu của voucher");
        }

        if (!isApplicable(voucher, productId, categoryId)) {
            throw new BadRequestException("Voucher không áp dụng cho sản phẩm hoặc danh mục này");
        }
    }

    private boolean isApplicable(Voucher voucher, Long productId, Long categoryId) {
        List<Long> productIds = readIds(voucher.getProductIdsJson());
        List<Long> categoryIds = readIds(voucher.getCategoryIdsJson());

        return switch (voucher.getScopeType()) {
            case GLOBAL -> true;
            case PRODUCT -> productId != null && productIds.contains(productId);
            case CATEGORY -> categoryId != null && categoryIds.contains(categoryId);
            case MIXED -> {
                boolean productMatch = productId != null && productIds.contains(productId);
                boolean categoryMatch = categoryId != null && categoryIds.contains(categoryId);
                yield productMatch || categoryMatch;
            }
        };
    }

    private Voucher findVoucher(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher"));
    }

    private void validateRequest(VoucherRequest request, Long currentId) {
        if (request == null) {
            throw new BadRequestException("Dữ liệu voucher không hợp lệ");
        }

        String code = normalizeCode(request.getCode());
        validateCode(code);
        validateDiscount(request);
        validateLimits(request);
        validateTimeWindow(request);
        validateScope(request.getScopeType(), request.getProductIds(), request.getCategoryIds());
        validateUniqueCode(code, currentId);
    }

    private void validateScope(VoucherScopeType scopeType, List<Long> productIds, List<Long> categoryIds) {
        List<Long> normalizedProducts = sanitizeIds(productIds);
        List<Long> normalizedCategories = sanitizeIds(categoryIds);

        if (scopeType == VoucherScopeType.GLOBAL) {
            validateGlobalScope(normalizedProducts, normalizedCategories);
        } else if (scopeType == VoucherScopeType.PRODUCT) {
            validateProductScope(normalizedProducts, normalizedCategories);
        } else if (scopeType == VoucherScopeType.CATEGORY) {
            validateCategoryScope(normalizedProducts, normalizedCategories);
        } else if (scopeType == VoucherScopeType.MIXED) {
            validateMixedScope(normalizedProducts, normalizedCategories);
        }
    }

    private void validateCode(String code) {
        if (!CODE_PATTERN.matcher(code).matches()) {
            throw new BadRequestException("Mã voucher phải có từ 3 đến 60 ký tự, chỉ gồm chữ in hoa, số, dấu - và _");
        }
    }

    private void validateDiscount(VoucherRequest request) {
        if (request.getDiscountType() == DiscountType.PERCENT && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Voucher phần trăm không được lớn hơn 100%");
        }
    }

    private void validateLimits(VoucherRequest request) {
        if (request.getMinimumOrderValue() != null && request.getMinimumOrderValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Đơn tối thiểu không hợp lệ");
        }

        if (request.getMaximumDiscountAmount() != null && request.getMaximumDiscountAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Mức giảm tối đa không hợp lệ");
        }

        if (request.getUsageLimit() != null && request.getUsageLimit() <= 0) {
            throw new BadRequestException("Giới hạn lượt dùng phải lớn hơn 0");
        }

        if (request.getUserUsageLimit() != null && request.getUserUsageLimit() <= 0) {
            throw new BadRequestException("Giới hạn mỗi user phải lớn hơn 0");
        }
    }

    private void validateTimeWindow(VoucherRequest request) {
        if (request.getStartAt() != null && request.getEndAt() != null && request.getEndAt().isBefore(request.getStartAt())) {
            throw new BadRequestException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
    }

    private void validateUniqueCode(String code, Long currentId) {
        if (currentId == null) {
            if (voucherRepository.existsByCodeIgnoreCase(code)) {
                throw new BadRequestException("Mã voucher đã tồn tại");
            }
        } else if (voucherRepository.existsByCodeIgnoreCaseAndIdNot(code, currentId)) {
            throw new BadRequestException("Mã voucher đã tồn tại");
        }
    }

    private void validateGlobalScope(List<Long> normalizedProducts, List<Long> normalizedCategories) {
        if (!normalizedProducts.isEmpty() || !normalizedCategories.isEmpty()) {
            throw new BadRequestException("Voucher global không cần gán sản phẩm hoặc danh mục");
        }
    }

    private void validateProductScope(List<Long> normalizedProducts, List<Long> normalizedCategories) {
        if (normalizedProducts.isEmpty()) {
            throw new BadRequestException("Voucher theo sản phẩm cần ít nhất 1 sản phẩm");
        }
        if (!normalizedCategories.isEmpty()) {
            throw new BadRequestException("Voucher theo sản phẩm không nên gán danh mục");
        }
    }

    private void validateCategoryScope(List<Long> normalizedProducts, List<Long> normalizedCategories) {
        if (normalizedCategories.isEmpty()) {
            throw new BadRequestException("Voucher theo danh mục cần ít nhất 1 danh mục");
        }
        if (!normalizedProducts.isEmpty()) {
            throw new BadRequestException("Voucher theo danh mục không nên gán sản phẩm");
        }
    }

    private void validateMixedScope(List<Long> normalizedProducts, List<Long> normalizedCategories) {
        if (normalizedProducts.isEmpty() && normalizedCategories.isEmpty()) {
            throw new BadRequestException("Voucher mixed cần ít nhất 1 sản phẩm hoặc 1 danh mục");
        }
    }

    private VoucherRequest normalizeRequest(VoucherRequest request) {
        return VoucherRequest.builder()
                .code(normalizeCode(request.getCode()))
                .name(request.getName() == null ? "" : request.getName().trim())
                .description(trimToNull(request.getDescription()))
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minimumOrderValue(request.getMinimumOrderValue())
                .maximumDiscountAmount(request.getMaximumDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .userUsageLimit(request.getUserUsageLimit())
                .active(request.getActive())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .scopeType(request.getScopeType())
                .productIds(sanitizeIds(request.getProductIds()))
                .categoryIds(sanitizeIds(request.getCategoryIds()))
                .build();
    }

    private Specification<Voucher> keywordSpec(String keyword) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(keyword)) {
                return cb.conjunction();
            }
            String like = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("description")), like)
            );
        };
    }

    private Specification<Voucher> scopeSpec(VoucherScopeType scopeType) {
        return (root, query, cb) -> scopeType == null ? cb.conjunction() : cb.equal(root.get("scopeType"), scopeType);
    }

    private Specification<Voucher> activeSpec(Boolean active) {
        return (root, query, cb) -> active == null ? cb.conjunction() : cb.equal(root.get("active"), active);
    }

    private VoucherResponse toResponse(Voucher voucher) {
        List<Long> productIds = readIds(voucher.getProductIdsJson());
        List<Long> categoryIds = readIds(voucher.getCategoryIdsJson());
        Integer remainingUsage = null;
        if (voucher.getUsageLimit() != null) {
            int usedCount = voucher.getUsedCount() == null ? 0 : voucher.getUsedCount();
            remainingUsage = Math.max(0, voucher.getUsageLimit() - usedCount);
        }

        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .minimumOrderValue(voucher.getMinimumOrderValue())
                .maximumDiscountAmount(voucher.getMaximumDiscountAmount())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .remainingUsage(remainingUsage)
                .userUsageLimit(voucher.getUserUsageLimit())
                .active(voucher.getActive())
                .scopeType(voucher.getScopeType())
                .productIds(productIds)
                .categoryIds(categoryIds)
                .startAt(voucher.getStartAt())
                .endAt(voucher.getEndAt())
                .createdAt(voucher.getCreatedAt())
                .updatedAt(voucher.getUpdatedAt())
                .build();
    }

    private String writeIds(List<Long> ids) {
        try {
            return objectMapper.writeValueAsString(sanitizeIds(ids));
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("Không thể xử lý danh sách scope");
        }
    }

    private List<Long> readIds(String json) {
        if (!StringUtils.hasText(json)) {
            return List.of();
        }
        try {
            return sanitizeIds(objectMapper.readValue(json, new TypeReference<List<Long>>() {}));
        } catch (Exception ex) {
            return List.of();
        }
    }

    private List<Long> sanitizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return ids.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private String normalizeCode(String code) {
        return code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
