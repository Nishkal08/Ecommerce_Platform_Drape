import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboard, getChartData } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import {
  HiCurrencyRupee,
  HiShoppingBag,
  HiUsers,
  HiCollection,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineTag,
} from 'react-icons/hi';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '12m', label: '12M' },
];

// Custom tooltip matching the DRAPE design language
const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1A1A1A',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ marginBottom: '4px', opacity: 0.6, fontSize: '11px' }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: '14px' }}>
        {formatter ? formatter(payload[0].value) : payload[0].value}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('7d');
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const res = await getDashboard(); setData(res.data.data); } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadChart = async () => {
      setChartLoading(true);
      try {
        const res = await getChartData(chartPeriod);
        setChartData(res.data.data || []);
      } catch {
        setChartData([]);
      }
      setChartLoading(false);
    };
    loadChart();
  }, [chartPeriod]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatToday = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) return <div className="spinner spinner--center" />;
  if (!data) return <p>Failed to load dashboard</p>;

  // Period selector component (shared between both charts)
  const PeriodSelector = () => (
    <div className="admin-chart-period">
      {PERIOD_OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={`admin-chart-period__btn ${chartPeriod === opt.value ? 'admin-chart-period__btn--active' : ''}`}
          onClick={() => setChartPeriod(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {/* Welcome Header */}
      <div className="admin-welcome">
        <div className="admin-welcome__greeting">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}
        </div>
        <div className="admin-welcome__date">{formatToday()}</div>
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <Link to="/admin/products/new" className="btn btn--primary">
          <HiOutlinePlus /> Add Product
        </Link>
        <Link to="/admin/orders" className="btn btn--outline">
          <HiOutlineEye /> View Orders
        </Link>
        <Link to="/admin/coupons" className="btn btn--outline">
          <HiOutlineTag /> Coupons
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--green">
              <HiCurrencyRupee />
            </div>
            <span className="stat-card__label">Revenue</span>
          </div>
          <div className="stat-card__value">{formatPrice(data.totalRevenue)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--blue">
              <HiShoppingBag />
            </div>
            <span className="stat-card__label">Orders</span>
          </div>
          <div className="stat-card__value">{data.totalOrders}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--amber">
              <HiUsers />
            </div>
            <span className="stat-card__label">Users</span>
          </div>
          <div className="stat-card__value">{data.totalUsers}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--purple">
              <HiCollection />
            </div>
            <span className="stat-card__label">Products</span>
          </div>
          <div className="stat-card__value">{data.totalProducts}</div>
        </div>
      </div>

      {/* ===== CHARTS SECTION ===== */}
      <div className="admin-charts">
        {/* Revenue Area Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-card__header">
            <div className="admin-chart-card__title">Revenue</div>
            <PeriodSelector />
          </div>
          <div className="admin-chart-card__body">
            {chartLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="spinner" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="admin-empty" style={{ padding: '40px 0' }}>
                <div className="admin-empty__text">No revenue data for this period</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B6860', fontFamily: 'DM Sans' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B6860', fontFamily: 'DM Sans' }}
                    tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                  />
                  <Tooltip content={<ChartTooltip formatter={(v) => formatPrice(v)} />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2D6A4F"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#2D6A4F', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-card__header">
            <div className="admin-chart-card__title">Orders</div>
            <PeriodSelector />
          </div>
          <div className="admin-chart-card__body">
            {chartLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="spinner" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="admin-empty" style={{ padding: '40px 0' }}>
                <div className="admin-empty__text">No order data for this period</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B6860', fontFamily: 'DM Sans' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B6860', fontFamily: 'DM Sans' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="orders"
                    fill="#1565c0"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={chartPeriod === '7d' ? 32 : chartPeriod === '30d' ? 14 : 28}
                    fillOpacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Grid — Recent Orders + Low Stock */}
      <div className="admin-dashboard-grid">
        {/* Recent Orders */}
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card__title">Recent Orders</div>
          {data.recentOrders?.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty__icon">📦</div>
              <div className="admin-empty__text">No orders yet</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.recentOrders?.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontSize: '13px', fontWeight: '500' }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td style={{ fontWeight: '600' }}>{formatPrice(order.total)}</td>
                    <td>
                      <span className={`badge badge--${
                        order.status === 'delivered' ? 'success'
                        : order.status === 'cancelled' ? 'error'
                        : 'info'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card__title">Low Stock Alerts</div>
          {data.lowStockProducts?.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty__icon">👍</div>
              <div className="admin-empty__text">All products well stocked</div>
            </div>
          ) : (
            <div className="low-stock-list">
              {data.lowStockProducts?.map((p) => (
                <div className="low-stock-item" key={p._id}>
                  <div className="low-stock-item__thumb">
                    {p.images?.[0]?.url && (
                      <img src={p.images[0].url} alt={p.name} />
                    )}
                  </div>
                  <div className="low-stock-item__info">
                    <div className="low-stock-item__name">{p.name}</div>
                    <div className="low-stock-item__category">{p.category}</div>
                  </div>
                  <div className="low-stock-item__stock-bar">
                    <span className={`badge ${p.stock === 0 ? 'badge--error' : 'badge--warning'}`}>
                      {p.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
