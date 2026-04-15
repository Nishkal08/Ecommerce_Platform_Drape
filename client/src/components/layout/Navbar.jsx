import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineHeart, HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiX } from 'react-icons/hi';
import useScrollNav from '../../hooks/useScrollNav';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ forcesolid, isAuth }) => {
  const isScrolled = useScrollNav();
  const location = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isHome = location.pathname === '/';
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');
  const isCategoryHero = location.pathname === '/products' && (category === 'men' || category === 'women');

  const solid = (forcesolid && !isCategoryHero) || (!isHome && !isCategoryHero) || isScrolled;
  let navClass = solid ? 'navbar--solid' : 'navbar--transparent';
  if (isAuth) navClass = 'navbar--auth-dark';

  return (
    <>
      <nav className={`navbar px-4 md:px-12 ${navClass}`}>
        {/* Left Side: Desktop Links or Mobile Hamburger */}
        <div className="flex items-center flex-1">
          <button className="md:hidden block text-2xl -ml-1" onClick={() => setDrawerOpen(true)} aria-label="Menu">
            <HiOutlineMenu />
          </button>
          <ul className="navbar__links hidden md:flex">
            <li><Link to="/products?category=men">Men</Link></li>
            <li><Link to="/products?category=women">Women</Link></li>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Center: Brand */}
        <Link to="/" className="navbar__brand">DRAPE</Link>

        {/* Right Side: Icons */}
        <div className="navbar__icons flex-1 flex justify-end">
          <Link to="/products" aria-label="Search"><HiOutlineSearch /></Link>
          <Link to={user ? '/wishlist' : '/login'} aria-label="Wishlist"><HiOutlineHeart /></Link>
          <Link to="/cart" aria-label="Cart" style={{ position: 'relative' }}>
            <HiOutlineShoppingBag />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <div className="hidden md:flex ml-6 items-center">
            {user ? (
              <Link to="/account" aria-label="Account" title="My Account" className="relative group flex items-center justify-center w-9 h-9 rounded-full overflow-hidden">
                <span className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <HiOutlineUser style={{ fontSize: '18px' }} className="group-hover:scale-110 transition-transform duration-300" />
              </Link>
            ) : (
             <Link to="/login" className="group flex items-center transition-all duration-500 cursor-pointer">
               <div className="relative flex items-center justify-center w-9 h-9 rounded-full">
                 <span className="absolute inset-0 border border-current opacity-20 group-hover:opacity-50 rounded-full transition-opacity duration-500"></span>
                 <HiOutlineUser style={{ fontSize: '18px' }} className="group-hover:scale-[1.15] transition-transform duration-500 ease-out" />
               </div>
               <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] w-0 group-hover:w-[64px] opacity-0 group-hover:opacity-100 flex items-center">
                 <span className="text-[11px] font-medium tracking-[0.1em] uppercase ml-3 whitespace-nowrap pt-[1px] transform -translate-x-4 group-hover:translate-x-0 transition-transform duration-500 ease-out">
                   Login
                 </span>
               </div>
             </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${drawerOpen ? 'mobile-drawer--open' : ''}`}>
        <button className="mobile-drawer__close" onClick={() => setDrawerOpen(false)}>
          <HiX />
        </button>
        <ul className="mobile-drawer__links">
          <li><Link to="/products?category=men" onClick={() => setDrawerOpen(false)}>Men</Link></li>
          <li><Link to="/products?category=women" onClick={() => setDrawerOpen(false)}>Women</Link></li>
          <li><Link to="/about" onClick={() => setDrawerOpen(false)}>Our Story</Link></li>
          <li><Link to="/contact" onClick={() => setDrawerOpen(false)}>Contact</Link></li>
          {user ? (
            <>
              <li><Link to="/account" onClick={() => setDrawerOpen(false)}>Account</Link></li>
              {user.role === 'admin' && (
                <li><Link to="/admin" onClick={() => setDrawerOpen(false)}>Admin</Link></li>
              )}
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={() => setDrawerOpen(false)}>Login</Link></li>
              <li><Link to="/register" onClick={() => setDrawerOpen(false)}>Sign Up</Link></li>
            </>
          )}
        </ul>
        <div className="mobile-drawer__icons">
          <Link to="/products" onClick={() => setDrawerOpen(false)}><HiOutlineSearch /></Link>
          <Link to={user ? '/wishlist' : '/login'} onClick={() => setDrawerOpen(false)}><HiOutlineHeart /></Link>
          <Link to="/cart" onClick={() => setDrawerOpen(false)} style={{ position: 'relative' }}>
            <HiOutlineShoppingBag />
            {cartCount > 0 && <span className="cart-badge" style={{ background: '#fff', color: '#1a1a1a' }}>{cartCount}</span>}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
