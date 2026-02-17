import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🍜</span>
          <span className="logo-text">mini<strong>swiggy</strong></span>
        </Link>

        {user && (
          <div className="navbar-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Menu</Link>
            <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>Orders</Link>
          </div>
        )}

        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/cart" className="cart-btn">
                <span className="cart-icon">🛒</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <div className="user-menu">
                <button className="user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  <span className="user-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                  <span className="user-name">{user.name}</span>
                  <span className="chevron">{menuOpen ? '▴' : '▾'}</span>
                </button>
                {menuOpen && (
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                      {user.role === 'ADMIN' && <span className="admin-badge">ADMIN</span>}
                    </div>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item" onClick={handleLogout}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
