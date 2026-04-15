import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/productService';
import { CATEGORIES, SIZES } from '../../utils/constants';
import toast from 'react-hot-toast';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', description: '', price: '', comparePrice: '', stock: '',
    category: 'men', tags: '', sizes: ['S', 'M', 'L', 'XL'],
    imageUrl: '', isFeatured: false,
  });
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
      await createProduct(data);
      toast.success('Product created!');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '32px' }}>Add Product</h1>
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
          <input name="imageUrl" className="form-input" value={form.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/..." />
        </div>
        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input name="tags" className="form-input" value={form.tags} onChange={handleChange} placeholder="casual, summer, basics" />
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
          <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <button type="button" className="btn btn--outline btn--lg" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
