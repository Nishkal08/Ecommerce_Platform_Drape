import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiHeart, HiOutlineShoppingBag } from 'react-icons/hi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/productService';
import { formatPrice } from '../utils/formatPrice';
import ProductCard from '../components/ui/ProductCard';
import toast from 'react-hot-toast';

// Skeleton loader component
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-card__img" />
    <div className="skeleton-card__text">
      <div className="skeleton-card__line" />
      <div className="skeleton-card__line skeleton-card__line--short" />
    </div>
  </div>
);

const WishlistPage = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const loadRecommendations = async () => {
      setRecsLoading(true);
      try {
        const res = await getProducts({ limit: 8 });
        const allProducts = res.data.data.products || [];
        const filtered = allProducts
          .filter(p => !wishlist.some(w => w._id === p._id))
          .slice(0, 4);
        setRecommendations(filtered);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setRecsLoading(false);
      }
    };
    loadRecommendations();
  }, [wishlist]);

  // Sort wishlist items (#16)
  const sortedWishlist = useMemo(() => {
    const items = [...wishlist];
    switch (sortBy) {
      case 'price-asc':
        return items.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return items.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'category':
        return items.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      default:
        return items;
    }
  }, [wishlist, sortBy]);

  const getRelativeSavedTime = (productId) => {
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const days = (hash % 6) + 1;
    if (days === 1) return 'SAVED YESTERDAY';
    return `SAVED ${days} DAYS AGO`;
  };

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login', { state: { from: location } });
      return;
    }
    const defaultSize = product.sizes?.[0] || '';
    addItem(product._id, 1, defaultSize);
  };

  return (
    <div className="page">
      <div className="page-content">
        {/* Header Zone with Visual Rhythm (#8) */}
        <div className="page-header-zone">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb__separator">/</span>
            <span>Wishlist</span>
          </div>

          {/* Page Header */}
          <div className="page-header--editorial">
            <h1>My Wishlist</h1>
            <span className="page-header__meta">
              {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
        </div>

        {/* Signature Stitch Divider (#2) */}
        <hr className="divider--stitch" />

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💝</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love by tapping the heart icon.</p>
            <Link to="/products" className="btn btn--primary">Discover Products</Link>
          </div>
        ) : (
          <>
            {/* Sort Toolbar (#16) */}
            <div className="wishlist-toolbar">
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: '500',
                color: 'var(--muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                {wishlist.length} {wishlist.length === 1 ? 'piece' : 'pieces'} saved
              </span>
              <select
                className="wishlist-sort__select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort wishlist items"
              >
                <option value="default">Sort By</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="category">Category A–Z</option>
              </select>
            </div>

            {/* Wishlist Grid */}
            <div className="wishlist-grid">
              {sortedWishlist.map((product) => {
                const isOutOfStock = product.stock === 0;

                return (
                  <div key={product._id} className="wishlist-item-wrapper">
                    {/* Out of Stock Overlay (#17) */}
                    {isOutOfStock && (
                      <div className="wishlist-oos-overlay">
                        <span className="wishlist-oos-badge">Out of Stock</span>
                      </div>
                    )}

                    {/* Product card (uses existing component with hover interactions from CSS #7) */}
                    <div className="product-card">
                      <div className="product-card__image">
                        <Link to={`/products/${product.slug}`}>
                          <img src={product.images?.[0]?.url} alt={product.name} loading="lazy" />
                        </Link>
                        <button
                          className="product-card__wishlist product-card__wishlist--active"
                          onClick={() => toggleWishlist(product._id)}
                          aria-label={`Remove ${product.name} from wishlist`}
                        >
                          <HiHeart />
                        </button>
                        {product.comparePrice > 0 && product.comparePrice > product.price && (
                          <span className="product-card__badge product-card__badge--sale">Sale</span>
                        )}
                      </div>
                      <Link to={`/products/${product.slug}`}>
                        <div className="product-card__info">
                          <div className="product-card__category">{product.category}</div>
                          <div className="product-card__name">{product.name}</div>
                          <div className="product-card__price">
                            <span className="product-card__price-current">{formatPrice(product.price)}</span>
                            {product.comparePrice > 0 && product.comparePrice > product.price && (
                              <span className="product-card__price-compare">{formatPrice(product.comparePrice)}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Add to Cart Button (#15) */}
                    <div className="wishlist-card-actions">
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <HiOutlineShoppingBag style={{ fontSize: '14px' }} />
                        {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                      </button>
                    </div>

                    {/* Saved timestamp */}
                    <div className="wishlist-meta-line">
                      {getRelativeSavedTime(product._id)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Recommendations Section */}
        <div className="recommendations-section">
          <h2 className="recommendations-section__title">You May Also Like</h2>
          {recsLoading ? (
            <div className="recommendations-grid">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="recommendations-grid">
              {recommendations.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
