export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  CART: '/cart',
  LOGIN: '/login',
  REGISTER: '/register',
  ABOUT: '/about',
  CONTACT: '/contact',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  WISHLIST: '/wishlist',
  ACCOUNT: '/account',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ADD_PRODUCT: '/admin/products/new',
  ADMIN_EDIT_PRODUCT: '/admin/products/:id/edit',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_USERS: '/admin/users',
};

export const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export const CATEGORIES = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'accessories', label: 'Accessories' },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];
