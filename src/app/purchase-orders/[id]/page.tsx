import { PurchaseOrderDetailPage } from '@/domains/purchase-order/components/PurchaseOrderDetailPage';

interface PurchaseOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PurchaseOrderDetailPageRoute({ params }: PurchaseOrderDetailPageProps) {
  const { id } = await params;
  return <PurchaseOrderDetailPage purchaseOrderId={id} />;
}
