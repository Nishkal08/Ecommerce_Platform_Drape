import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/formatDate';

const statusBadge = (status) => {
  const map = { pending: 'warning', paid: 'info', processing: 'info', shipped: 'info', delivered: 'success', cancelled: 'error' };
  return `badge badge--${map[status] || 'neutral'}`;
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data.data || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="page"><div className="spinner spinner--center" /></div>;

  return (
    <div className="page">
      <div className="page-header"><h1>My Orders</h1></div>
      <div className="page-content">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here.</p>
            <Link to="/products" className="btn btn--primary">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => (
              <Link to={`/orders/${order._id}`} key={order._id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 0.2s' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
                    Order #{order._id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
                  </div>
                  <div style={{ fontWeight: '600' }}>
                    {order.items.length} item{order.items.length > 1 ? 's' : ''} · {formatPrice(order.total)}
                  </div>
                </div>
                <span className={statusBadge(order.status)}>{order.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
