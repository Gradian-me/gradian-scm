import { VendorDetailPage } from '@/domains/vendor/components/VendorDetailPage';

interface VendorDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VendorDetailPageRoute({ params }: VendorDetailPageProps) {
  const { id } = await params;
  return <VendorDetailPage vendorId={id} />;
}
