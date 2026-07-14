import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { HiX, HiOutlineTrash, HiOutlineShoppingBag, HiArrowRight } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';

const CartDrawer = () => {
  const {
    cart,
    loading,
    cartTotal,
    cartCount,
    isCartOpen,
    setCartOpen,
    updateItem,
    removeItemWithUndo,
    updatingItemId
  } = useCart();
  
  const navigate = useNavigate();

  // Handle body scroll lock when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const handleViewCartClick = () => {
    setCartOpen(false);
    navigate('/cart');
  };

  return createPortal(
    <>
      {/* Translucent Backdrop Blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 transition-opacity duration-300"
        onClick={() => setCartOpen(false)}
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-[#FAF9F6] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-base font-bold tracking-wider uppercase text-charcoal">Shopping Bag</span>
            <span className="font-sans text-xs bg-black/5 px-2.5 py-0.5 rounded-full font-medium text-black/60">
              {cartCount}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="text-black/40 hover:text-black transition-colors p-1 bg-transparent border-none cursor-pointer"
            aria-label="Close cart drawer"
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4 text-black/40">
                <HiOutlineShoppingBag size={28} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-charcoal mb-1">Your bag is empty</h3>
              <p className="text-xs text-black/40 max-w-[240px] mb-6">
                Add premium wardrobe essentials to get started.
              </p>
              <button
                onClick={() => {
                  setCartOpen(false);
                  navigate('/products');
                }}
                className="btn btn--primary btn--sm font-sans tracking-widest text-[11px] uppercase"
              >
                Discover Collection
              </button>
            </div>
          ) : (
            cart.items.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 p-4 bg-white border border-black/5 rounded-lg shadow-sm relative overflow-hidden"
              >
                {/* Local Item Spinner */}
                {updatingItemId === item._id && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <div className="spinner-small w-5 h-5 border-2 border-black/10 border-t-black/70 rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Product Thumbnail */}
                <Link
                  to={`/products/${item.product?.slug}`}
                  onClick={() => setCartOpen(false)}
                  className="w-16 h-20 bg-black/[0.02] rounded-md overflow-hidden flex-shrink-0 border border-black/5"
                >
                  <img
                    src={item.product?.images?.[0]?.url}
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <Link
                      to={`/products/${item.product?.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="block font-sans text-xs font-bold text-charcoal tracking-wide hover:underline truncate"
                    >
                      {item.product?.name}
                    </Link>
                    <div className="flex items-center gap-3 mt-1.5 font-sans text-[11px] text-black/40 uppercase tracking-wider">
                      <span>Size: {item.size || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Delete */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-black/10 rounded-md bg-[#FAF9F6] h-7 text-xs overflow-hidden">
                      <button
                        onClick={() => item.quantity > 1 && updateItem(item._id, item.quantity - 1)}
                        className="px-2.5 h-full hover:bg-black/5 transition-colors font-medium border-none bg-transparent cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="px-2 font-medium min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item._id, item.quantity + 1)}
                        className="px-2.5 h-full hover:bg-black/5 transition-colors font-medium border-none bg-transparent cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItemWithUndo(item._id)}
                      className="text-black/30 hover:text-red-500 transition-colors p-1.5 bg-transparent border-none cursor-pointer"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="font-sans text-[13px] font-semibold text-charcoal py-0.5 self-start">
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Area */}
        {cart.items.length > 0 && (
          <div className="border-t border-black/5 bg-white p-6 space-y-4 shadow-[0_-8px_30px_rgba(0,0,0,0.03)]">
            {/* Free Shipping Alert */}
            <div className="flex items-center gap-2 bg-[#F7F6F3] px-3.5 py-2.5 rounded-md text-[11.5px] font-sans font-medium text-black/60">
              <span className="text-xs">🚚</span>
              <span>Your order qualifies for **FREE SHIPPING**</span>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between font-sans text-xs uppercase tracking-wider font-semibold text-black/50">
              <span>Estimated Subtotal</span>
              <span className="text-[15px] font-bold text-charcoal font-sans normal-case tracking-normal">
                {formatPrice(cartTotal)}
              </span>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleViewCartClick}
                className="btn btn--outline btn--md py-3 text-[11px] font-sans font-bold uppercase tracking-wider"
              >
                View Bag
              </button>
              <button
                onClick={handleCheckoutClick}
                className="btn btn--primary btn--md py-3 text-[11px] font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                Checkout <HiArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
};

export default CartDrawer;
