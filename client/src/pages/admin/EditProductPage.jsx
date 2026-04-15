import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts, updateProduct } from '../../services/productService';
import { CATEGORIES, SIZES } from '../../utils/constants';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/products?limit=100`);
        const product = res.data.data.products.find(p => p._id === id);
        if (product) {
          setForm({
            name: product.name,
            description: product.description,
            price: product.price,
            comparePrice: product.comparePrice || '',
            stock: product.stock,
            category: product.category,
            tags: (product.tags || []).join(', '),
            sizes: product.sizes || [],
            imageUrl: product.images?.[0]?.url || '',
            isFeatured: product.isFeatured || false,
          });
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleSize = (size) => {
    setForm({
      ...form,
      sizes: form.sizes.includes(size) ? form.sizes.filter(s => s !== size) : [...form.sizes, size],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        comparePrice: Number(form.comparePrice) || 0,
        stock: Number(form.stock),
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        sizes: form.sizes,
        images: form.imageUrl ? [{ url: form.imageUrl }] : [],
        isFeatured: form.isFeatured,
      };
      await updateProduct(id, data);
      toast.success('Product updated!');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner spinner--center" />;
  if (!form) return <p>Product not found</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '32px' }}>Edit Product</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '640px' }}>
        <div className="form-group">
          <label>Product Name</label>
          <input name="name" className="form-input" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" className="form-input" rows={4} value={form.description} onChange={handleChange} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Price (₹)</label>
            <input name="price" type="number" className="form-input" value={form.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Compare Price</label>
            <input name="comparePrice" type="number" className="form-input" value={form.comparePrice} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input name="stock" type="number" className="form-input" value={form.stock} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select name="category" className="form-input" value={form.category} onChange={handleChange}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input name="imageUrl" className="form-input" value={form.imageUrl} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input name="tags" className="form-input" value={form.tags} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Sizes</label>
          <div className="size-selector">
            {SIZES.map(s => (
              <button key={s} type="button" className={`size-btn ${form.sizes.includes(s) ? 'size-btn--active' : ''}`} onClick={() => toggleSize(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
            <span style={{ fontSize: '14px' }}>Featured product</span>
          </label>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn btn--primary btn--lg" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn btn--outline btn--lg" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
