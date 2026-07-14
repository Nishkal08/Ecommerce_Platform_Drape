import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineShoppingBag,
  HiOutlineCollection,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineLogout,
} from 'react-icons/hi';

const navSections = [
  {
    label: 'Overview',
    links: [
      { path: '/admin', label: 'Dashboard', icon: <HiOutlineViewGrid /> },
    ],
  },
  {
    label: 'Management',
    links: [
      { path: '/admin/products', label: 'Products', icon: <HiOutlineCollection /> },
      { path: '/admin/orders', label: 'Orders', icon: <HiOutlineShoppingBag /> },
      { path: '/admin/coupons', label: 'Coupons', icon: <HiOutlineTag /> },
      { path: '/admin/users', label: 'Users', icon: <HiOutlineUsers /> },
    ],
  },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`admin-sidebar-overlay ${isOpen ? 'admin-sidebar-overlay--open' : ''}`}
        onClick={onClose}
      />

      <aside className={`admin-sidebar ${isOpen ? 'admin-sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__title">DRAPE</div>
          <div className="admin-sidebar__subtitle">Admin Console</div>
        </div>

        {/* Navigation */}
        <ul className="admin-sidebar__nav">
          {navSections.map((section) => (
            <li key={section.label}>
              <div className="admin-sidebar__section-label">{section.label}</div>
              {section.links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={location.pathname === link.path ? 'active' : ''}
                  onClick={onClose}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </li>
          ))}
        </ul>

        {/* User */}
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar">{getInitials(user?.name)}</div>
          <div className="admin-sidebar__user-info">
            <div className="admin-sidebar__user-name">{user?.name || 'Admin'}</div>
            <div className="admin-sidebar__user-role">{user?.role || 'admin'}</div>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout} title="Logout">
            <HiOutlineLogout />
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
