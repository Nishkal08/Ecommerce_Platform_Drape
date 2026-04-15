import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-layout__image">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Alia_Bhatt_at_Berlinale_2022_Ausschnitt.jpg/1280px-Alia_Bhatt_at_Berlinale_2022_Ausschnitt.jpg" alt="Alia Bhatt DRAPE" style={{ objectPosition: 'center 20%' }} />
      </div>
      <div className="auth-layout__content">
        <div className="auth-layout__form-wrapper">
          <h1>Create Account</h1>
          <p>Join DRAPE for an elevated shopping experience</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
                placeholder="Enter your full name"
              />
            </div>
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
                placeholder="Create a password (min 6 chars)"
              />
            </div>
            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-layout__footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
