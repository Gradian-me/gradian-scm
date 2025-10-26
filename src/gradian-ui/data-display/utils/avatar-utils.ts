/**
 * Get initials from a name string
 */
export const getInitials = (name: string): string => {
  return (name || 'A').split(' ').map(n => n[0]).join('').toUpperCase();
};

