'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/gradian-ui/form-builder/form-elements';
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useCompanyStore } from '@/stores/company.store';
import { useCompanies } from '@/gradian-ui/shared/hooks/use-companies';

interface Company {
  id: string | number;
  name: string;
  logo?: string;
  [key: string]: any;
}

interface CompanySelectorProps {
  onCompanyChange?: (company: string) => void;
  onCompanyChangeFull?: (company: Company) => void;
  variant?: 'light' | 'dark';
  fullWidth?: boolean;
  showLogo?: 'none' | 'sidebar-avatar' | 'full';
}

export function CompanySelector({
  onCompanyChange,
  onCompanyChangeFull,
  variant = 'light',
  fullWidth = false,
  showLogo = 'full',
}: CompanySelectorProps) {
  const { selectedCompany, setSelectedCompany } = useCompanyStore();
  const { companies, isLoading: loading } = useCompanies();
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const onCompanyChangeFullRef = useRef(onCompanyChangeFull);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const isDarkVariant = variant === 'dark';
  
  // Keep ref in sync with callback
  useEffect(() => {
    onCompanyChangeFullRef.current = onCompanyChangeFull;
  }, [onCompanyChangeFull]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Set default company when companies are loaded
  useEffect(() => {
    if (isMounted && companies.length > 0) {
      // Set "All Companies" as default if nothing is in store
      if (!selectedCompany) {
        const allCompaniesOption = companies.find(c => c.id === -1);
        if (allCompaniesOption) {
          setSelectedCompany(allCompaniesOption);
          // Set cookie for default
          if (typeof document !== 'undefined') {
            document.cookie = `selectedCompanyId=; path=/; max-age=0`; // Clear for "All Companies"
          }
        }
      } else {
        // Sync cookie with store
        if (typeof document !== 'undefined') {
          const companyId = selectedCompany.id !== -1 ? String(selectedCompany.id) : '';
          document.cookie = `selectedCompanyId=${companyId}; path=/; max-age=${60 * 60 * 24 * 365}`;
        }
      }
    }
  }, [isMounted, companies, selectedCompany, setSelectedCompany]);

  
  const handleCompanySelect = (company: Company) => {
    console.log('Company selected:', company);
    setSelectedCompany(company);
    // Set cookie for server-side access
    if (typeof document !== 'undefined') {
      const companyId = company.id !== -1 ? String(company.id) : '';
      document.cookie = `selectedCompanyId=${companyId}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
    }
    if (onCompanyChange) {
      onCompanyChange(company.name);
    }
    if (onCompanyChangeFull) {
      onCompanyChangeFull(company);
    }
  };

  const companyInitials = selectedCompany
    ? selectedCompany.name
        .split(' ')
        .map((word: string) => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'CO';

  const triggerHeightClasses = "h-10";
  const triggerBaseClasses = cn(
    "flex items-center space-x-2 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 focus:ring-0",
    triggerHeightClasses,
    isDarkVariant
      ? "border border-gray-700 bg-gray-900 text-gray-100 hover:bg-gray-800"
      : "border border-gray-200 text-gray-700 hover:bg-gray-50",
    fullWidth ? "w-full justify-between" : ""
  );
  const avatarBorderClass = isDarkVariant ? "border-gray-700" : "border-gray-100";
  const chevronColorClass = isDarkVariant ? "text-gray-300" : "text-gray-500";
  const menuContentClasses = cn(
    "z-50 overflow-hidden rounded-xl border p-1 shadow-lg",
    fullWidth ? "w-full" : "min-w-44",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    isDarkVariant
      ? "bg-gray-900 border-gray-700 text-gray-100"
      : "bg-white border-gray-200 text-gray-900"
  );
  const labelClasses = cn(
    "px-2 py-1.5 text-sm font-semibold",
    isDarkVariant ? "text-gray-100" : "text-gray-900"
  );
  const separatorClasses = cn(
    "-mx-1 my-1 h-px",
    isDarkVariant ? "bg-gray-700" : "bg-gray-200"
  );
  const menuItemBaseClasses = "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors";

  if (!isMounted || loading) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={triggerBaseClasses}
        aria-label="Select company"
        disabled
      >
        <Avatar 
          fallback={companyInitials}
          size="sm"
          variant="primary"
          className={cn("border", avatarBorderClass)}
        />
        <span
          className={cn(
            "text-sm font-medium",
            isDarkVariant ? "text-gray-300" : "text-gray-700",
            fullWidth ? "flex-1 text-left truncate" : ""
          )}
        >
          {selectedCompany?.name || 'Loading...'}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            chevronColorClass,
            isMenuOpen && "rotate-180"
          )}
        />
      </Button>
    );
  }

  if (companies.length === 0) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={triggerBaseClasses}
        aria-label="Select company"
        disabled
      >
        <Avatar 
          fallback="CO"
          size="sm"
          variant="primary"
          className={cn("border", avatarBorderClass)}
        />
        <span
          className={cn(
            "text-sm font-medium",
            isDarkVariant ? "text-gray-300" : "text-gray-700",
            fullWidth ? "flex-1 text-left truncate" : ""
          )}
        >
          No companies
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            chevronColorClass,
            isMenuOpen && "rotate-180"
          )}
        />
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", fullWidth && "w-full")}>
      {selectedCompany?.logo && showLogo === 'full' && (
        <div className="relative h-10 w-30 overflow-hidden bg-white">
          <Image 
            src={selectedCompany.logo} 
            alt={selectedCompany.name}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}
      <DropdownMenuPrimitive.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuPrimitive.Trigger asChild className={fullWidth ? "w-full" : "min-w-44"}>
            <Button 
              variant="outline" 
              size="sm" 
              className={triggerBaseClasses}
              aria-label="Select company"
              ref={triggerRef}
            >
            <Avatar 
              fallback={companyInitials}
              size={showLogo === 'sidebar-avatar' ? 'xs' : 'sm'}
              variant="primary"
              className={cn(
                "border",
                avatarBorderClass,
                showLogo === 'sidebar-avatar' ? "h-8 w-8" : ""
              )}
              src={showLogo === 'sidebar-avatar' ? selectedCompany?.logo : undefined}
            />
            <span
              className={cn(
                "text-sm font-medium line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis text-start",
                isDarkVariant ? "text-gray-200" : "text-gray-700",
                fullWidth ? "flex-1" : ""
              )}
            >
              {selectedCompany?.name || 'Select company'}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                chevronColorClass,
                isMenuOpen && "rotate-180"
              )}
            />
          </Button>
        </DropdownMenuPrimitive.Trigger>
      
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={menuContentClasses}
          align="start"
          sideOffset={4}
          style={{
            minWidth: triggerRef.current?.offsetWidth || undefined,
            width: triggerRef.current?.offsetWidth || undefined
          }}
        >
          <DropdownMenuPrimitive.Label className={labelClasses}>
            Companies
          </DropdownMenuPrimitive.Label>
          
          <DropdownMenuPrimitive.Separator className={separatorClasses} />
          
          {companies.map((company) => (
            <DropdownMenuPrimitive.Item
              key={company.id}
              className={cn(
                menuItemBaseClasses,
                isDarkVariant
                  ? "hover:bg-violet-500/10 focus:bg-violet-500/10 text-gray-200"
                  : "hover:bg-violet-50 focus:bg-violet-50 text-gray-800",
                selectedCompany?.id === company.id &&
                  (isDarkVariant ? "bg-violet-500/15" : "bg-violet-50")
              )}
              onSelect={() => handleCompanySelect(company)}
            >
              {company.name}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
    </div>
  );
}
