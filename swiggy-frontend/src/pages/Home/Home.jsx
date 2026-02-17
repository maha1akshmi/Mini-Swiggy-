import React, { useState, useEffect, useCallback } from 'react';
import { getFoodsAPI, getCategoriesAPI } from '../../api/foodAPI';
import FoodCard from '../../components/FoodCard/FoodCard';
import './Home.css';

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategoriesAPI()
      .then(r => setCategories(r.data))
      .catch(() => {});
  }, []);

  const fetchFoods = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getFoodsAPI(selectedCategory, search);
      setFoods(res.data);
    } catch (e) {
      setError('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSearch('');
    setSearchInput('');
  };

  const hasFilters = selectedCategory || search;

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Fresh • Hot • Delivered</p>
          <h1 className="hero-title">
            Cravings,<br />
            <em>delivered fast</em>
          </h1>
          <p className="hero-desc">
            Explore our curated menu and get your favourite meals at your doorstep.
          </p>
        </div>
        <div className="hero-decoration">
          <div className="hero-deco-ring ring1" />
          <div className="hero-deco-ring ring2" />
          <div className="hero-emoji">🍛</div>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="filters-section">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search dishes, cuisines..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button className="search-clear" onClick={() => { setSearchInput(''); setSearch(''); }}>×</button>
          )}
        </div>

        <div className="categories-scroll">
          <button
            className={`cat-chip ${selectedCategory === '' ? 'cat-chip--active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-chip ${selectedCategory === cat ? 'cat-chip--active' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Results header */}
      <section className="menu-section">
        <div className="menu-header">
          <h2 className="menu-heading">
            {hasFilters
              ? `Results for ${selectedCategory || ''} ${search ? `"${search}"` : ''}`.trim()
              : 'Our Menu'}
          </h2>
          <div className="menu-meta">
            {!loading && (
              <span className="menu-count">{foods.length} dish{foods.length !== 1 ? 'es' : ''}</span>
            )}
            {hasFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>Clear filters</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="food-grid-skeleton">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img" style={{ animationDelay: `${i * 0.08}s` }} />
                <div className="skeleton-body">
                  <div className="skeleton-line w-70" style={{ animationDelay: `${i * 0.08 + 0.1}s` }} />
                  <div className="skeleton-line w-50" style={{ animationDelay: `${i * 0.08 + 0.15}s` }} />
                  <div className="skeleton-line w-40" style={{ animationDelay: `${i * 0.08 + 0.2}s` }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="state-box state-error">
            <span>😕</span>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchFoods}>Retry</button>
          </div>
        ) : foods.length === 0 ? (
          <div className="state-box">
            <span>🍽️</span>
            <p>No dishes found{hasFilters ? ' for your filters' : ''}.</p>
            {hasFilters && (
              <button className="retry-btn" onClick={clearFilters}>Clear filters</button>
            )}
          </div>
        ) : (
          <div className="food-grid">
            {foods.map((food, i) => (
              <div key={food.id} className="food-grid-item" style={{ animationDelay: `${i * 0.04}s` }}>
                <FoodCard food={food} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
