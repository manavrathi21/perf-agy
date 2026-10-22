// VITE_API_BASE_URL stays the local-dev override (points the dev server at a whole different API host). In
// prod, the API lives under the same deploy-gateway path prefix as the app itself (BASE_URL, see main.jsx).
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/v1`,
  appName: 'Performance Agent',
};
