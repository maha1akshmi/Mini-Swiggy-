import React from 'react';
import './Skeleton.css';

export const FoodCardSkeleton = () => (
  <div className="food-skeleton card">
    <div className="food-skeleton__image skeleton" />
    <div className="food-skeleton__body">
      <div className="food-skeleton__tag skeleton" />
      <div className="food-skeleton__title skeleton" />
      <div className="food-skeleton__desc skeleton" />
      <div className="food-skeleton__desc skeleton" style={{ width: '60%' }} />
      <div className="food-skeleton__footer">
        <div className="food-skeleton__price skeleton" />
        <div className="food-skeleton__btn skeleton" />
      </div>
    </div>
  </div>
);

export const FoodGridSkeleton = ({ count = 8 }) => (
  <div className="food-grid">
    {Array.from({ length: count }).map((_, i) => (
      <FoodCardSkeleton key={i} />
    ))}
  </div>
);
