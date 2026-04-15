import { Link, useLocation } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineShoppingBag, HiOutlineCollection, HiOutlineTag, HiOutlineUsers } from 'react-icons/hi';

const links = [
  { path: '/admin', label: 'Dashboard', icon: <HiOutlineViewGrid /> },
  { path: '/admin/products', label: 'Products', icon: <HiOutlineCollection /> },
  { path: '/admin/orders', label: 'Orders', icon: <HiOutlineShoppingBag /> },
  { path: '/admin/coupons', label: 'Coupons', icon: <HiOutlineTag /> },
  { path: '/admin/users', label: 'Users', icon: <HiOutlineUsers /> },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__title">DRAPE Admin</div>
      <ul className="admin-sidebar__nav">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.icon}
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default AdminSidebar;
