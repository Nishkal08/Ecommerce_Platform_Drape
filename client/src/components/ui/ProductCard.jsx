import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login', { state: { from: location } });
      return;
    }
    addItem(product._id, 1, product.sizes?.[0] || '');
  };

  return (
    <div className="product-card">
      <div className="product-card__image">
        <Link to={`/products/${product.slug}`}>
          <img src={product.images?.[0]?.url} alt={product.name} loading="lazy" />
        </Link>
        <button
          className={`product-card__wishlist ${wishlisted ? 'product-card__wishlist--active' : ''}`}
          onClick={() => toggleWishlist(product._id)}
        >
          {wishlisted ? <HiHeart /> : <HiOutlineHeart />}
        </button>
        {product.comparePrice > 0 && product.comparePrice > product.price && (
          <span className="product-card__badge product-card__badge--sale">Sale</span>
        )}
        {product.isFeatured && !(product.comparePrice > product.price) && (
          <span className="product-card__badge product-card__badge--new">Featured</span>
        )}
        <div className="product-card__overlay">
          <button className="btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
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
  );
};

export default ProductCard;
