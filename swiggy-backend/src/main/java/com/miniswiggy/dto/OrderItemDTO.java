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
public class OrderItemDTO {
    private Long id;
    private Long foodId;
    private String foodName;
    private String foodImageUrl;
    private Integer quantity;
    private BigDecimal priceAtTime;
    private BigDecimal subtotal;
}