import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ui/ProductCard';
import { getProducts } from '../services/productService';

const WishlistPage = () => {
  const { wishlist } = useWishlist();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const res = await getProducts({ limit: 8 });
        const allProducts = res.data.data.products || [];
        // Filter out items already in the wishlist to keep it fresh
        const filtered = allProducts
          .filter(p => !wishlist.some(w => w._id === p._id))
          .slice(0, 4);
        setRecommendations(filtered);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      }
    };
    loadRecommendations();
  }, [wishlist]);

  const getRelativeSavedTime = (productId) => {
    // Deterministically mock a relative date using the product ID hash
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const days = (hash % 6) + 1; // 1 to 6 days
    if (days === 1) return 'SAVED YESTERDAY';
    return `SAVED ${days} DAYS AGO`;
  };

  return (
    <div className="page">
      <div className="page-content">
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

        {/* Signature Stitch Divider */}
        <hr className="divider--stitch" />

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💝</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love by tapping the heart icon.</p>
            <Link to="/products" className="btn btn--primary">Discover Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div key={product._id} className="wishlist-item-wrapper">
                <ProductCard product={product} />
                <div className="wishlist-meta-line">
                  {getRelativeSavedTime(product._id)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="recommendations-section">
            <h2 className="recommendations-section__title">You May Also Like</h2>
            <div className="recommendations-grid">
              {recommendations.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
