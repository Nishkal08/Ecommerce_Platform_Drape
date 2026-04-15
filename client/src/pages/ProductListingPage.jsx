import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import { getProducts } from '../services/productService';
import useDebounce from '../hooks/useDebounce';
import { CATEGORIES, SORT_OPTIONS, SIZES } from '../utils/constants';
import { HiSearch } from 'react-icons/hi';

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const debouncedSearch = useDebounce(search, 300);

  // Sync state with URL params (enables navbar link switching)
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    if (cat !== category) {
      setCategory(cat);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, sort };
        if (category) params.category = category;
        if (debouncedSearch) params.search = debouncedSearch;
        const res = await getProducts(params);
        setProducts(res.data.data.products || []);
        setTotalPages(res.data.data.pages || 1);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, debouncedSearch, sort, page]);

  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (sort !== 'newest') params.sort = sort;
    if (page > 1) params.page = page;
    setSearchParams(params);
  }, [category, search, sort, page]);

  const isCategoryHero = category === 'men' || category === 'women';
  
  return (
    <div className={!isCategoryHero ? "page" : ""}>
      {isCategoryHero ? (
        <section style={{ position: 'relative', width: '100%', height: '85vh', minHeight: '600px', overflow: 'hidden', background: '#1a1a1a', marginBottom: '40px' }}>
          <img 
            src={category === 'men' ? '/men-hero.png' : '/women-hero.png'} 
            alt={`${category} collection`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: category === 'women' ? 'center 15%' : 'center 5%' }}
            loading="eager"
          />
          
          {/* Authentic Film Grain Overlay Layer */}
          <div style={{ 
            position: 'absolute', 
            top: 0, left: 0, width: '100%', height: '100%', 
            pointerEvents: 'none', 
            zIndex: 1, 
            opacity: 0.18, 
            mixBlendMode: 'overlay',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
          }}></div>

          {/* Top Gradient for Navbar legibility over light images */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '25%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }}></div>
          
          {/* Sharp Bottom Gradient strictly matching MARION demo */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '35%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 35%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }}></div>
          
          <h1 className="absolute bottom-8 left-6 md:bottom-12 md:left-12 z-10 m-0 text-white font-sans font-semibold tracking-tight shadow-black/40" style={{ 
            fontSize: 'clamp(40px, 8vw, 84px)', 
            textShadow: '0 4px 24px rgba(0,0,0,0.5)'
          }}>
            For {category === 'men' ? 'Men' : 'Women'}
          </h1>
        </section>
      ) : (
        <div className="page-header">
          <h1>{category ? CATEGORIES.find(c => c.value === category)?.label || 'Products' : 'All Products'}</h1>
        </div>
      )}
      <div className={`page-content ${isCategoryHero ? 'pt-0' : ''}`} style={isCategoryHero ? { maxWidth: '1440px', margin: '0 auto', padding: '0 48px' } : {}}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <h3>Filters</h3>

            {/* Search */}
            <div className="filter-group">
              <h4>Search</h4>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  style={{ paddingLeft: '36px' }}
                />
                <HiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              </div>
            </div>

            {/* Category */}
            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                <div
                  className={`filter-option ${!category ? 'filter-option--active' : ''}`}
                  onClick={() => { setCategory(''); setPage(1); }}
                >
                  All
                </div>
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.value}
                    className={`filter-option ${category === cat.value ? 'filter-option--active' : ''}`}
                    onClick={() => { setCategory(cat.value); setPage(1); }}
                  >
                    {cat.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="filter-group">
              <h4>Sort By</h4>
              <select
                className="form-input"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 w-full">
            {/* Mobile filters hidden since they are now stacked */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <select
                className="form-input"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                style={{ width: 'auto', display: 'none' }}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="spinner spinner--center" />
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term.</p>
                <button className="btn btn--outline" onClick={() => { setSearch(''); setCategory(''); }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={p === page ? 'active' : ''}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
