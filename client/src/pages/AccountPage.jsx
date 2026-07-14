import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { updateProfile, addAddress, deleteAddress } from '../services/authService';
import { HiOutlineUser, HiOutlineShoppingBag, HiOutlineHeart, HiOutlineLogout, HiOutlineLocationMarker, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AccountPage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation tab/state
  const [activeTab, setActiveTab] = useState('profile'); // profile, addresses

  // Profile Edit state
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address Add state
  const [addressData, setAddressData] = useState({ name: '', line1: '', city: '', state: '', pincode: '', phone: '' });
  const [savingAddress, setSavingAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setAddressData({ ...addressData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await updateProfile(profileData);
      setUser(res.data.data);
      setProfileData({ ...profileData, password: '' });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await addAddress(addressData);
      setUser(res.data.data);
      setAddressData({ name: '', line1: '', city: '', state: '', pincode: '', phone: '' });
      setShowAddressForm(false);
      toast.success('Address added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await deleteAddress(addressId);
      setUser(res.data.data);
      toast.success('Address deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

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
              <button
                onClick={() => setActiveTab('profile')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: activeTab === 'profile' ? 'var(--surface)' : 'none', border: 'none', width: '100%', textAlign: 'left', borderRadius: '4px', fontWeight: '500', color: activeTab === 'profile' ? 'var(--charcoal)' : 'var(--muted)', cursor: 'pointer' }}
              >
                <HiOutlineUser size={20} />
                Profile Settings
              </button>
              
              <button
                onClick={() => setActiveTab('addresses')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: activeTab === 'addresses' ? 'var(--surface)' : 'none', border: 'none', width: '100%', textAlign: 'left', borderRadius: '4px', fontWeight: '500', color: activeTab === 'addresses' ? 'var(--charcoal)' : 'var(--muted)', cursor: 'pointer' }}
              >
                <HiOutlineLocationMarker size={20} />
                Saved Addresses
              </button>

              <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '4px', color: 'var(--muted)', transition: 'background 0.2s', textDecoration: 'none' }}>
                <HiOutlineShoppingBag size={20} />
                Order History
              </Link>
              
              <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '4px', color: 'var(--muted)', transition: 'background 0.2s', textDecoration: 'none' }}>
                <HiOutlineHeart size={20} />
                Wishlist
              </Link>

              {user?.role === 'admin' && (
                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '4px', color: 'var(--muted)', transition: 'background 0.2s', marginTop: '16px', borderTop: '1px solid var(--border)', textDecoration: 'none' }}>
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
          <div style={{ minWidth: 0 }}>
            
            {/* TABS 1: PROFILE EDIT */}
            {activeTab === 'profile' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: '600', marginBottom: '32px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Personal Information
                </h2>

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input name="name" className="form-input" value={profileData.name} onChange={handleProfileChange} required />
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address</label>
                    <input name="email" type="email" className="form-input" value={profileData.email} onChange={handleProfileChange} required />
                  </div>

                  <div className="form-group">
                    <label>New Password (leave blank to keep current)</label>
                    <input name="password" type="password" className="form-input" placeholder="••••••••" value={profileData.password} onChange={handleProfileChange} />
                  </div>

                  <button type="submit" className="btn btn--primary" style={{ width: 'fit-content', marginTop: '12px' }} disabled={updatingProfile}>
                    {updatingProfile ? 'Saving...' : 'Save Settings'}
                  </button>
                </form>

                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '4px', marginTop: '40px', maxWidth: '480px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Account Joined</span>
                  <span style={{ fontSize: '14px', color: 'var(--charcoal)' }}>{formatDate(user?.createdAt)}</span>
                </div>
              </div>
            )}

            {/* TABS 2: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: '600', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    Saved Addresses
                  </h2>
                  <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn btn--outline btn--sm">
                    {showAddressForm ? 'Cancel' : '+ Add Address'}
                  </button>
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px', marginBottom: '40px', padding: '24px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--surface)' }}>
                    <div className="form-group">
                      <label>Receiver Name</label>
                      <input name="name" className="form-input" value={addressData.name} onChange={handleAddressChange} required />
                    </div>
                    <div className="form-group">
                      <label>Address Line</label>
                      <input name="line1" className="form-input" value={addressData.line1} onChange={handleAddressChange} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label>City</label>
                        <input name="city" className="form-input" value={addressData.city} onChange={handleAddressChange} required />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input name="state" className="form-input" value={addressData.state} onChange={handleAddressChange} required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label>Pincode</label>
                        <input name="pincode" className="form-input" value={addressData.pincode} onChange={handleAddressChange} required />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input name="phone" className="form-input" value={addressData.phone} onChange={handleAddressChange} required />
                      </div>
                    </div>
                    <button type="submit" className="btn btn--primary" disabled={savingAddress}>
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </form>
                )}

                {/* List of saved addresses */}
                {(!user?.addresses || user.addresses.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '6px' }}>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No shipping addresses saved yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {user.addresses.map((addr) => (
                      <div key={addr._id} style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '20px', position: 'relative', background: 'var(--white)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--charcoal)' }}>{addr.name}</span>
                          <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.4' }}>{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</span>
                          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Phone: {addr.phone}</span>
                          {addr.isDefault && (
                            <span style={{ marginTop: '8px', fontSize: '9px', fontWeight: '600', color: 'var(--accent)', background: 'rgba(176, 92, 66, 0.08)', padding: '2px 6px', borderRadius: '3px', width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Default
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                          className="address-delete-btn"
                          title="Delete address"
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
