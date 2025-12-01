/**
 * Utility to build routes with the base path
 * This is useful when you need to construct URLs manually (e.g., for links or redirects)
 * 
 * Note: For navigate() calls, you DON'T need this helper since BrowserRouter 
 * with basename already handles the base path automatically.
 */

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '/';

/**
 * Builds a route with the configured base path
 * @param {string} path - The route path (should start with /)
 * @returns {string} The complete path with base
 * 
 * @example
 * buildRoute('/admin/home') // Returns '/Club_Manager_frontend/admin/home' in production
 * buildRoute('/admin/home') // Returns '/admin/home' in development
 */
export const buildRoute = (path) => {
  // Remove trailing slash from base path if it exists
  const base = BASE_PATH.endsWith('/') && BASE_PATH !== '/' 
    ? BASE_PATH.slice(0, -1) 
    : BASE_PATH;

  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return base === '/' ? normalizedPath : `${base}${normalizedPath}`;
};

/**
 * Gets the base path
 * @returns {string} The configured base path
 */
export const getBasePath = () => BASE_PATH;
