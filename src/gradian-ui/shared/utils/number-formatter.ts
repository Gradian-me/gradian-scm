/**
 * Formats a number with thousand separators
 * @param value The number to format
 * @returns The formatted number as a string
 */
export const formatNumber = (value: number | string): string => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat().format(value);
  }
  
  // Try to parse the string as a number
  const num = parseFloat(value);
  if (!isNaN(num)) {
    return new Intl.NumberFormat().format(num);
  }
  
  // Return the original value if it's not a number
  return value;
};

/**
 * Formats a currency value
 * @param value The value to format
 * @param currency The currency code (default: 'USD')
 * @returns The formatted currency as a string
 */
export const formatCurrency = (value: number | string, currency = 'USD'): string => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat(undefined, { 
      style: 'currency', 
      currency 
    }).format(value);
  }
  
  // Try to parse the string as a number
  const num = parseFloat(value);
  if (!isNaN(num)) {
    return new Intl.NumberFormat(undefined, { 
      style: 'currency', 
      currency 
    }).format(num);
  }
  
  // Return the original value if it's not a number
  return value;
};

/**
 * Formats a percentage value
 * @param value The value to format
 * @param decimals The number of decimal places (default: 0)
 * @returns The formatted percentage as a string
 */
export const formatPercentage = (value: number | string, decimals = 0): string => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat(undefined, { 
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  }
  
  // Try to parse the string as a number
  const num = parseFloat(value);
  if (!isNaN(num)) {
    return new Intl.NumberFormat(undefined, { 
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num / 100);
  }
  
  // Return the original value if it's not a number
  return value;
};
