package uth.nhathuy.Product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductPriceUpdateRequest {
    @NotNull
    @DecimalMin("0.0")
    private BigDecimal price;
}
