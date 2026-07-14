import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
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
      {/* Mobile overlay backdrop */}
      {createPortal(
        <div
          className={`fixed inset-0 top-16 bg-black/40 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={onClose}
        />,
        document.body
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-40 w-[260px] h-[calc(100vh-64px)] bg-gradient-to-b from-[#0D0D0D] to-[#111111] text-white border-r border-white/5 flex flex-col py-7 overflow-y-auto transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className="px-6 mb-9">
          <div className="font-serif text-lg font-bold tracking-widest uppercase text-white">DRAPE</div>
          <div className="font-sans text-[11px] font-normal tracking-wider uppercase text-white/35 mt-1">Admin Console</div>
        </div>

        {/* Navigation */}
        <ul className="list-none flex-1 py-3">
          {navSections.map((section) => (
            <li key={section.label}>
              <div className="font-sans text-[10px] font-semibold tracking-widest uppercase text-white/25 px-6 pt-5 pb-2">
                {section.label}
              </div>
              {section.links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3.5 px-6 py-[11px] text-[13.5px] font-normal border-l-2 transition-all duration-200 hover:text-white/85 hover:bg-white/[0.06] hover:border-l-white/15 ${
                      isActive ? 'text-white bg-white/[0.1] border-l-white font-medium' : 'text-white/50 border-l-transparent'
                    }`}
                    onClick={onClose}
                  >
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </li>
          ))}
        </ul>

        {/* User Profile */}
        <div className="mt-auto px-6 py-5 border-t border-white/8 flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-full bg-[#B05C42] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-sans text-xs font-bold text-white tracking-wide truncate">{user?.name || 'Admin'}</div>
            <div className="font-sans text-[10px] font-normal uppercase text-white/40 mt-0.5 truncate">{user?.role || 'admin'}</div>
          </div>
          <button
            className="text-white/50 hover:text-red-400 text-lg transition-colors p-1 cursor-pointer bg-transparent border-none flex items-center justify-center flex-shrink-0"
            onClick={handleLogout}
            title="Logout"
          >
            <HiOutlineLogout />
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
