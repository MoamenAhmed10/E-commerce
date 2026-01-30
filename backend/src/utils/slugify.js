const slugifyLib = require("slugify");

/**
 * Create URL-friendly slug from text
 */
const createSlug = (text) => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

/**
 * Create unique slug by appending random string if needed
 */
const createUniqueSlug = (text, existingSlugs = []) => {
  let slug = createSlug(text);
  let counter = 1;
  let originalSlug = slug;

  while (existingSlugs.includes(slug)) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }

  return slug;
};

module.exports = {
  createSlug,
  createUniqueSlug,
  slugify: createSlug, // Alias for compatibility
};
