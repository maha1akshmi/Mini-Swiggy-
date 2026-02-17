import React, { useState, useEffect } from 'react';
import { getOrdersAPI } from '../../api/orderAPI';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatCurrency';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getOrdersAPI();
        setOrders(res.data);
      } catch (e) {
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const getStatusIcon = (status) => {
    const icons = {
      PLACED: '📋', CONFIRMED: '✅', PREPARING: '👨‍🍳',
      OUT_FOR_DELIVERY: '🛵', DELIVERED: '🎉', CANCELLED: '❌'
    };
    return icons[status] || '📦';
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-screen">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-inner">
        <div className="orders-header">
          <h1 className="orders-title">Your Orders</h1>
          <span className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>

        {error ? (
          <div className="state-box state-error">
            <span>😕</span>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>When you place an order, it will appear here.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div
                  className="order-card-header"
                  onClick={() => toggleExpand(order.id)}
                  role="button"
                >
                  <div className="order-card-left">
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>

                  <div className="order-card-center">
                    <span className="order-items-preview">
                      {order.items.slice(0, 2).map(i => i.foodName).join(', ')}
                      {order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}
                    </span>
                  </div>

                  <div className="order-card-right">
                    <span
                      className="order-status-badge"
                      style={{ color: getStatusColor(order.status), borderColor: getStatusColor(order.status) + '40', background: getStatusColor(order.status) + '15' }}
                    >
                      {getStatusIcon(order.status)} {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="order-total">{formatCurrency(order.totalPrice)}</span>
                    <span className="order-expand-icon">
                      {expandedId === order.id ? '▴' : '▾'}
                    </span>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="order-card-body">
                    <div className="order-items-list">
                      {order.items.map(item => (
                        <div key={item.id} className="order-item-row">
                          <div className="order-item-info">
                            <span className="order-item-name">{item.foodName}</span>
                            <span className="order-item-qty">× {item.quantity}</span>
                          </div>
                          <span className="order-item-price">{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-details-grid">
                      <div className="order-detail">
                        <span className="detail-label">Delivery Address</span>
                        <span className="detail-value">{order.deliveryAddress}</span>
                      </div>
                      <div className="order-detail">
                        <span className="detail-label">Payment Method</span>
                        <span className="detail-value">{order.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="order-total-row">
                      <span>Total Paid</span>
                      <span className="order-total-amt">{formatCurrency(order.totalPrice)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
