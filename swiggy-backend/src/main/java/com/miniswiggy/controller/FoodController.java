package com.miniswiggy.controller;

import com.miniswiggy.dto.FoodDTO;
import com.miniswiggy.service.FoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public ResponseEntity<List<FoodDTO>> getAllFoods(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(foodService.getAllFoods(category, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodDTO> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(foodService.getAllCategories());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodDTO> createFood(@Valid @RequestBody FoodDTO foodDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foodService.createFood(foodDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodDTO> updateFood(@PathVariable Long id,
                                              @Valid @RequestBody FoodDTO foodDTO) {
        return ResponseEntity.ok(foodService.updateFood(id, foodDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFood(@PathVariable Long id) {
        foodService.deleteFood(id);
        return ResponseEntity.noContent().build();
    }
}