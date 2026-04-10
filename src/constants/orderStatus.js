export const ORDER_STATUS = {
  // Standard Order Lifecycle
  PLACED:    'PLACED',    // Initial status for COD
  ACCEPTED:  'ACCEPTED',  // Admin accepted
  REJECTED:  'REJECTED',  // Admin rejected
  PREPARING: 'PREPARING', // In kitchen
  READY:     'READY',     // Ready for pickup/dispatch
  ASSIGNED:  'ASSIGNED',  // Rider assigned
  DELIVERED: 'DELIVERED', // Order completed

  // System/Exception Statuses
  CANCELLED:        'CANCELLED',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  PAYMENT_FAILED:   'PAYMENT_FAILED'
};
