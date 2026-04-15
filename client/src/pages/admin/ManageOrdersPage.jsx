import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { ORDER_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders({ limit: 50 });
      setOrders(res.data.data.orders || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div className="spinner spinner--center" />;

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '32px' }}>Manage Orders</h1>
      <table className="data-table">
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td style={{ fontSize: '13px', fontWeight: '500' }}>#{order._id.slice(-6).toUpperCase()}</td>
              <td>{order.user?.name || 'N/A'}</td>
              <td>{order.items?.length || 0}</td>
              <td style={{ fontWeight: '600' }}>{formatPrice(order.total)}</td>
              <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{formatDate(order.createdAt)}</td>
              <td>
                <select
                  className="form-input"
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
                >
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageOrdersPage;
