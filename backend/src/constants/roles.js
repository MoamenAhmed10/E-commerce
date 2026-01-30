/**
 * User roles constants
 */

const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

const ROLE_LABELS = {
  [ROLES.USER]: "User",
  [ROLES.ADMIN]: "Administrator",
};

/**
 * Check if a role is admin
 * @param {string} role - User role
 * @returns {boolean} - Whether the role is admin
 */
const isAdmin = (role) => role === ROLES.ADMIN;

/**
 * Check if a role is valid
 * @param {string} role - Role to check
 * @returns {boolean} - Whether the role is valid
 */
const isValidRole = (role) => Object.values(ROLES).includes(role);

module.exports = {
  ROLES,
  ROLE_LABELS,
  isAdmin,
  isValidRole,
};
