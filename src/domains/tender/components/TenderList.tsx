'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  Trophy,
  Eye,
  FileText,
  TrendingUp,
  X,
  Edit,
  Trash2,
  Play,
  Square
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tender } from '../types';
import { TENDER_STATUS } from '../../../shared/constants';

interface TenderListProps {
  tenders: Tender[];
  isLoading: boolean;
  onSearch: (search: string) => void;
  onFilter: (filters: any) => void;
  onView: (tender: Tender) => void;
  onEdit: (tender: Tender) => void;
  onDelete: (tender: Tender) => void;
  onPublish: (tender: Tender) => void;
  onClose: (tender: Tender) => void;
  onAward: (tender: Tender) => void;
  searchTerm: string;
  filterStatus: string;
  filterCategory: string;
}

export function TenderList({
  tenders,
  isLoading,
  onSearch,
  onFilter,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onClose,
  onAward,
  searchTerm,
  filterStatus,
  filterCategory,
}: TenderListProps) {
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
      case TENDER_STATUS.CANCELLED: return <X className="h-4 w-4" />;
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

  const getTimeRemaining = (closingDate: Date) => {
    const now = new Date();
    const closing = new Date(closingDate);
    const diffTime = closing.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Closes today';
    if (diffDays === 1) return 'Closes tomorrow';
    return `Closes in ${diffDays} days`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">2 closing soon</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$39,650</div>
              <p className="text-xs text-muted-foreground">Estimated value</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quotations Received</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">0 pending review</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2 days</div>
              <p className="text-xs text-muted-foreground">Faster than target</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tenders..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => onFilter({ status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value={TENDER_STATUS.DRAFT}>Draft</option>
            <option value={TENDER_STATUS.PUBLISHED}>Published</option>
            <option value={TENDER_STATUS.CLOSED}>Closed</option>
            <option value={TENDER_STATUS.AWARDED}>Awarded</option>
            <option value={TENDER_STATUS.CANCELLED}>Cancelled</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => onFilter({ category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="HPLC Columns">HPLC Columns</option>
            <option value="Merck Products">Merck Products</option>
            <option value="Laboratory Equipment">Laboratory Equipment</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </motion.div>

      {/* Tenders List */}
      <div className="space-y-4">
        {tenders?.map((tender, index) => (
          <motion.div
            key={tender.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{tender.title}</h3>
                      {tender.awardedTo && (
                        <Badge variant="warning" className="flex items-center space-x-1">
                          <Trophy className="h-3 w-3" />
                          <span>Winner: {tender.awardedTo}</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{tender.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <Badge variant="secondary" className="ml-2">
                          {tender.category}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <span className="ml-2 font-medium">
                          ${tender.estimatedValue.toLocaleString()} {tender.currency}
                        </span>
                        {tender.awardedTo && (
                          <div className="text-green-600 text-xs">
                            Won: ${(tender.estimatedValue * 0.95).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Timeline:</span>
                        <div className="ml-2">
                          <div className="text-xs">Published: {formatDate(tender.publishedDate || tender.createdAt)}</div>
                          <div className="text-xs">Closes: {formatDate(tender.closingDate)}</div>
                          {tender.awardDate && (
                            <div className="text-xs text-green-600">Awarded: {formatDate(tender.awardDate)}</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Quotations:</span>
                        <div className="ml-2">
                          <div className="text-xs">2/2</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                          </div>
                          <div className="text-xs text-gray-500">0 submitted</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <Badge variant={getStatusColor(tender.status)} className="flex items-center space-x-1">
                      {getStatusIcon(tender.status)}
                      <span>{tender.status}</span>
                    </Badge>
                    {tender.awardedTo && (
                      <Badge variant="warning" className="flex items-center space-x-1">
                        <Trophy className="h-3 w-3" />
                        <span>{tender.awardedTo}</span>
                      </Badge>
                    )}
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" onClick={() => onView(tender)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEdit(tender)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onDelete(tender)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {tender.status === TENDER_STATUS.DRAFT && (
                        <Button variant="outline" size="sm" onClick={() => onPublish(tender)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {tender.status === TENDER_STATUS.PUBLISHED && (
                        <Button variant="outline" size="sm" onClick={() => onClose(tender)}>
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {tenders?.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenders found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first tender.'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}
