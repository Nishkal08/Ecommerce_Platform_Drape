import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ui/ProductCard';

const WishlistPage = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="page">
      <div className="page-header"><h1>My Wishlist</h1></div>
      <div className="page-content">
        {wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💝</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love by tapping the heart icon.</p>
            <Link to="/products" className="btn btn--primary">Discover Products</Link>
          </div>
        ) : (
          <div className="product-grid">
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
