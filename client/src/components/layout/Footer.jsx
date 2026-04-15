import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer bg-white border-t border-[var(--border)] py-12 px-6 md:px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
        <div className="footer__brand lg:col-span-2">
          <h3>DRAPE</h3>
          <p>Wear the edit. Curated fashion for the modern individual.</p>
          <p style={{ marginTop: '16px', fontSize: '13px' }}>
            Free shipping from ₹2,999 · Easy returns within 14 days
          </p>
        </div>
        <div className="footer__nav">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/products?category=men">Men</Link></li>
            <li><Link to="/products?category=women">Women</Link></li>
            <li><Link to="/products?category=accessories">Accessories</Link></li>
            <li><Link to="/products">All Products</Link></li>
          </ul>
        </div>
        <div className="footer__nav">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login">Account</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        © {new Date().getFullYear()} DRAPE. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
