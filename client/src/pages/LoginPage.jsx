import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-layout__image">
        <img src="/hero-bg.avif" alt="DRAPE Fashion" />
        <div className="auth-layout__image-overlay">
          <h2>Elevate your everyday wardrobe.</h2>
        </div>
      </div>
      <div className="auth-layout__content">
        <div className="auth-layout__form-wrapper">
          <h1>Welcome Back</h1>
          <p>Sign in to your DRAPE account to continue</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                required 
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="auth-layout__footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
