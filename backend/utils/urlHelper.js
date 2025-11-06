// utils/urlHelper.js
const getCleanFrontendUrl = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  return url.replace(/\/$/, ''); // Remove trailing slash if present
};

module.exports = { getCleanFrontendUrl };
