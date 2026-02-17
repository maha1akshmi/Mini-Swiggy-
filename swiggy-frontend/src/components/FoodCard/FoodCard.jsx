import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../Toast/Toast';
import { formatCurrency } from '../../utils/formatCurrency';
import './FoodCard.css';

const FoodCard = ({ food }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!user) { addToast('Please login to add items to cart', 'info'); return; }
    if (adding) return;
    try {
      setAdding(true);
      await addToCart(food.id, 1);
      setAdded(true);
      addToast(`${food.name} added to cart!`, 'success');
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`food-card ${!food.isAvailable ? 'food-card--unavailable' : ''}`}>
      <div className="food-card-image-wrap">
        <img
          src={food.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400`}
          alt={food.name}
          className="food-card-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
          }}
        />
        <span className="food-card-category">{food.category}</span>
        {!food.isAvailable && (
          <div className="food-card-unavailable-overlay">Unavailable</div>
        )}
      </div>

      <div className="food-card-body">
        <h3 className="food-card-name">{food.name}</h3>
        {food.description && (
          <p className="food-card-desc">{food.description}</p>
        )}
        <div className="food-card-footer">
          <span className="food-card-price">{formatCurrency(food.price)}</span>
          <button
            className={`add-btn ${added ? 'add-btn--added' : ''}`}
            onClick={handleAddToCart}
            disabled={adding || !food.isAvailable}
          >
            {adding ? (
              <span className="btn-spinner" />
            ) : added ? (
              '✓ Added'
            ) : (
              '+ Add'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
