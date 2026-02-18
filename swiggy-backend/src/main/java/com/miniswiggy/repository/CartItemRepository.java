package com.miniswiggy.repository;

import com.miniswiggy.model.Cart;
import com.miniswiggy.model.CartItem;
import com.miniswiggy.model.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndFood(Cart cart, Food food);
    void deleteByCart(Cart cart);
}