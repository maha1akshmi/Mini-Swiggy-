package com.miniswiggy.controller;

import com.miniswiggy.dto.AddToCartRequest;
import com.miniswiggy.dto.CartDTO;
import com.miniswiggy.dto.UpdateCartRequest;
import com.miniswiggy.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCartByUser(authentication.getName()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartDTO> addToCart(Authentication authentication,
            @Valid @RequestBody AddToCartRequest request) {
        CartDTO cart = cartService.addToCart(authentication.getName(), request);
        cart.setMessage("Food added to cart successfully");
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<CartDTO> updateCartItem(Authentication authentication,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartRequest request) {
        return ResponseEntity.ok(
                cartService.updateCartItem(authentication.getName(), cartItemId, request));
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<CartDTO> removeFromCart(Authentication authentication,
            @PathVariable Long cartItemId) {
        return ResponseEntity.ok(
                cartService.removeFromCart(authentication.getName(), cartItemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
