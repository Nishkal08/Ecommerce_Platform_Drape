import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronDown } from 'react-icons/hi';
import ProductCard from '../components/ui/ProductCard';
import { getFeaturedProducts } from '../services/productService';
import InitialLoader from '../components/ui/InitialLoader';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFeaturedProducts();
        const products = res.data.data || [];
        setFeatured(products);

        // Preload Hero & Featured Product Images
        const imageUrls = ['/hero-bg.avif'];
        products.slice(0, 4).forEach(p => {
          if (p.images && p.images[0]) {
            imageUrls.push(p.images[0].url);
          }
        });

        const imagePromises = imageUrls.map(src => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = resolve; // Resolve anyway to prevent infinite hang
          });
        });

        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch {
        setImagesLoaded(true); // Failsafe
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {showLoader && (
        <InitialLoader onComplete={() => setShowLoader(false)} ready={imagesLoaded} />
      )}
      
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="/hero-bg.avif"
            alt="DRAPE Fashion Collection"
            loading="eager"
          />
        </div>
        <div className="absolute inset-x-0 bottom-20 z-10 flex flex-col items-center text-center px-6 md:bottom-24 md:items-start md:text-left md:px-16" style={{ color: 'var(--white)' }}>
          <span className="font-sans text-xs tracking-widest opacity-80 mb-3 uppercase">(Featured Collection)</span>
          <h1 className="font-serif text-[clamp(40px,10vw,64px)] leading-tight font-medium mb-8 text-white shadow-black/30" style={{ textShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            The New Edit<br /><em className="font-light italic">for the Season.</em>
          </h1>
          <div className="flex flex-col w-full gap-4 md:flex-row md:w-auto">
            <Link to="/products?category=women" className="w-full text-center px-8 py-3.5 font-sans text-sm tracking-widest uppercase bg-white text-black border border-white hover:bg-transparent hover:text-white transition-colors duration-300 md:w-auto">Shop Women</Link>
            <Link to="/products?category=men" className="w-full text-center px-8 py-3.5 font-sans text-sm tracking-widest uppercase bg-transparent text-white border border-white hover:bg-white hover:text-black transition-colors duration-300 md:w-auto">Shop Men</Link>
          </div>
        </div>
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-[0.15em] uppercase flex flex-col items-center gap-2 transition-opacity duration-300 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
          <span>Scroll</span>
          <span className="animate-bounce"><HiChevronDown className="text-xl" /></span>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ background: 'var(--ivory)' }}>
        <div className="section__heading">
          <h2><em>Featured Pieces</em></h2>
          <p>Curated essentials for the modern wardrobe</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {featured.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/products" className="btn btn--outline">View All Products</Link>
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="section" style={{ background: 'var(--ivory)', paddingTop: 0 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/products?category=men" className="category-tile flex-1 w-full h-80 md:h-96 relative overflow-hidden group mb-4 md:mb-0">
            <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80" alt="Men's Collection" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
            <div className="category-tile__label absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-serif text-2xl z-10 tracking-wider uppercase drop-shadow-md">Men</div>
          </Link>
          <Link to="/products?category=women" className="category-tile flex-1 w-full h-80 md:h-96 relative overflow-hidden group mb-4 md:mb-0">
            <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80" alt="Women's Collection" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
            <div className="category-tile__label absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-serif text-2xl z-10 tracking-wider uppercase drop-shadow-md">Women</div>
          </Link>
          <Link to="/products?category=accessories" className="category-tile flex-1 w-full h-80 md:h-96 relative overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80" alt="Accessories" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
            <div className="category-tile__label absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-serif text-2xl z-10 tracking-wider uppercase drop-shadow-md">Accessories</div>
          </Link>
        </div>
      </section>

      {/* EDITORIAL BANNER */}
      <section className="editorial-banner">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80" alt="Editorial" loading="lazy" />
        <div className="editorial-banner__content">
          <h2><em>"Pieces beyond seasons, created to remain timeless."</em></h2>
          <Link to="/products" className="btn-hero">Shop the Look</Link>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {featured.length > 4 && (
        <section className="section" style={{ background: 'var(--ivory)' }}>
          <div className="section__heading">
            <h2><em>New Arrivals</em></h2>
            <p>This season's must-haves</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {featured.slice(4, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <section className="section section--surface">
        <div className="newsletter">
          <h2>Stay in the Edit.</h2>
          <p>Subscribe for new arrivals, exclusive offers, and editorial updates.</p>
          <form className="newsletter__form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" className="form-input" />
            <button type="submit" className="btn btn--primary">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
};

export default HomePage;
