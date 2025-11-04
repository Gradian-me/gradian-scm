'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ERPIntegration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  recordsSynced: number;
  errors: number;
  description: string;
}

export default function ERPPage() {
  const [integrations, setIntegrations] = useState<ERPIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        // Mock data for now
        const mockIntegrations: ERPIntegration[] = [
          {
            id: '1',
            name: 'RAHKARAN ERP',
            status: 'syncing',
            lastSync: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
            recordsSynced: 1247,
            errors: 0,
            description: 'Main ERP system for financial and inventory management',
          },
          {
            id: '2',
            name: 'SharePoint',
            status: 'connected',
            lastSync: new Date('2024-01-23T09:15:00'),
            recordsSynced: 892,
            errors: 2,
            description: 'Cloud-based ERP for procurement and vendor management',
          },
          {
            id: '3',
            name: 'Microsoft Teams',
            status: 'connected',
            lastSync: new Date('2024-01-23T08:45:00'),
            recordsSynced: 156,
            errors: 0,
            description: 'Customer relationship and sales management system',
          }
        ];
        
        setIntegrations(mockIntegrations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching integrations:', error);
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'destructive';
      case 'error': return 'destructive';
      case 'syncing': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    // Simulate sync process
    setTimeout(() => {
      setSyncing(null);
      // Update integration status
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'connected', lastSync: new Date() }
          : integration
      ));
    }, 3000);
  };

  if (loading) {
    return (
      <MainLayout title="ERP Integration">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="ERP Integration">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ERP Integration</h2>
            <p className="text-gray-600">Manage connections to external ERP systems</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Database className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </motion.div>

        {/* Integration Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-500">
                      {integrations.filter(i => i.status === 'connected').length}
                    </div>
                    <div className="text-sm text-gray-600">Connected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold text-red-500">
                      {integrations.filter(i => i.status === 'error').length}
                    </div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-blue-500">
                      {integrations.reduce((sum, i) => sum + i.recordsSynced, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Records Synced</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {integrations.filter(i => i.status === 'syncing').length}
                    </div>
                    <div className="text-sm text-gray-600">Syncing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Integration List */}
        <div className="space-y-4">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Database className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-semibold">{integration.name}</h3>
                        <Badge variant={getStatusColor(integration.status)} className="flex items-center space-x-1">
                          {getStatusIcon(integration.status)}
                          <span>{integration.status}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{integration.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Last Sync:</span>
                          <div className="font-medium">{formatDate(integration.lastSync)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Records Synced:</span>
                          <div className="font-medium">{integration.recordsSynced.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Errors:</span>
                          <div className={`font-medium ${integration.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {integration.errors}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSync(integration.id)}
                          disabled={syncing === integration.id}
                        >
                          {syncing === integration.id ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Sync
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                      
                      {integration.status === 'error' && (
                        <div className="text-xs text-red-600 text-right">
                          Check configuration
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Integration Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-800">Integration Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Download className="h-6 w-6" />
                  <span>Export Data</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-6 w-6" />
                  <span>Import Data</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Activity className="h-6 w-6" />
                  <span>View Logs</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
