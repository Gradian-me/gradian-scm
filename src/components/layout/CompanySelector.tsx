'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/gradian-ui/form-builder/form-elements';
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

interface Company {
  id: string | number;
  name: string;
  logo?: string;
  [key: string]: any;
}

interface CompanySelectorProps {
  onCompanyChange?: (company: string) => void;
  onCompanyChangeFull?: (company: Company) => void;
}

export function CompanySelector({ onCompanyChange, onCompanyChangeFull }: CompanySelectorProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastNotifiedCompanyId = useRef<string | number | null>(null);
  const onCompanyChangeFullRef = useRef(onCompanyChangeFull);
  
  // Keep ref in sync with callback
  useEffect(() => {
    onCompanyChangeFullRef.current = onCompanyChangeFull;
  }, [onCompanyChangeFull]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch('/api/data/companies');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const result = await response.json();
        if (result.success && result.data) {
          // Add "All Companies" option at the beginning
          const allCompaniesOption: Company = {
            id: -1,
            name: 'All Companies'
          };
          const companiesWithAll = [allCompaniesOption, ...result.data];
          setCompanies(companiesWithAll);
          // Set "All Companies" as default
          if (!selectedCompany) {
            setSelectedCompany(allCompaniesOption);
          }
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (isMounted) {
      fetchCompanies();
    }
  }, [isMounted]);

  // Call callback when initial company is set or when company changes
  useEffect(() => {
    if (selectedCompany && !loading && selectedCompany.id !== lastNotifiedCompanyId.current) {
      if (onCompanyChangeFullRef.current) {
        onCompanyChangeFullRef.current(selectedCompany);
        lastNotifiedCompanyId.current = selectedCompany.id;
      }
    }
  }, [selectedCompany, loading]);
  
  const handleCompanySelect = (company: Company) => {
    console.log('Company selected:', company);
    setSelectedCompany(company);
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

  if (!isMounted || loading) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center space-x-2"
        aria-label="Select company"
        disabled
      >
        <Avatar 
          fallback={companyInitials}
          size="sm"
          variant="primary"
          className="border border-gray-100"
        />
        <span className="text-sm font-medium text-gray-700">
          {selectedCompany?.name || 'Loading...'}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  }

  if (companies.length === 0) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center space-x-2"
        aria-label="Select company"
        disabled
      >
        <Avatar 
          fallback="CO"
          size="sm"
          variant="primary"
          className="border border-gray-100"
        />
        <span className="text-sm font-medium text-gray-700">No companies</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {selectedCompany?.logo && (
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
      <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger asChild className="min-w-44">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-2"
              aria-label="Select company"
            >
            <Avatar 
              fallback={companyInitials}
              size="sm"
              variant="primary"
              className="border border-gray-100"
            />
            <span className="text-sm font-medium text-gray-700 line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis text-start">
              {selectedCompany?.name || 'Select company'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuPrimitive.Trigger>
      
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={cn(
            "z-50 min-w-44 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 text-gray-900 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuPrimitive.Label className="px-2 py-1.5 text-sm font-semibold text-gray-900">
            Companies
          </DropdownMenuPrimitive.Label>
          
          <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-gray-200" />
          
          {companies.map((company) => (
            <DropdownMenuPrimitive.Item
              key={company.id}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none",
                "hover:bg-violet-50 focus:bg-violet-50",
                selectedCompany?.id === company.id && "bg-violet-50"
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
