import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { ORDER_STATUSES } from '../../utils/constants';
import { HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

const FILTER_TABS = ['all', ...ORDER_STATUSES];

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

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

  const filtered = orders.filter(o => {
    const matchesFilter = activeFilter === 'all' || o.status === activeFilter;
    const matchesSearch = !search ||
      (o.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      o._id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="spinner spinner--center" />;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manage Orders</h1>
          <p className="admin-page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <HiOutlineSearch className="admin-search__icon" />
          <input
            className="admin-search__input"
            placeholder="Search by customer or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="admin-filter-tabs" style={{ marginBottom: '20px' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            className={`admin-filter-tab ${activeFilter === tab ? 'admin-filter-tab--active' : ''}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="admin-empty">
                    <div className="admin-empty__text">No orders found</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
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
                      style={{
                        width: 'auto',
                        padding: '6px 10px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        fontWeight: '500',
                      }}
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageOrdersPage;
