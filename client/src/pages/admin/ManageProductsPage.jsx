import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/productService';
import { formatPrice } from '../../utils/formatPrice';
import { HiOutlineSearch, HiOutlineCollection } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ManageProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner spinner--center" />;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn btn--primary">+ Add Product</Link>
      </div>

      {/* Search Bar */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <HiOutlineSearch className="admin-search__icon" />
          <input
            className="admin-search__input"
            placeholder="Search products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty__icon"><HiOutlineCollection /></div>
          <div className="admin-empty__text">
            {search ? 'No products match your search' : 'No products found'}
          </div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img
                      src={p.images?.[0]?.url}
                      alt={p.name}
                      style={{ width: '44px', height: '56px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                  </td>
                  <td style={{ fontWeight: '500' }}>{p.name}</td>
                  <td><span className="badge badge--neutral">{p.category}</span></td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    <span className={`badge ${p.stock <= 5 ? 'badge--error' : 'badge--success'}`}>
                      {p.stock}
                    </span>
                  </td>
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
      )}
    </div>
  );
};

export default ManageProductsPage;
