import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeOrderAPI } from '../../api/orderAPI';
import { useToast } from '../../components/Toast/Toast';
import CartItem from '../../components/CartItem/CartItem';
import { formatCurrency } from '../../utils/formatCurrency';
import './Cart.css';

const PAYMENT_METHODS = ['Cash on Delivery', 'UPI', 'Credit/Debit Card', 'Net Banking'];

const Cart = () => {
  const { cart, cartLoading, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm] = useState({ deliveryAddress: '', paymentMethod: 'Cash on Delivery' });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);

  const isEmpty = !cart || cart.items?.length === 0;

  const validate = () => {
    const errs = {};
    if (!form.deliveryAddress.trim()) errs.deliveryAddress = 'Delivery address is required';
    if (!form.paymentMethod) errs.paymentMethod = 'Please select a payment method';
    return errs;
  };

  const handlePlaceOrder = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setPlacing(true);
      await placeOrderAPI(form);
      await clearCart();
      addToast('Order placed successfully! 🎉', 'success', 4000);
      navigate('/orders');
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="cart-page">
        <div className="loading-screen">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-inner">
        {/* Header */}
        <div className="cart-page-header">
          <h1 className="cart-page-title">Your Cart</h1>
          {!isEmpty && (
            <button className="clear-cart-btn" onClick={async () => {
              await clearCart();
              addToast('Cart cleared', 'info');
            }}>
              Clear all
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some delicious items from the menu to get started.</p>
            <button className="browse-btn" onClick={() => navigate('/')}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items-col">
              <div className="cart-items-list">
                {cart.items.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="cart-summary-col">
              <div className="cart-summary-card">
                <h3 className="summary-title">Order Summary</h3>

                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Subtotal ({cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''})</span>
                    <span>{formatCurrency(cart.totalPrice)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery fee</span>
                    <span className="free-tag">Free</span>
                  </div>
                  <div className="summary-row summary-row--total">
                    <span>Total</span>
                    <span>{formatCurrency(cart.totalPrice)}</span>
                  </div>
                </div>

                {!checkoutOpen ? (
                  <button className="checkout-btn" onClick={() => setCheckoutOpen(true)}>
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="checkout-form">
                    <div className="field-group">
                      <label className="field-label">Delivery Address</label>
                      <textarea
                        className={`field-textarea ${errors.deliveryAddress ? 'field-input--error' : ''}`}
                        placeholder="Enter your full delivery address..."
                        value={form.deliveryAddress}
                        rows={3}
                        onChange={e => {
                          setForm(p => ({ ...p, deliveryAddress: e.target.value }));
                          if (errors.deliveryAddress) setErrors(p => ({ ...p, deliveryAddress: '' }));
                        }}
                      />
                      {errors.deliveryAddress && (
                        <span className="field-error">{errors.deliveryAddress}</span>
                      )}
                    </div>

                    <div className="field-group">
                      <label className="field-label">Payment Method</label>
                      <div className="payment-options">
                        {PAYMENT_METHODS.map(method => (
                          <label key={method} className={`payment-option ${form.paymentMethod === method ? 'payment-option--selected' : ''}`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method}
                              checked={form.paymentMethod === method}
                              onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}
                            />
                            {method}
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      className="place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={placing}
                    >
                      {placing ? (
                        <><span className="btn-spinner-white" /> Placing order...</>
                      ) : (
                        <>Place Order · {formatCurrency(cart.totalPrice)}</>
                      )}
                    </button>

                    <button className="back-btn" onClick={() => setCheckoutOpen(false)}>
                      ← Back to cart
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
