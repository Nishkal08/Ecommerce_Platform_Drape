import { useState, useEffect } from 'react';
import { getDashboard } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { HiCurrencyRupee, HiShoppingBag, HiUsers, HiCollection } from 'react-icons/hi';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const res = await getDashboard(); setData(res.data.data); } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="spinner spinner--center" />;
  if (!data) return <p>Failed to load dashboard</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '32px' }}>Dashboard</h1>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiCurrencyRupee style={{ fontSize: '20px', color: 'var(--success)' }} />
            <span className="stat-card__label">Revenue</span>
          </div>
          <div className="stat-card__value">{formatPrice(data.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiShoppingBag style={{ fontSize: '20px', color: '#1565c0' }} />
            <span className="stat-card__label">Orders</span>
          </div>
          <div className="stat-card__value">{data.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiUsers style={{ fontSize: '20px', color: '#e65100' }} />
            <span className="stat-card__label">Users</span>
          </div>
          <div className="stat-card__value">{data.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiCollection style={{ fontSize: '20px', color: '#6a1b9a' }} />
            <span className="stat-card__label">Products</span>
          </div>
          <div className="stat-card__value">{data.totalProducts}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Recent Orders
          </h3>
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {data.recentOrders?.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontSize: '13px' }}>#{order._id.slice(-6).toUpperCase()}</td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td><span className={`badge badge--${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'info'}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Low Stock Alerts
          </h3>
          {data.lowStockProducts?.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>All products well stocked 👍</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Product</th><th>Stock</th><th>Category</th></tr></thead>
              <tbody>
                {data.lowStockProducts?.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontSize: '13px' }}>{p.name}</td>
                    <td><span className={`badge ${p.stock === 0 ? 'badge--error' : 'badge--warning'}`}>{p.stock}</span></td>
                    <td>{p.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
