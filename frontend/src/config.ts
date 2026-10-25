// Reads directly from environment variables.
// In development: loaded from .env (e.g. http://localhost:8000)
// In production (Vercel): configured in project Environment Variables settings
export const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:8000';
