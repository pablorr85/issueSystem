/**
 * Extracts zone or location strings from dynamic issue extra_data objects.
 */
export const getZoneValue = (extraData?: Record<string, unknown>): string => {
  if (!extraData) return '';
  const zoneKey = Object.keys(extraData).find(
    (k) => k.toLowerCase().includes('zona') || k.toLowerCase().includes('location') || k.toLowerCase().includes('zone')
  );
  if (zoneKey) {
    return String(extraData[zoneKey]);
  }
  const firstKey = Object.keys(extraData)[0];
  return firstKey ? `${firstKey}: ${extraData[firstKey]}` : '';
};
