import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiOutlineShare, HiOutlineChevronDown, HiOutlineInformationCircle } from 'react-icons/hi';
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
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [mainImage, setMainImage] = useState(0);

  // Accordion active sections
  const [openSection, setOpenSection] = useState('description');

  // Size Guide Modal state
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Zoom magnifier effect
  const mainImageRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center' });

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });

  // Mobile Sticky Quick-Buy Bar
  const buyActionsRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );

    const currentRef = buyActionsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [product]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - window.scrollX - left) / width) * 100;
    const y = ((e.pageY - window.scrollY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.5)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)',
    });
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!selectedSize && product.sizes?.length > 0 && product.sizes[0] !== 'FREE') {
      toast.error('Please select a size');
      const sizeEl = document.getElementById('size-selector-section');
      if (sizeEl) {
        sizeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    addItem(product._id, quantity, selectedSize);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
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

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  if (loading) return <div className="page"><div className="spinner spinner--center" /></div>;
  if (!product) return <div className="page"><div className="page-content"><div className="empty-state"><h3>Product not found</h3></div></div></div>;

  const wishlisted = isWishlisted(product._id);

  return (
    <div className="page pb-24 md:pb-0">
      <div className="page-content">
        
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ marginBottom: '24px' }}>
          <Link to="/">Home</Link>
          <span className="breadcrumb__separator">/</span>
          <Link to="/products">Shop</Link>
          <span className="breadcrumb__separator">/</span>
          <Link to={`/products?category=${product.category}`}>{product.category}</Link>
          <span className="breadcrumb__separator">/</span>
          <span>{product.name}</span>
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
            {/* Gallery Main with Hover Zoom Magnifier (#5) */}
            <div
              className="gallery__main zoom-container"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              ref={mainImageRef}
              style={{ overflow: 'hidden', cursor: 'zoom-in', position: 'relative' }}
            >
              <img
                src={product.images?.[mainImage]?.url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.1s ease-out',
                  ...zoomStyle,
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 min-w-0">
            <span className="product-card__category" style={{ marginBottom: '8px', display: 'inline-block', fontSize: '12px' }}>
              {product.category}
            </span>
            
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '8px', color: 'var(--charcoal)', lineHeight: '1.2' }}>
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
              <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--charcoal)' }}>{formatPrice(product.price)}</span>
              {product.comparePrice > 0 && product.comparePrice > product.price && (
                <>
                  <span style={{ fontSize: '18px', color: 'var(--muted)', textDecoration: 'line-through' }}>
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="badge badge--error" style={{ background: 'rgba(192, 57, 43, 0.08)', color: 'var(--error)' }}>
                    {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Size selector & Size Guide trigger */}
            {product.sizes?.length > 0 && product.sizes[0] !== 'FREE' && (
              <div id="size-selector-section" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--charcoal)' }}>
                    Size
                  </label>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                  >
                    Size Guide
                  </button>
                </div>
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
              <label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '8px', color: 'var(--charcoal)' }}>
                Quantity
              </label>
              <div className="qty-stepper">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Stock indicator badge */}
            <div style={{ marginBottom: '24px' }}>
              {product.stock === 0 ? (
                <span className="badge" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--muted)', padding: '6px 12px', fontSize: '11px', fontWeight: '600' }}>Out of stock</span>
              ) : product.stock <= 5 ? (
                <div className="stock-badge">Only {product.stock} left in stock</div>
              ) : (
                <span className="badge" style={{ backgroundColor: 'rgba(46, 204, 113, 0.08)', color: '#27ae60', padding: '6px 12px', fontSize: '11px', fontWeight: '600' }}>In stock</span>
              )}
            </div>

            {/* Actions (Inline flow with ref tracking) */}
            <div ref={buyActionsRef} className="flex gap-3 mb-8">
              <button
                className="btn btn--primary btn--lg"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                className="btn btn--outline btn--lg flex-shrink-0"
                onClick={() => toggleWishlist(product._id)}
                style={{ width: '56px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Add to Wishlist"
              >
                {wishlisted ? <HiHeart style={{ color: 'var(--error)', fontSize: '24px' }} /> : <HiOutlineHeart style={{ fontSize: '24px' }} />}
              </button>
              <button
                className="btn btn--outline btn--lg flex-shrink-0"
                onClick={handleShare}
                style={{ width: '56px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Share product"
                aria-label="Share product"
              >
                <HiOutlineShare style={{ fontSize: '22px' }} />
              </button>
            </div>

            {/* Accordion List for Details */}
            <div className="detail-accordions" style={{ borderTop: '1px solid var(--border)', marginTop: '32px' }}>
              
              {/* Description Accordion */}
              <div className="detail-accordion" style={{ borderBottom: '1px solid var(--border)' }}>
                <button className="detail-accordion__trigger" onClick={() => toggleSection('description')}>
                  <span>Description</span>
                  <HiOutlineChevronDown style={{ transform: openSection === 'description' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                {openSection === 'description' && (
                  <div className="detail-accordion__content">
                    <p style={{ lineHeight: '1.7', color: 'var(--muted)', fontSize: '13.5px' }}>{product.description}</p>
                    {product.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {product.tags.map((tag) => (
                          <span key={tag} className="badge badge--neutral">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Size & Fit Accordion */}
              <div className="detail-accordion" style={{ borderBottom: '1px solid var(--border)' }}>
                <button className="detail-accordion__trigger" onClick={() => toggleSection('sizefit')}>
                  <span>Size & Fit</span>
                  <HiOutlineChevronDown style={{ transform: openSection === 'sizefit' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                {openSection === 'sizefit' && (
                  <div className="detail-accordion__content">
                    <p style={{ lineHeight: '1.7', color: 'var(--muted)', fontSize: '13.5px' }}>
                      Model is wearing size M. Fits true to size. For relaxed styling, consider sizing up one level.
                    </p>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', marginTop: '8px' }}
                    >
                      Open full measurement guide
                    </button>
                  </div>
                )}
              </div>

              {/* Shipping & Returns Accordion */}
              <div className="detail-accordion" style={{ borderBottom: '1px solid var(--border)' }}>
                <button className="detail-accordion__trigger" onClick={() => toggleSection('shipping')}>
                  <span>Shipping & Returns</span>
                  <HiOutlineChevronDown style={{ transform: openSection === 'shipping' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                {openSection === 'shipping' && (
                  <div className="detail-accordion__content">
                    <p style={{ lineHeight: '1.7', color: 'var(--muted)', fontSize: '13.5px' }}>
                      Free express delivery on all orders. Returns & exchanges accepted within 14 days of delivery.
                    </p>
                  </div>
                )}
              </div>

              {/* Reviews Accordion */}
              <div className="detail-accordion" style={{ borderBottom: '1px solid var(--border)' }}>
                <button className="detail-accordion__trigger" onClick={() => toggleSection('reviews')}>
                  <span>Reviews ({reviews.length})</span>
                  <HiOutlineChevronDown style={{ transform: openSection === 'reviews' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                {openSection === 'reviews' && (
                  <div className="detail-accordion__content">
                    {/* Review Form */}
                    {user && (
                      <form onSubmit={handleSubmitReview} style={{ marginBottom: '32px', padding: '20px', background: 'var(--surface)', borderRadius: '6px' }}>
                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Write a Review</h3>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Rating</label>
                          <StarRating rating={reviewForm.rating} onRate={(r) => setReviewForm({ ...reviewForm, rating: r })} interactive size={18} />
                        </div>
                        <div className="form-group">
                          <label>Title</label>
                          <input className="form-input" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label>Review</label>
                          <textarea className="form-input" rows={3} value={reviewForm.body} onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn--primary btn--sm">Submit Review</button>
                      </form>
                    )}

                    {/* Review list */}
                    {reviews.length === 0 ? (
                      <p style={{ color: 'var(--muted)', fontSize: '13.5px' }}>No reviews yet. Be the first to review!</p>
                    ) : (
                      reviews.map((review) => (
                        <div key={review._id} style={{ borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <StarRating rating={review.rating} size={12} />
                            <strong style={{ fontSize: '13px' }}>{review.user?.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{formatDate(review.createdAt)}</span>
                          </div>
                          <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{review.title}</h4>
                          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{review.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section style={{ marginTop: '64px' }}>
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

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="modal-backdrop" onClick={() => setShowSizeGuide(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>Size Measurement Guide</h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px', lineHeight: '1.5' }}>
              All measurements are in inches. Take your body measurements directly over your skin or form-fitting clothing.
            </p>
            <table className="size-guide-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--charcoal)', textAlign: 'left', fontWeight: '600' }}>
                  <th style={{ padding: '10px 8px' }}>Size</th>
                  <th style={{ padding: '10px 8px' }}>Chest</th>
                  <th style={{ padding: '10px 8px' }}>Waist</th>
                  <th style={{ padding: '10px 8px' }}>Hip</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: '600' }}>S</td>
                  <td style={{ padding: '10px 8px' }}>34 - 36</td>
                  <td style={{ padding: '10px 8px' }}>28 - 30</td>
                  <td style={{ padding: '10px 8px' }}>35 - 37</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: '600' }}>M</td>
                  <td style={{ padding: '10px 8px' }}>38 - 40</td>
                  <td style={{ padding: '10px 8px' }}>32 - 34</td>
                  <td style={{ padding: '10px 8px' }}>39 - 41</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: '600' }}>L</td>
                  <td style={{ padding: '10px 8px' }}>42 - 44</td>
                  <td style={{ padding: '10px 8px' }}>36 - 38</td>
                  <td style={{ padding: '10px 8px' }}>43 - 45</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: '600' }}>XL</td>
                  <td style={{ padding: '10px 8px' }}>46 - 48</td>
                  <td style={{ padding: '10px 8px' }}>40 - 42</td>
                  <td style={{ padding: '10px 8px' }}>47 - 49</td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: '24px', display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'var(--surface)', padding: '12px', borderRadius: '4px', fontSize: '11px', color: 'var(--muted)', lineHeight: '1.4' }}>
              <HiOutlineInformationCircle style={{ fontSize: '16px', color: 'var(--accent)', flexShrink: 0 }} />
              <span>
                If your measurements fall between two sizes, order the smaller size for a tighter fit or the larger size for a looser fit.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Quick-Buy Bar */}
      {product && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/5 p-3 md:hidden flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ${
            showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-12 bg-black/[0.02] rounded overflow-hidden flex-shrink-0 border border-black/5">
              <img
                src={product.images?.[0]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="font-sans text-xs font-bold text-charcoal truncate">{product.name}</div>
              <div className="font-sans text-[11px] text-black/40 mt-0.5">
                {formatPrice(product.price)} {selectedSize && `· Size: ${selectedSize}`}
              </div>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn btn--primary btn--sm py-2 px-6 text-[10.5px] font-sans font-bold uppercase tracking-wider flex-shrink-0"
          >
            {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
