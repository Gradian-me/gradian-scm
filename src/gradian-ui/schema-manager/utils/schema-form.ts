export const generateSchemaId = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const generatePluralName = (singular: string) => {
  const trimmed = singular.trim();
  if (!trimmed) return '';

  if (/[^aeiou]y$/i.test(trimmed)) {
    return `${trimmed.slice(0, -1)}ies`;
  }

  if (/(s|x|z|ch|sh)$/i.test(trimmed)) {
    return `${trimmed}es`;
  }

  return `${trimmed}s`;
};
