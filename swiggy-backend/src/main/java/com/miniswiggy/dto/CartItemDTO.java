package com.miniswiggy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;
    private Long foodId;
    private String foodName;
    private String foodImageUrl;
    private String category;
    private Integer quantity;
    private BigDecimal priceAtTime;
    private BigDecimal subtotal;
}
