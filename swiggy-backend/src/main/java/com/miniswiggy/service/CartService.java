package com.miniswiggy.service;

import com.miniswiggy.dto.AddToCartRequest;
import com.miniswiggy.dto.CartDTO;
import com.miniswiggy.dto.CartItemDTO;
import com.miniswiggy.dto.UpdateCartRequest;
import com.miniswiggy.exception.BadRequestException;
import com.miniswiggy.exception.ResourceNotFoundException;
import com.miniswiggy.model.*;
import com.miniswiggy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final FoodRepository foodRepository;
    private final UserRepository userRepository;

    public CartDTO getCartByUser(String email) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);
        return toDTO(cart);
    }

    @Transactional
    public CartDTO addToCart(String email, AddToCartRequest request) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);
        Food food = foodRepository.findById(request.getFoodId())
                .orElseThrow(() -> new ResourceNotFoundException("Food", "id", request.getFoodId()));

        if (!food.getIsAvailable()) {
            throw new BadRequestException("Food item is not available: " + food.getName());
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartAndFood(cart, food);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .food(food)
                    .quantity(request.getQuantity())
                    .priceAtTime(food.getPrice())
                    .build();
            cart.getItems().add(newItem);
        }

        return toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO updateCartItem(String email, Long cartItemId, UpdateCartRequest request) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        return toDTO(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Transactional
    public CartDTO removeFromCart(String email, Long cartItemId) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return toDTO(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Transactional
    public void clearCart(String email) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartItemRepository.deleteByCart(cart);
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private CartDTO toDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList());

        BigDecimal total = itemDTOs.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemDTOs)
                .totalPrice(total)
                .totalItems(totalItems)
                .build();
    }

    private CartItemDTO toItemDTO(CartItem item) {
        BigDecimal subtotal = item.getPriceAtTime()
                .multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartItemDTO.builder()
                .id(item.getId())
                .foodId(item.getFood().getId())
                .foodName(item.getFood().getName())
                .foodImageUrl(item.getFood().getImageUrl())
                .category(item.getFood().getCategory())
                .quantity(item.getQuantity())
                .priceAtTime(item.getPriceAtTime())
                .subtotal(subtotal)
                .build();
    }
}
