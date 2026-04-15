import { useState, useEffect } from 'react';
import { getUsers } from '../../services/adminService';
import { formatDate } from '../../utils/formatDate';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const res = await getUsers(); setUsers(res.data.data || []); } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="spinner spinner--center" />;

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '32px' }}>Users</h1>
      <table className="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td style={{ fontWeight: '500' }}>{u.name}</td>
              <td style={{ color: 'var(--muted)' }}>{u.email}</td>
              <td><span className={`badge ${u.role === 'admin' ? 'badge--success' : 'badge--neutral'}`}>{u.role}</span></td>
              <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{formatDate(u.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsersPage;
