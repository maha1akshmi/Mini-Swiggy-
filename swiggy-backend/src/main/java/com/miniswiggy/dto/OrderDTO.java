package com.miniswiggy.dto;

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
public class OrderDTO {
    private Long id;
    private Long userId;
    private String userName;
    private List<OrderItemDTO> items;
    private BigDecimal totalPrice;
    private String status;
    private String deliveryAddress;
    private String paymentMethod;
    private LocalDateTime createdAt;
}
