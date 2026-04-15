import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { getProductBySlug, getProducts } from '../services/productService';
import { getProductReviews, addReview } from '../services/reviewService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ui/ProductCard';
import StarRating from '../components/ui/StarRating';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [mainImage, setMainImage] = useState(0);

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProductBySlug(slug);
        const prod = res.data.data;
        setProduct(prod);
        setSelectedSize(prod.sizes?.[0] || '');

        // Load reviews
        const revRes = await getProductReviews(prod._id);
        setReviews(revRes.data.data || []);

        // Load related
        const relRes = await getProducts({ category: prod.category, limit: 4 });
        setRelated((relRes.data.data.products || []).filter(p => p._id !== prod._id).slice(0, 4));
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!selectedSize && product.sizes?.length > 0) {
      toast.error('Please select a size');
      return;
    }
    addItem(product._id, quantity, selectedSize);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    try {
      await addReview(product._id, reviewForm);
      const revRes = await getProductReviews(product._id);
      setReviews(revRes.data.data || []);
      setReviewForm({ rating: 5, title: '', body: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="page"><div className="spinner spinner--center" /></div>;
  if (!product) return <div className="page"><div className="page-content"><div className="empty-state"><h3>Product not found</h3></div></div></div>;

  const wishlisted = isWishlisted(product._id);

  return (
    <div className="page pb-24 md:pb-0">
      <div className="page-content">
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
          <Link to="/" style={{ color: 'var(--muted)' }}>Home</Link> / <Link to="/products" style={{ color: 'var(--muted)' }}>Products</Link> / <span style={{ color: 'var(--charcoal)' }}>{product.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mb-16">
          {/* Gallery */}
          <div className="gallery w-full md:w-1/2">
            <div className="gallery__thumbs">
              {product.images?.map((img, i) => (
                <div
                  key={i}
                  className={`gallery__thumb ${mainImage === i ? 'gallery__thumb--active' : ''}`}
                  onClick={() => setMainImage(i)}
                >
                  <img src={img.url} alt={`${product.name} ${i + 1}`} />
                </div>
              ))}
            </div>
            <div className="gallery__main">
              <img src={product.images?.[mainImage]?.url} alt={product.name} />
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2">
            <span className="badge badge--neutral" style={{ marginBottom: '12px', display: 'inline-block' }}>
              {product.category}
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '8px' }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.ratings?.count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <StarRating rating={Math.round(product.ratings.average)} />
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  ({product.ratings.count} {product.ratings.count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '24px', fontWeight: '700' }}>{formatPrice(product.price)}</span>
              {product.comparePrice > 0 && product.comparePrice > product.price && (
                <>
                  <span style={{ fontSize: '18px', color: 'var(--muted)', textDecoration: 'line-through' }}>
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="badge badge--error">
                    {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Size selector */}
            {product.sizes?.length > 0 && product.sizes[0] !== 'FREE' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Size
                </label>
                <div className="size-selector">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'size-btn--active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Quantity
              </label>
              <div className="qty-stepper">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Actions (Sticky on Mobile) */}
            <div className="fixed md:static bottom-0 left-0 w-full md:w-auto bg-white md:bg-transparent border-t border-[var(--border)] md:border-none p-4 md:p-0 z-[60] flex gap-3 md:mb-8 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] md:shadow-none">
              <button className="btn btn--primary btn--lg" style={{ flex: 1 }} onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button
                className="btn btn--outline btn--lg flex-shrink-0"
                onClick={() => toggleWishlist(product._id)}
                style={{ width: '56px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {wishlisted ? <HiHeart style={{ color: 'var(--error)', fontSize: '24px' }} /> : <HiOutlineHeart style={{ fontSize: '24px' }} />}
              </button>
            </div>

            {/* Stock */}
            <p style={{ fontSize: '13px', color: product.stock > 0 ? 'var(--success)' : 'var(--error)' }}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'description' ? 'tab--active' : ''}`} onClick={() => setActiveTab('description')}>
            Description
          </button>
          <button className={`tab ${activeTab === 'reviews' ? 'tab--active' : ''}`} onClick={() => setActiveTab('reviews')}>
            Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === 'description' && (
          <div style={{ maxWidth: '720px', lineHeight: '1.8', color: 'var(--muted)', marginBottom: '48px' }}>
            <p>{product.description}</p>
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                {product.tags.map((tag) => (
                  <span key={tag} className="badge badge--neutral">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ maxWidth: '720px', marginBottom: '48px' }}>
            {/* Review Form */}
            {user && (
              <form onSubmit={handleSubmitReview} style={{ marginBottom: '32px', padding: '24px', background: 'var(--surface)', borderRadius: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', marginBottom: '16px' }}>Write a Review</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Rating</label>
                  <StarRating rating={reviewForm.rating} onRate={(r) => setReviewForm({ ...reviewForm, rating: r })} interactive size={20} />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input className="form-input" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Review</label>
                  <textarea className="form-input" rows={3} value={reviewForm.body} onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })} />
                </div>
                <button type="submit" className="btn btn--primary">Submit Review</button>
              </form>
            )}

            {/* Review list */}
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} style={{ borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <StarRating rating={review.rating} size={14} />
                    <strong style={{ fontSize: '14px' }}>{review.user?.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{formatDate(review.createdAt)}</span>
                  </div>
                  <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{review.title}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--muted)' }}>{review.body}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <section style={{ marginTop: '48px' }}>
            <div className="section__heading">
              <h2><em>You May Also Like</em></h2>
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
