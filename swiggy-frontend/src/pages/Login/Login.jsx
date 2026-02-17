import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginAPI } from '../../api/authAPI';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast/Toast';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      setErrors({});
      const res = await loginAPI(form);
      const { token, ...userData } = res.data;
      login(userData, token);
      addToast(`Welcome back, ${userData.name}!`, 'success');
      navigate(from, { replace: true });
    } catch (e) {
      const msg = e.response?.data?.message || 'Invalid credentials';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb1" />
        <div className="auth-bg-orb orb2" />
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🍜</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue ordering</p>
        </div>

        {errors.general && (
          <div className="auth-error-banner">{errors.general}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className={`field-input ${errors.email ? 'field-input--error' : ''}`}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              className={`field-input ${errors.password ? 'field-input--error' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="btn-spinner-white" /> : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
