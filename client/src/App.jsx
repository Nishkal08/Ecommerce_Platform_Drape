import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';

// Public pages
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

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
  if (loading) return <div className="page"><div className="spinner spinner--center" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return (
    <div className="page">
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: '500',
            borderRadius: '0px',
            background: 'rgba(26, 26, 26, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '14px 24px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
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

        {/* Inner public pages use solid navbar */}
        <Route element={<InnerLayout />}>
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
