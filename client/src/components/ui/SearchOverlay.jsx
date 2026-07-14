import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiX, HiOutlineSearch, HiOutlineClock, HiOutlineTrendingUp } from 'react-icons/hi';
import useDebounce from '../../hooks/useDebounce';
import { getProducts } from '../../services/productService';
import { formatPrice } from '../../utils/formatPrice';

const MAX_RECENT = 5;

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem('drape_recent_searches') || '[]');
  } catch { return []; }
};

const saveRecentSearch = (term) => {
  const recent = getRecentSearches().filter(s => s !== term);
  recent.unshift(term);
  localStorage.setItem('drape_recent_searches', JSON.stringify(recent.slice(0, MAX_RECENT)));
};

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches] = useState(getRecentSearches);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 250);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Fetch results on debounced query
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await getProducts({ search: debouncedQuery, limit: 5 });
        setResults(res.data.data.products || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query.trim());
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const handleRecentClick = (term) => {
    setQuery(term);
    saveRecentSearch(term);
    navigate(`/products?search=${encodeURIComponent(term)}`);
    onClose();
  };

  const handleResultClick = () => {
    if (query.trim()) saveRecentSearch(query.trim());
    onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showSuggestions = !query || query.length < 2;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-overlay__panel" onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <form onSubmit={handleSubmit} className="search-overlay__form">
          <HiOutlineSearch className="search-overlay__icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, categories..."
            className="search-overlay__input"
            aria-label="Search products"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="search-overlay__clear"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              <HiX />
            </button>
          )}
          <button type="button" className="search-overlay__close-btn" onClick={onClose} aria-label="Close search">
            <span>ESC</span>
          </button>
        </form>

        {/* Results Area */}
        <div className="search-overlay__results">
          {loading && (
            <div className="search-overlay__loading">
              <div className="spinner-small" />
              <span>Searching...</span>
            </div>
          )}

          {/* Suggestions when no query */}
          {showSuggestions && !loading && (
            <div className="search-overlay__suggestions">
              {recentSearches.length > 0 && (
                <div className="search-overlay__section">
                  <div className="search-overlay__section-title">
                    <HiOutlineClock /> Recent Searches
                  </div>
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      className="search-overlay__suggestion-item"
                      onClick={() => handleRecentClick(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
              <div className="search-overlay__section">
                <div className="search-overlay__section-title">
                  <HiOutlineTrendingUp /> Popular
                </div>
                {['Shirt', 'Dress', 'Jacket', 'Accessories'].map((term) => (
                  <button
                    key={term}
                    className="search-overlay__suggestion-item"
                    onClick={() => handleRecentClick(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Results */}
          {!showSuggestions && !loading && results.length > 0 && (
            <div className="search-overlay__products">
              <div className="search-overlay__section-title" style={{ padding: '12px 20px 8px' }}>
                Products ({results.length})
              </div>
              {results.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product.slug}`}
                  className="search-result-item"
                  onClick={handleResultClick}
                >
                  <div className="search-result-item__image">
                    <img src={product.images?.[0]?.url} alt={product.name} />
                  </div>
                  <div className="search-result-item__info">
                    <div className="search-result-item__category">{product.category}</div>
                    <div className="search-result-item__name">{product.name}</div>
                    <div className="search-result-item__price">
                      {formatPrice(product.price)}
                      {product.comparePrice > product.price && (
                        <span className="search-result-item__compare">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              <Link
                to={`/products?search=${encodeURIComponent(query)}`}
                className="search-overlay__view-all"
                onClick={handleResultClick}
              >
                View all results for "{query}" →
              </Link>
            </div>
          )}

          {/* No Results */}
          {!showSuggestions && !loading && results.length === 0 && (
            <div className="search-overlay__empty">
              <p>No products found for "<strong>{query}</strong>"</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                Try searching for a different term or browse our categories
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
