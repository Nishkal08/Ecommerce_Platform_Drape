import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/productService';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

const ManageProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await getProducts({ limit: 100 });
      setProducts(res.data.data.products || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="spinner spinner--center" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px' }}>Products</h1>
        <Link to="/admin/products/new" className="btn btn--primary">+ Add Product</Link>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td><img src={p.images?.[0]?.url} alt={p.name} style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} /></td>
              <td style={{ fontWeight: '500' }}>{p.name}</td>
              <td><span className="badge badge--neutral">{p.category}</span></td>
              <td>{formatPrice(p.price)}</td>
              <td><span className={`badge ${p.stock <= 5 ? 'badge--error' : 'badge--success'}`}>{p.stock}</span></td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/admin/products/${p._id}/edit`} className="btn btn--outline btn--sm">Edit</Link>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p._id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProductsPage;
