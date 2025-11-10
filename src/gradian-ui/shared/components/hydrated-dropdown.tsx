'use client';

import { ReactNode } from 'react';
import { useHydration } from '@/gradian-ui/shared/hooks/use-hydration';

interface HydratedDropdownProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that prevents hydration mismatches for Radix UI dropdowns
 * by only rendering the dropdown after hydration is complete
 */
export function HydratedDropdown({ children, fallback }: HydratedDropdownProps) {
  const isHydrated = useHydration();

  if (!isHydrated && fallback) {
    return <>{fallback}</>;
  }

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
