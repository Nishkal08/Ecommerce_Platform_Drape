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

  if (loading) return <div className="spinner spinner--center" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px' }}>Coupons</h1>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--white)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '24px' }}>
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
          <button type="submit" className="btn btn--primary">Create Coupon</button>
        </form>
      )}

      <table className="data-table">
        <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Expires</th><th>Actions</th></tr></thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c._id}>
              <td style={{ fontWeight: '600', letterSpacing: '0.04em' }}>{c.code}</td>
              <td><span className="badge badge--neutral">{c.discountType}</span></td>
              <td>{c.discountType === 'percent' ? `${c.discountValue}%` : formatPrice(c.discountValue)}</td>
              <td>{formatPrice(c.minOrderValue)}</td>
              <td>{c.usedCount}/{c.maxUses}</td>
              <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{formatDate(c.expiresAt)}</td>
              <td><button className="btn btn--danger btn--sm" onClick={() => handleDelete(c._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCouponsPage;
