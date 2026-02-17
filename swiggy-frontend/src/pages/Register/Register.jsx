import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '../../api/authAPI';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast/Toast';
import './Register.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      setErrors({});
      const res = await registerAPI({ name: form.name, email: form.email, password: form.password });
      const { token, ...userData } = res.data;
      login(userData, token);
      addToast(`Welcome, ${userData.name}! 🎉`, 'success');
      navigate('/');
    } catch (e) {
      const msg = e.response?.data?.message || 'Registration failed';
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
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start ordering your favourite food</p>
        </div>

        {errors.general && (
          <div className="auth-error-banner">{errors.general}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Full name</label>
            <input name="name" value={form.name} onChange={onChange}
              className={`field-input ${errors.name ? 'field-input--error' : ''}`}
              placeholder="John Doe" autoComplete="name" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange}
              className={`field-input ${errors.email ? 'field-input--error' : ''}`}
              placeholder="you@example.com" autoComplete="email" />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={onChange}
                className={`field-input ${errors.password ? 'field-input--error' : ''}`}
                placeholder="Min 6 chars" autoComplete="new-password" />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="field-group">
              <label className="field-label">Confirm</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange}
                className={`field-input ${errors.confirmPassword ? 'field-input--error' : ''}`}
                placeholder="Repeat password" autoComplete="new-password" />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="btn-spinner-white" /> : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
