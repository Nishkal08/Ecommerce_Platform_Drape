import { useState, useEffect } from 'react';
import { getUsers } from '../../services/adminService';
import { formatDate } from '../../utils/formatDate';
import { HiOutlineSearch } from 'react-icons/hi';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try { const res = await getUsers(); setUsers(res.data.data || []); } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner spinner--center" />;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <HiOutlineSearch className="admin-search__icon" />
          <input
            className="admin-search__input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th></th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id}>
                <td style={{ width: '48px' }}>
                  <div className="user-avatar-initials">{getInitials(u.name)}</div>
                </td>
                <td style={{ fontWeight: '500' }}>{u.name}</td>
                <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge--warning' : 'badge--neutral'}`}
                    style={u.role === 'admin' ? { background: '#fff8e1', color: '#f57f17' } : {}}
                  >
                    {u.role}
                  </span>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsersPage;
