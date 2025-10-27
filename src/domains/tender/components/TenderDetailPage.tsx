'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../../../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  Trophy,
  FileText,
  Edit,
  Trash2,
  Play,
  Square,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTender } from '../hooks/useTender';
import { Tender } from '../types';
import { TENDER_STATUS } from '../../../shared/constants';
import { motion } from 'framer-motion';

interface TenderDetailPageProps {
  tenderId: string;
}

export function TenderDetailPage({ tenderId }: TenderDetailPageProps) {
  const router = useRouter();
  const { fetchTenderById, currentTender, updateTender, deleteTender, publishTender, closeTender, awardTender, isLoading: storeLoading, error: storeError } = useTender();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTender = async () => {
      try {
        setIsLoading(true);
        await fetchTenderById(tenderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tender');
      } finally {
        setIsLoading(false);
      }
    };

    if (tenderId) {
      fetchTender();
    }
  }, [tenderId, fetchTenderById]);

  const tender = currentTender;

  const getStatusColor = (status: string) => {
    switch (status) {
      case TENDER_STATUS.AWARDED: return 'success';
      case TENDER_STATUS.PUBLISHED: return 'info';
      case TENDER_STATUS.CLOSED: return 'warning';
      case TENDER_STATUS.CANCELLED: return 'destructive';
      case TENDER_STATUS.DRAFT: return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case TENDER_STATUS.AWARDED: return <Trophy className="h-4 w-4" />;
      case TENDER_STATUS.PUBLISHED: return <FileText className="h-4 w-4" />;
      case TENDER_STATUS.CLOSED: return <Clock className="h-4 w-4" />;
      case TENDER_STATUS.CANCELLED: return <AlertCircle className="h-4 w-4" />;
      case TENDER_STATUS.DRAFT: return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const handlePublish = async () => {
    if (tender && window.confirm(`Are you sure you want to publish "${tender.title}"?`)) {
      try {
        await publishTender(tender.id);
        // Refresh the tender data
        await fetchTenderById(tenderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to publish tender');
      }
    }
  };

  const handleClose = async () => {
    if (tender && window.confirm(`Are you sure you want to close "${tender.title}"?`)) {
      try {
        await closeTender(tender.id);
        // Refresh the tender data
        await fetchTenderById(tenderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to close tender');
      }
    }
  };

  const handleAward = async () => {
    const vendorId = prompt('Enter vendor ID to award this tender to:');
    if (vendorId && tender) {
      try {
        await awardTender(tender.id, vendorId);
        // Refresh the tender data
        await fetchTenderById(tenderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to award tender');
      }
    }
  };

  const handleDelete = async () => {
    if (tender && window.confirm(`Are you sure you want to delete "${tender.title}"?`)) {
      try {
        await deleteTender(tender.id);
        router.push('/tenders');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete tender');
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Tender Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !tender) {
    return (
      <MainLayout title="Tender Details">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error || 'Tender not found'}</p>
          <Button onClick={() => router.push('/tenders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenders
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Tender Details">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/tenders')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{tender.title}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={getStatusColor(tender.status)} className="flex items-center space-x-1">
                  {getStatusIcon(tender.status)}
                  <span>{tender.status}</span>
                </Badge>
                {tender.awardedTo && (
                  <Badge variant="warning" className="flex items-center space-x-1">
                    <Trophy className="h-3 w-3" />
                    <span>Winner: {tender.awardedTo}</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/tenders/${tender.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {tender.status === TENDER_STATUS.DRAFT && (
              <Button onClick={handlePublish}>
                <Play className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
            {tender.status === TENDER_STATUS.PUBLISHED && (
              <Button variant="outline" onClick={handleClose}>
                <Square className="h-4 w-4 mr-2" />
                Close
              </Button>
            )}
            {tender.status === TENDER_STATUS.CLOSED && !tender.awardedTo && (
              <Button onClick={handleAward}>
                <Trophy className="h-4 w-4 mr-2" />
                Award
              </Button>
            )}
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </motion.div>

        {/* Tender Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{tender.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tender.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{item.productName}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Quantity: {item.quantity} {item.unit}
                            </p>
                            {item.specifications && (
                              <p className="text-sm text-gray-500">
                                Specifications: {item.specifications}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${item.estimatedUnitPrice.toFixed(2)} per {item.unit}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: ${(item.estimatedUnitPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quotations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quotations</CardTitle>
                </CardHeader>
                <CardContent>
                  {tender.quotations && tender.quotations.length > 0 ? (
                    <div className="space-y-4">
                      {tender.quotations.map((quotation, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{quotation.vendor?.name || 'Unknown Vendor'}</h4>
                              <p className="text-sm text-gray-600">{quotation.vendor?.email || ''}</p>
                              <p className="text-sm text-gray-500">
                                Submitted: {formatDate(quotation.submittedAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${quotation.totalAmount.toFixed(2)}</p>
                              <Badge variant={quotation.status === 'accepted' ? 'success' : 'secondary'}>
                                {quotation.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No quotations received yet</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm">{tender.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estimated Value</label>
                    <p className="text-sm font-medium">
                      ${tender.estimatedValue.toLocaleString()} {tender.currency}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Published Date</label>
                    <p className="text-sm">
                      {tender.publishedDate ? formatDate(tender.publishedDate) : 'Not published'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Closing Date</label>
                    <p className="text-sm">{formatDate(tender.closingDate)}</p>
                  </div>
                  {tender.awardDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Award Date</label>
                      <p className="text-sm">{formatDate(tender.awardDate)}</p>
                    </div>
                  )}
                  {(tender as any).createdBy && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created By</label>
                      <p className="text-sm">{(tender as any).createdBy}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Price</span>
                      <span className="text-sm font-medium">{tender.evaluationCriteria.price}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Quality</span>
                      <span className="text-sm font-medium">{tender.evaluationCriteria.quality}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Delivery</span>
                      <span className="text-sm font-medium">{tender.evaluationCriteria.delivery}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Experience</span>
                      <span className="text-sm font-medium">{tender.evaluationCriteria.experience}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
