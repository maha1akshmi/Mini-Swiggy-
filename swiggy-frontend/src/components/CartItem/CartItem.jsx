import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../Toast/Toast';
import { formatCurrency } from '../../utils/formatCurrency';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateItem, removeItem } = useCart();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (newQty) => {
    if (newQty < 1) return;
    if (loading) return;
    try {
      setLoading(true);
      await updateItem(item.id, newQty);
    } catch (e) {
      addToast('Failed to update quantity', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await removeItem(item.id);
      addToast(`${item.foodName} removed from cart`, 'info');
    } catch (e) {
      addToast('Failed to remove item', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`cart-item ${loading ? 'cart-item--loading' : ''}`}>
      <div className="cart-item-image-wrap">
        <img
          src={item.foodImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'}
          alt={item.foodName}
          className="cart-item-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120';
          }}
        />
      </div>

      <div className="cart-item-info">
        <h4 className="cart-item-name">{item.foodName}</h4>
        <span className="cart-item-category">{item.category}</span>
        <span className="cart-item-unit-price">{formatCurrency(item.priceAtTime)} each</span>
      </div>

      <div className="cart-item-controls">
        <div className="qty-control">
          <button
            className="qty-btn"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={loading}
          >−</button>
          <span className="qty-value">{item.quantity}</span>
          <button
            className="qty-btn"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={loading}
          >+</button>
        </div>
        <span className="cart-item-subtotal">{formatCurrency(item.subtotal)}</span>
        <button className="remove-btn" onClick={handleRemove} disabled={loading} title="Remove">
          ✕
        </button>
      </div>
    </div>
  );
};

export default CartItem;
