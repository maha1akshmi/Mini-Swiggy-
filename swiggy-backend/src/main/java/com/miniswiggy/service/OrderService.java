package com.miniswiggy.service;

import com.miniswiggy.dto.OrderDTO;
import com.miniswiggy.dto.OrderItemDTO;
import com.miniswiggy.dto.PlaceOrderRequest;
import com.miniswiggy.exception.BadRequestException;
import com.miniswiggy.exception.ResourceNotFoundException;
import com.miniswiggy.model.*;
import com.miniswiggy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDTO placeOrder(String email, PlaceOrderRequest request) {
        User user = getUserByEmail(email);
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("No active cart found"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty. Add items before placing an order.");
        }

        // Calculate total
        BigDecimal totalPrice = cart.getItems().stream()
                .map(item -> item.getPriceAtTime().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create the order
        Order order = Order.builder()
                .user(user)
                .totalPrice(totalPrice)
                .deliveryAddress(request.getDeliveryAddress())
                .paymentMethod(request.getPaymentMethod())
                .status(Order.OrderStatus.PLACED)
                .build();

        // Map cart items → order items (price snapshot)
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> OrderItem.builder()
                        .order(order)
                        .food(cartItem.getFood())
                        .quantity(cartItem.getQuantity())
                        .priceAtTime(cartItem.getPriceAtTime())
                        .build())
                .collect(Collectors.toList());

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        // Clear the cart after placing order
        cart.getItems().clear();
        cartItemRepository.deleteByCart(cart);
        cartRepository.save(cart);

        return toDTO(savedOrder);
    }

    public List<OrderDTO> getOrdersByUser(String email) {
        User user = getUserByEmail(email);
        return orderRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(String email, Long orderId) {
        User user = getUserByEmail(email);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Users can only see their own orders; admins can see all
        if (!order.getUser().getId().equals(user.getId())
                && user.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Order does not belong to you");
        }

        return toDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        try {
            Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status +
                    ". Valid values: PLACED, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED");
        }

        return toDTO(orderRepository.save(order));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private OrderDTO toDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList());

        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .items(itemDTOs)
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus().name())
                .deliveryAddress(order.getDeliveryAddress())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderItemDTO toItemDTO(OrderItem item) {
        BigDecimal subtotal = item.getPriceAtTime()
                .multiply(BigDecimal.valueOf(item.getQuantity()));
        return OrderItemDTO.builder()
                .id(item.getId())
                .foodId(item.getFood().getId())
                .foodName(item.getFood().getName())
                .foodImageUrl(item.getFood().getImageUrl())
                .quantity(item.getQuantity())
                .priceAtTime(item.getPriceAtTime())
                .subtotal(subtotal)
                .build();
    }
}
