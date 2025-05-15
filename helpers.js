// helpers.js
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const isArray = (value) => {
  return Array.isArray(value);
};

export const eq = (a, b) => {
  return a === b;
};

export default {
  formatDate,
  isArray,
  eq
};