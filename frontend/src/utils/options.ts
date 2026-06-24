import type { CustomFieldOption } from '../services/types';

export const normalizeOptions = (
  options: (string | CustomFieldOption)[] | undefined
): CustomFieldOption[] => {
  if (!options) return [];
  return options.map(opt => {
    const isObj = typeof opt === 'object' && opt !== null;
    return {
      value: isObj ? opt.value : opt,
      label: isObj ? opt.label : opt
    };
  });
};
