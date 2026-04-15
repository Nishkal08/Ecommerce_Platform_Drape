import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact/send', form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '64px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', fontWeight: '400', letterSpacing: '-0.02em' }}>Contact</h1>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '64px' }}>
          
          {/* Top Row: Intro & Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }} className="contact-grid">
            <style dangerouslySetInnerHTML={{__html: `
              @media (min-width: 992px) {
                .contact-grid { grid-template-columns: 1fr 1fr !important; }
                .store-grid { grid-template-columns: repeat(3, 1fr) !important; }
              }
            `}} />
            
            <div style={{ paddingRight: '40px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '16px' }}>Get in Touch</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '32px', lineHeight: '1.7', fontSize: '15px' }}>
                Whether you have a question about our collections, need styling advice, or require assistance with your order,
                our dedicated concierge team is available to assist you.
              </p>
              
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px' }}>Client Services</p>
                <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '4px' }}>concierge@drape.com</p>
                <p style={{ color: 'var(--muted)', fontSize: '15px' }}>+1 (800) 555-0199</p>
              </div>

              <div>
                <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px' }}>Hours of Operation</p>
                <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Mon–Fri: 9:00 AM – 8:00 PM EST<br/>Sat–Sun: 10:00 AM – 6:00 PM EST</p>
              </div>
            </div>

            <div>
              <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', padding: '40px', borderRadius: '4px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal)', marginBottom: '8px', display: 'block' }}>Name</label>
                  <input type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Enter your name" style={{ background: 'var(--white)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal)', marginBottom: '8px', display: 'block' }}>Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="Enter your email" style={{ background: 'var(--white)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal)', marginBottom: '8px', display: 'block' }}>Message</label>
                  <textarea className="form-input" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder="How can we help?" style={{ background: 'var(--white)' }} />
                </div>
                <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading} style={{ marginTop: '16px' }}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '24px 0' }}></div>

          {/* Bottom Row: Flagship Stores */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '40px', textAlign: 'center' }}>Flagship Boutiques</h2>
            
            <div className="store-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '300px', marginBottom: '24px', overflow: 'hidden', background: 'var(--surface)' }}>
                  <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop" alt="New York Boutique" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>New York</h3>
                <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>
                  110 Greene Street<br/>SoHo, NY 10012<br/>United States
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '300px', marginBottom: '24px', overflow: 'hidden', background: 'var(--surface)' }}>
                  <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop" alt="London Boutique" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>London</h3>
                <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>
                  45 Mount Street<br/>Mayfair, W1K 2RZ<br/>United Kingdom
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '300px', marginBottom: '24px', overflow: 'hidden', background: 'var(--surface)' }}>
                  <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop" alt="Paris Boutique" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Paris</h3>
                <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>
                  235 Rue Saint-Honoré<br/>75001 Paris<br/>France
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;

