package com.miniswiggy.service;

import com.miniswiggy.dto.FoodDTO;
import com.miniswiggy.exception.ResourceNotFoundException;
import com.miniswiggy.model.Food;
import com.miniswiggy.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;

    public List<FoodDTO> getAllFoods(String category, String search) {
        List<Food> foods;
        if ((category == null || category.isBlank()) && (search == null || search.isBlank())) {
            foods = foodRepository.findByIsAvailableTrue();
        } else {
            String cat = (category == null || category.isBlank()) ? null : category;
            String srch = (search == null || search.isBlank()) ? null : search;
            foods = foodRepository.searchFoods(cat, srch);
        }
        return foods.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public FoodDTO getFoodById(Long id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food", "id", id));
        return toDTO(food);
    }

    public List<String> getAllCategories() {
        return foodRepository.findAllDistinctCategories();
    }

    public FoodDTO createFood(FoodDTO dto) {
        Food food = toEntity(dto);
        return toDTO(foodRepository.save(food));
    }

    public FoodDTO updateFood(Long id, FoodDTO dto) {
        Food existing = foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food", "id", id));
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setCategory(dto.getCategory());
        existing.setImageUrl(dto.getImageUrl());
        if (dto.getIsAvailable() != null) existing.setIsAvailable(dto.getIsAvailable());
        return toDTO(foodRepository.save(existing));
    }

    public void deleteFood(Long id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food", "id", id));
        foodRepository.delete(food);
    }

    private FoodDTO toDTO(Food food) {
        return FoodDTO.builder()
                .id(food.getId())
                .name(food.getName())
                .description(food.getDescription())
                .price(food.getPrice())
                .category(food.getCategory())
                .imageUrl(food.getImageUrl())
                .isAvailable(food.getIsAvailable())
                .createdAt(food.getCreatedAt())
                .build();
    }

    private Food toEntity(FoodDTO dto) {
        return Food.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .category(dto.getCategory())
                .imageUrl(dto.getImageUrl())
                .isAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true)
                .build();
    }
}