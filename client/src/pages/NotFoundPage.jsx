import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="page-content" style={{ textAlign: 'center', maxWidth: '480px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '80px', color: 'var(--accent)', fontWeight: '400', marginBottom: '16px' }}>
          404
        </h1>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Page Not Found
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn--primary">
            Go Home
          </Link>
          <Link to="/products" className="btn btn--outline">
            Shop Collection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
