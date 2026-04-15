const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

const CATEGORIES = {
  MEN: 'men',
  WOMEN: 'women',
  ACCESSORIES: 'accessories',
};

const DISCOUNT_TYPES = {
  PERCENT: 'percent',
  FLAT: 'flat',
};

module.exports = {
  ORDER_STATUS,
  ROLES,
  CATEGORIES,
  DISCOUNT_TYPES,
};
