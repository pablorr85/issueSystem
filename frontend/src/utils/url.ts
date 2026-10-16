/**
 * Normalizes relative photo/image paths to full URLs using VITE_API_BASE_URL.
 */
export const getImageUrl = (url: string | null | undefined): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed === '/media/' ||
    trimmed === '/media' ||
    trimmed.endsWith('/media/') ||
    trimmed.endsWith('/media')
  ) {
    return '';
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const apiBase =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://127.0.0.1:8000';
  const origin = apiBase.replace(/\/api\/?$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${origin}${path}`;
};
