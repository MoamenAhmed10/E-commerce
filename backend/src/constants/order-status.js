/**
 * Order status constants following the business flow:
 * Pending → Preparing → Ready → Shipped → Received → Refused
 */

const ORDER_STATUS = {
  PENDING: "pending",
  PREPARING: "preparing",
  READY: "ready",
  SHIPPED: "shipped",
  RECEIVED: "received",
  REFUSED: "refused",
  CANCELLED: "cancelled",
};

const ORDER_STATUS_FLOW = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [
    ORDER_STATUS.RECEIVED,
    ORDER_STATUS.REFUSED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.RECEIVED]: [],
  [ORDER_STATUS.REFUSED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.PREPARING]: "Preparing",
  [ORDER_STATUS.READY]: "Ready for Shipping",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.RECEIVED]: "Received",
  [ORDER_STATUS.REFUSED]: "Refused",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

/**
 * Check if a status transition is valid
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - New order status
 * @returns {boolean} - Whether the transition is valid
 */
const isValidStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = ORDER_STATUS_FLOW[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

/**
 * Get allowed next statuses for a given status
 * @param {string} currentStatus - Current order status
 * @returns {string[]} - Array of allowed next statuses
 */
const getAllowedNextStatuses = (currentStatus) => {
  return ORDER_STATUS_FLOW[currentStatus] || [];
};

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  isValidStatusTransition,
  canTransition: isValidStatusTransition, // Alias for backward compatibility
  getAllowedNextStatuses,
};
