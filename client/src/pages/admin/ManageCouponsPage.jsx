import { useState, useEffect } from 'react';
import { getCoupons, createCoupon, deleteCoupon } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const ManageCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', discountType: 'percent', discountValue: '', minOrderValue: '', maxUses: 100,
    expiresAt: '', isActive: true,
  });

  const fetchCoupons = async () => {
    try { const res = await getCoupons(); setCoupons(res.data.data || []); } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCoupon({
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxUses: Number(form.maxUses),
      });
      toast.success('Coupon created!');
      setShowForm(false);
      setForm({ code: '', discountType: 'percent', discountValue: '', minOrderValue: '', maxUses: 100, expiresAt: '', isActive: true });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await deleteCoupon(id); toast.success('Deleted'); fetchCoupons(); } catch { toast.error('Failed'); }
  };

  const getDaysLeft = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Today';
    return `${diff}d left`;
  };

  if (loading) return <div className="spinner spinner--center" />;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-subtitle">{coupons.length} active coupons</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Coupon'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="admin-form"
          style={{
            background: 'var(--admin-card)',
            padding: '24px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            marginBottom: '24px',
          }}
        >
          <div className="admin-form-section">
            <div className="admin-form-section__title">Coupon Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Code</label>
                <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                  <option value="percent">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>
              <div className="form-group">
                <label>Value</label>
                <input type="number" className="form-input" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required />
              </div>
            </div>
          </div>
          <div className="admin-form-section">
            <div className="admin-form-section__title">Limits</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Min Order (₹)</label>
                <input type="number" className="form-input" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Max Uses</label>
                <input type="number" className="form-input" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Expires At</label>
                <input type="date" className="form-input" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} required />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn--primary">Create Coupon</button>
        </form>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Usage</th><th>Expires</th><th>Actions</th></tr></thead>
          <tbody>
            {coupons.map((c) => {
              const usagePercent = c.maxUses > 0 ? Math.round((c.usedCount / c.maxUses) * 100) : 0;
              const daysLeft = getDaysLeft(c.expiresAt);
              const isExpired = daysLeft === 'Expired';

              return (
                <tr key={c._id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600', letterSpacing: '0.06em', fontSize: '13px' }}>
                      {c.code}
                    </span>
                  </td>
                  <td><span className="badge badge--neutral">{c.discountType}</span></td>
                  <td>{c.discountType === 'percent' ? `${c.discountValue}%` : formatPrice(c.discountValue)}</td>
                  <td>{formatPrice(c.minOrderValue)}</td>
                  <td>
                    <div className="coupon-progress">
                      <div className="coupon-progress__bar">
                        <div className="coupon-progress__fill" style={{ width: `${usagePercent}%` }} />
                      </div>
                      <span className="coupon-progress__text">{c.usedCount}/{c.maxUses}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${isExpired ? 'badge--error' : 'badge--expiry'}`}>
                      {daysLeft}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn--danger btn--sm" onClick={() => handleDelete(c._id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCouponsPage;
