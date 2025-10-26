// Header Brand Component

import React from 'react';
import Link from 'next/link';
import { HeaderBrandProps } from '../types';
import { cn } from '../../../shared/utils';

export const HeaderBrand: React.FC<HeaderBrandProps> = ({
  logo,
  title,
  href = '/',
  className,
  ...props
}) => {
  const brandClasses = cn(
    'flex items-center space-x-3',
    className
  );

  const logoClasses = cn(
    'h-8 w-auto',
    title && 'h-6'
  );

  const titleClasses = cn(
    'text-xl font-semibold text-gray-900',
    logo && 'text-lg'
  );

  return (
    <Link href={href} className={brandClasses} {...props}>
      {logo && (
        <img
          src={logo.src}
          alt={logo.alt}
          className={logoClasses}
        />
      )}
      {title && (
        <span className={titleClasses}>
          {title}
        </span>
      )}
    </Link>
  );
};

HeaderBrand.displayName = 'HeaderBrand';
