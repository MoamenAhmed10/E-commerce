/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Check if a date is within days from now
 */
const isWithinDays = (date, days) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = now - targetDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= days;
};

module.exports = {
  generateOrderNumber,
  isWithinDays,
};
