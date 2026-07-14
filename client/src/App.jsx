import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';
import { HiOutlineMenu } from 'react-icons/hi';

// Public pages
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected pages
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import InvoicePage from './pages/InvoicePage';

// Admin pages
import DashboardPage from './pages/admin/DashboardPage';
import ManageProductsPage from './pages/admin/ManageProductsPage';
import AddProductPage from './pages/admin/AddProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import ManageOrdersPage from './pages/admin/ManageOrdersPage';
import ManageCouponsPage from './pages/admin/ManageCouponsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';

// Helpers
import ScrollToTop from './components/ui/ScrollToTop';
import BackToTop from './components/ui/BackToTop';

// Layout wrapper for public pages
const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

// Layout for inner pages (force solid navbar)
const InnerLayout = () => (
  <>
    <Navbar forcesolid />
    <Outlet />
    <Footer />
  </>
);

// Layout for auth pages (transparent navbar, no footer -> now WITH footer per user request)
const AuthLayout = () => (
  <>
    <Navbar isAuth />
    <Outlet />
    <Footer />
  </>
);

// Protected route wrapper
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page"><div className="spinner spinner--center" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

// Admin route wrapper
const AdminRoute = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="page"><div className="spinner spinner--center" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return (
    <div className="fixed inset-x-0 bottom-0 top-16 flex overflow-hidden bg-[#F7F6F3]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 h-full overflow-y-auto p-6 md:p-10">
        <Outlet />
      </div>
      <button
        className="fixed bottom-6 left-6 w-12 h-12 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center z-50 md:hidden shadow-lg border border-white/10 active:scale-95 transition-transform"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle Sidebar"
      >
        <HiOutlineMenu size={20} />
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            fontWeight: '500',
            borderRadius: '6px',
            background: '#1a1a1a',
            color: '#fff',
            padding: '10px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.05)',
          },
          success: {
            iconTheme: { primary: '#fff', secondary: '#000' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        {/* Homepage uses transparent navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Auth pages use full screen layout without footer */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Inner public pages use solid navbar */}
        <Route element={<InnerLayout />}>
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<InnerLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>
        </Route>

        {/* Printable standalone routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/orders/:id/invoice" element={<InvoicePage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<><Navbar forcesolid /><Outlet /></>}>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/products" element={<ManageProductsPage />} />
            <Route path="/admin/products/new" element={<AddProductPage />} />
            <Route path="/admin/products/:id/edit" element={<EditProductPage />} />
            <Route path="/admin/orders" element={<ManageOrdersPage />} />
            <Route path="/admin/coupons" element={<ManageCouponsPage />} />
            <Route path="/admin/users" element={<ManageUsersPage />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route element={<InnerLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <BackToTop />
    </Router>
  );
}

export default App;
