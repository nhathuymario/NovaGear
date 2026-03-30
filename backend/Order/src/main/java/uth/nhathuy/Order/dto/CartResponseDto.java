//gọi CartResponseDto

package uth.nhathuy.Order.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponseDto(
        Long cartId,
        Long userId,
        Integer totalItems,
        BigDecimal totalAmount,
        List<CartItemDto> items
) {
}