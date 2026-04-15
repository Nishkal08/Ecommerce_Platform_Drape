import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { HiOutlineUser, HiOutlineShoppingBag, HiOutlineHeart, HiOutlineLogout } from 'react-icons/hi';

const AccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Generate initials for Avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: '400', letterSpacing: '-0.02em' }}>My Account</h1>
      </div>
      
      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '64px' }} className="account-grid">
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 768px) {
              .account-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
            }
          `}} />

          {/* Sidebar Menu */}
          <div style={{ paddingRight: '24px', borderRight: '1px solid var(--border)' }} className="account-sidebar">
            <style dangerouslySetInnerHTML={{__html: `
              @media (max-width: 768px) {
                .account-sidebar { border-right: none !important; padding-right: 0 !important; border-bottom: 1px solid var(--border); padding-bottom: 32px; }
              }
            `}} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--charcoal)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontFamily: 'var(--font-serif)' }}>
                {getInitials(user?.name)}
              </div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '18px' }}>{user?.name}</p>
                <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>Member since {new Date(user?.createdAt).getFullYear()}</p>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--surface)', borderRadius: '4px', fontWeight: '500', color: 'var(--charcoal)' }}>
                <HiOutlineUser size={20} />
                Profile Settings
              </Link>
              <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '4px', color: 'var(--muted)', transition: 'background 0.2s' }}>
                <HiOutlineShoppingBag size={20} />
                Order History
              </Link>
              <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '4px', color: 'var(--muted)', transition: 'background 0.2s' }}>
                <HiOutlineHeart size={20} />
                Wishlist
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '4px', color: 'var(--muted)', transition: 'background 0.2s', marginTop: '16px', borderTop: '1px solid var(--border)' }}>
                  Admin Dashboard
                </Link>
              )}
            </nav>

            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', marginTop: '32px', fontWeight: '500' }}>
              <HiOutlineLogout size={20} />
              Sign Out
            </button>
          </div>

          {/* Main Content Pane */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: '600', marginBottom: '32px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Personal Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
              <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Full Name</span>
                <span style={{ fontSize: '16px', color: 'var(--charcoal)' }}>{user?.name}</span>
              </div>
              
              <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Email Address</span>
                <span style={{ fontSize: '16px', color: 'var(--charcoal)' }}>{user?.email}</span>
              </div>
              
              <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Account Type</span>
                <span className={`badge ${user?.role === 'admin' ? 'badge--success' : 'badge--neutral'}`}>{user?.role}</span>
              </div>
              
              <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Date Joined</span>
                <span style={{ fontSize: '16px', color: 'var(--charcoal)' }}>{formatDate(user?.createdAt)}</span>
              </div>
            </div>
            
            <div style={{ marginTop: '48px' }}>
               <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: '600', marginBottom: '32px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Security
              </h2>
               <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Password</span>
                  <span style={{ fontSize: '16px', color: 'var(--charcoal)' }}>••••••••</span>
                </div>
                <button className="btn btn--outline btn--sm">Update Password</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

