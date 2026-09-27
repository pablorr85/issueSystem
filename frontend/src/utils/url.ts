/**
 * Normalizes relative photo/image paths to full URLs using VITE_API_BASE_URL.
 */
export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
  const origin = apiBase.replace(/\/api$/, '');
  return `${origin}${url}`;
};
