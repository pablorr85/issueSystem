/**
 * Applies the tenant primary theme color dynamically to document root CSS variables.
 * Converts HEX color strings to HSL and sets --primary-hue, --primary, and --primary-hover.
 */
export const applyTenantTheme = (primaryColorHex?: string): void => {
  if (primaryColorHex) {
    const hex = primaryColorHex.trim();
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16) / 255;
      const g = parseInt(result[2], 16) / 255;
      const b = parseInt(result[3], 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      let l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      h = Math.round(h * 360);
      s = Math.round(s * 100);
      l = Math.round(l * 100);

      document.documentElement.style.setProperty('--primary-hue', `${h}`);
      document.documentElement.style.setProperty('--primary', `hsl(${h}, ${s}%, ${l}%)`);
      document.documentElement.style.setProperty('--primary-hover', `hsl(${h}, ${s}%, ${l - 10}%)`);
      return;
    }
  }

  // Default fallback theme (Indigo / Violet)
  document.documentElement.style.setProperty('--primary-hue', '260');
  document.documentElement.style.setProperty('--primary', 'hsl(260, 85%, 60%)');
  document.documentElement.style.setProperty('--primary-hover', 'hsl(260, 85%, 50%)');
};
