'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '../../../components/layout/main-layout';
import { Modal } from '../../../gradian-ui/data-display';
import { TenderForm } from './TenderForm';
import { TenderList } from './TenderList';
import { useTender } from '../hooks/useTender';
import { Tender } from '../types';
import { Plus } from 'lucide-react';

export function TenderPage() {
  const {
    tenders,
    currentTender,
    isLoading,
    error,
    fetchTenders,
    fetchTenderById,
    createTender,
    deleteTender,
    publishTender,
    closeTender,
    awardTender,
    setFilters,
    clearError,
  } = useTender();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setFilters({ search, page: 1 });
    fetchTenders({ search, page: 1 });
  };

  const handleFilter = (filters: any) => {
    const newStatus = filters.status || 'all';
    const newCategory = filters.category || 'all';
    
    setFilterStatus(newStatus);
    setFilterCategory(newCategory);
    
    setFilters({ 
      status: newStatus === 'all' ? undefined : newStatus,
      category: newCategory === 'all' ? undefined : newCategory,
      page: 1 
    });
    
    fetchTenders({ 
      status: newStatus === 'all' ? undefined : newStatus,
      category: newCategory === 'all' ? undefined : newCategory,
      page: 1 
    });
  };

  const handleCreateTender = async (data: any) => {
    setIsCreating(true);
    try {
      const result = await createTender(data);
      if (result.success) {
        setIsCreateModalOpen(false);
        // Refresh the list
        fetchTenders();
      } else {
        console.error('Failed to create tender:', result.error);
      }
    } catch (error) {
      console.error('Error creating tender:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewTender = (tender: Tender) => {
    window.location.href = `/tenders/${tender.id}`;
  };

  const handleEditTender = async (tender: Tender) => {
    try {
      // Fetch the latest data from API
      await fetchTenderById(tender.id);
      // Navigate to detail page which will use the fresh currentTender data
      window.location.href = `/tenders/${tender.id}`;
    } catch (error) {
      console.error('Failed to fetch tender data:', error);
    }
  };

  const handleDeleteTender = async (tender: Tender) => {
    if (window.confirm(`Are you sure you want to delete "${tender.title}"?`)) {
      try {
        const result = await deleteTender(tender.id);
        if (result.success) {
          // Refresh the list
          fetchTenders();
        } else {
          console.error('Failed to delete tender:', result.error);
        }
      } catch (error) {
        console.error('Error deleting tender:', error);
      }
    }
  };

  const handlePublishTender = async (tender: Tender) => {
    if (window.confirm(`Are you sure you want to publish "${tender.title}"?`)) {
      try {
        const result = await publishTender(tender.id);
        if (result.success) {
          // Refresh the list
          fetchTenders();
        } else {
          console.error('Failed to publish tender:', result.error);
        }
      } catch (error) {
        console.error('Error publishing tender:', error);
      }
    }
  };

  const handleCloseTender = async (tender: Tender) => {
    if (window.confirm(`Are you sure you want to close "${tender.title}"?`)) {
      try {
        const result = await closeTender(tender.id);
        if (result.success) {
          // Refresh the list
          fetchTenders();
        } else {
          console.error('Failed to close tender:', result.error);
        }
      } catch (error) {
        console.error('Error closing tender:', error);
      }
    }
  };

  const handleAwardTender = async (tender: Tender) => {
    const vendorId = prompt('Enter vendor ID to award this tender to:');
    if (vendorId) {
      try {
        const result = await awardTender(tender.id, vendorId);
        if (result.success) {
          // Refresh the list
          fetchTenders();
        } else {
          console.error('Failed to award tender:', result.error);
        }
      } catch (error) {
        console.error('Error awarding tender:', error);
      }
    }
  };

  const handleCreateButtonClick = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <MainLayout 
        title="Tender Management" 
        showCreateButton 
        createButtonText="Create Tender"
        onCreateClick={handleCreateButtonClick}
      >
        <TenderList
          tenders={tenders || []}
          isLoading={isLoading}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onView={handleViewTender}
          onEdit={handleEditTender}
          onDelete={handleDeleteTender}
          onPublish={handlePublishTender}
          onClose={handleCloseTender}
          onAward={handleAwardTender}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          filterCategory={filterCategory}
        />
      </MainLayout>

      {/* Create Tender Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Tender"
        size="xl"
      >
        <TenderForm
          onSubmit={handleCreateTender}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>
    </>
  );
}
