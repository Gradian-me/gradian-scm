'use client';

import { DynamicList } from '../../../gradian-ui';
import { vendorFormSchema } from '../schemas/vendor-form.schema';
import { Vendor } from '../types';

interface VendorListProps {
  vendors: Vendor[];
  isLoading: boolean;
  onSearch: (search: string) => void;
  onFilter: (filters: any) => void;
  onView: (vendor: Vendor) => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
  searchTerm: string;
  filterStatus: string;
}

export function VendorList({
  vendors,
  isLoading,
  onSearch,
  onFilter,
  onView,
  onEdit,
  onDelete,
  searchTerm,
  filterStatus,
}: VendorListProps) {
  // Get metadata from schema
  const cardMetadata = vendorFormSchema.cardMetadata;
  const listMetadata = (vendorFormSchema as any).listMetadata;

  if (!cardMetadata || !listMetadata) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Schema metadata not found</p>
      </div>
    );
  }

  return (
    <DynamicList
      data={vendors}
      cardMetadata={cardMetadata as any}
      listMetadata={listMetadata as any}
      formSchema={vendorFormSchema}
      isLoading={isLoading}
      onItemClick={onView}
      onItemHover={(isHovering, item) => {
        // Handle hover if needed
      }}
    />
  );
}
