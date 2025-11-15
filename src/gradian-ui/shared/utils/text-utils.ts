/**
 * Normalize arbitrary text by trimming, removing diacritics, collapsing whitespace,
 * and optionally lowercasing.
 */
export const cleanText = (input: string | null | undefined, options?: { lowercase?: boolean }): string => {
  if (!input) return '';
  const normalized = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
  return options?.lowercase ? normalized.toLowerCase() : normalized;
};

const splitIntoWords = (input: string | null | undefined): string[] => {
  const cleaned = cleanText(input ?? '', { lowercase: true });
  if (!cleaned) return [];
  return cleaned
    .replace(/[^a-z0-9\s-]/gi, ' ')
    .split(/[\s_-]+/)
    .filter(Boolean);
};

export const toKebabCase = (input: string | null | undefined): string =>
  splitIntoWords(input).join('-');

export const toSnakeCase = (input: string | null | undefined): string =>
  splitIntoWords(input).join('_');

export const toCamelCase = (input: string | null | undefined): string => {
  const words = splitIntoWords(input);
  if (words.length === 0) return '';
  return words
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
};

export const toPascalCase = (input: string | null | undefined): string =>
  splitIntoWords(input)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

export const ensureKebabCase = (input: string | null | undefined, fallbackPrefix = 'section'): string => {
  const result = toKebabCase(input);
  if (result) {
    return result;
  }
  return `${fallbackPrefix}-${Date.now()}`;
};


