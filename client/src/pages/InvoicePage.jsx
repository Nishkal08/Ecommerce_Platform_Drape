import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';
import { formatDateTime } from '../utils/formatDate';

const InvoicePage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Invoice...</div>;
  }

  if (!order) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Order not found.</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', fontFamily: 'var(--font-sans)', color: '#1a1a1a' }}>
      {/* Non-printable action bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <button onClick={() => window.close()} className="btn btn--outline">Close</button>
        <button onClick={handlePrint} className="btn btn--primary">Print / Download PDF</button>
      </div>

      {/* Printable Invoice Area */}
      <div style={{ border: '1px solid #eee', padding: '40px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1a1a1a', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', letterSpacing: '0.1em', fontStyle: 'italic', margin: 0 }}>DRAPE</h1>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>Official Invoice / Receipt</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px' }}>INVOICE #{order._id.slice(-8).toUpperCase()}</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Date: {formatDateTime(order.createdAt)}</p>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: order.status === 'pending' || order.status === 'cancelled' ? 'red' : 'green' }}>
              Status: {order.status.toUpperCase()}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>Billed To:</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#444' }}>
              <div>{order.user?.name}</div>
              <div>{order.user?.email}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>Shipped To:</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#444' }}>
              <div>{order.shippingAddress?.name}</div>
              <div>{order.shippingAddress?.line1}</div>
              <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</div>
              <div>Phone: {order.shippingAddress?.phone}</div>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '13px', textTransform: 'uppercase' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '13px', textTransform: 'uppercase' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '13px', textTransform: 'uppercase' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px 0', fontSize: '14px' }}>
                  {item.name} {item.size ? `(${item.size})` : ''}
                </td>
                <td style={{ padding: '16px 0', fontSize: '14px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '16px 0', fontSize: '14px', textAlign: 'right' }}>{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: 'green' }}>
                <span>Discount:</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '16px', fontWeight: 'bold', borderTop: '2px solid #1a1a1a', marginTop: '8px' }}>
              <span>Total Paid:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '64px', textAlign: 'center', fontSize: '12px', color: '#999', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <p style={{ margin: '0 0 4px' }}>This is a computer generated invoice and does not require a physical signature.</p>
          <p style={{ margin: 0 }}>DRAPE Fashion | support@drapefashion.com</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { margin: 10mm; }
        }
      `}} />
    </div>
  );
};

export default InvoicePage;
