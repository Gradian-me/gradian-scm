/**
 * Get status color variant for badges
 */
export const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" | "gradient" | "success" | "warning" | "info" => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': return 'default';
    case 'PENDING': return 'secondary';
    case 'INACTIVE': return 'destructive';
    default: return 'outline';
  }
};

/**
 * Get status icon character
 */
export const getStatusIcon = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': return '✓';
    case 'PENDING': return '⏳';
    case 'INACTIVE': return '✗';
    default: return '?';
  }
};

