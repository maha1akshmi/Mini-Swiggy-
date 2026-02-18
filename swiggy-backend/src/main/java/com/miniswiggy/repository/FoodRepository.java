package com.miniswiggy.repository;

import com.miniswiggy.model.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {

    List<Food> findByCategoryIgnoreCase(String category);

    List<Food> findByIsAvailableTrue();

    @Query("SELECT DISTINCT f.category FROM Food f ORDER BY f.category")
    List<String> findAllDistinctCategories();

    @Query("SELECT f FROM Food f WHERE " +
            "(:category IS NULL OR LOWER(f.category) = LOWER(:category)) AND " +
            "(:search IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "f.isAvailable = true")
    List<Food> searchFoods(@Param("category") String category,
                           @Param("search") String search);
}
