import { useEffect, useState } from 'react';

/**
 * Custom hook to handle hydration mismatches in Next.js
 * Returns true when the component has mounted on the client side
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
