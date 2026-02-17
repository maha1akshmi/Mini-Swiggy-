package com.miniswiggy.controller;

import com.miniswiggy.dto.OrderDTO;
import com.miniswiggy.dto.PlaceOrderRequest;
import com.miniswiggy.dto.UpdateOrderStatusRequest;
import com.miniswiggy.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<OrderDTO> placeOrder(Authentication authentication,
                                               @Valid @RequestBody PlaceOrderRequest request) {
        OrderDTO order = orderService.placeOrder(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrdersByUser(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(Authentication authentication,
                                                 @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(authentication.getName(), id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long id,
                                                      @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus()));
    }
}
