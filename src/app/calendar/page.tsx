'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'tender' | 'delivery' | 'deadline' | 'meeting';
  date: Date;
  status: 'upcoming' | 'today' | 'overdue' | 'completed';
  description?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Mock data for now
        const mockEvents: CalendarEvent[] = [
          {
            id: '1',
            title: 'HPLC Columns Tender Closes',
            type: 'tender',
            date: new Date('2024-02-15'),
            status: 'upcoming',
            description: 'Annual tender for HPLC columns and related consumables',
            priority: 'high',
          },
          {
            id: '2',
            title: 'Merck Solvents Delivery',
            type: 'delivery',
            date: new Date('2024-01-30'),
            status: 'today',
            description: 'Expected delivery of HPLC grade solvents',
            priority: 'medium',
          },
          {
            id: '3',
            title: 'Vendor Performance Review',
            type: 'meeting',
            date: new Date('2024-02-01'),
            status: 'upcoming',
            description: 'Quarterly review with Transfarma',
            priority: 'medium',
          },
          {
            id: '4',
            title: 'Purchase Order Approval Deadline',
            type: 'deadline',
            date: new Date('2024-01-25'),
            status: 'overdue',
            description: 'PO-2024-003 needs approval',
            priority: 'high',
          },
          {
            id: '5',
            title: 'Biotech Consumables Delivery',
            type: 'delivery',
            date: new Date('2024-01-28'),
            status: 'completed',
            description: 'Cell culture flasks delivered successfully',
            priority: 'low',
          },
        ];
        
        setEvents(mockEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'tender': return <FileText className="h-4 w-4" />;
      case 'delivery': return <Calendar className="h-4 w-4" />;
      case 'deadline': return <Clock className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'info';
      case 'today': return 'warning';
      case 'overdue': return 'destructive';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'today': return <AlertCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getDaysUntilEvent = (date: Date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  // Group events by status
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const todayEvents = events.filter(e => e.status === 'today');
  const overdueEvents = events.filter(e => e.status === 'overdue');
  const completedEvents = events.filter(e => e.status === 'completed');

  if (loading) {
    return (
      <MainLayout title="Tender Calendar">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Tender Calendar">
      <div className="space-y-6">
        {/* Calendar Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:items-center"
        >
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Tender Calendar</h2>
            <p className="text-gray-600">Track important dates and deadlines</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto justify-center">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
            <Button className="w-full sm:w-auto justify-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold text-red-500">{overdueEvents.length}</div>
                    <div className="text-sm text-gray-600">Overdue</div>
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
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-500">{todayEvents.length}</div>
                    <div className="text-sm text-gray-600">Today</div>
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
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{upcomingEvents.length}</div>
                    <div className="text-sm text-gray-600">Upcoming</div>
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
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-500">{completedEvents.length}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Events by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overdue Events */}
          {overdueEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800">
                    <AlertCircle className="h-5 w-5" />
                    <span>Overdue Events</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {overdueEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50">
                      <div className="flex items-center space-x-3 text-gray-800">
                        {getEventTypeIcon(event.type)}
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-600">{formatDate(event.date)}</div>
                        </div>
                      </div>
                      <Badge variant="destructive">{getDaysUntilEvent(event.date)}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Today's Events */}
          {todayEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800">
                    <Clock className="h-5 w-5" />
                    <span>Today's Events</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todayEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                      <div className="flex items-center space-x-3 text-gray-800">
                        {getEventTypeIcon(event.type)}
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-600">{formatTime(event.date)}</div>
                        </div>
                      </div>
                      <Badge variant="warning">Today</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-indigo-100 bg-indigo-50 hover:bg-gray-50">
                    <div className="flex items-center space-x-3 text-gray-800">
                      {getEventTypeIcon(event.type)}
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-600">{formatDate(event.date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(event.priority)} className="text-xs">
                        {event.priority}
                      </Badge>
                      <Badge variant="info">{getDaysUntilEvent(event.date)}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Completed Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <CheckCircle className="h-5 w-5" />
                  <span>Recently Completed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex items-center space-x-3 text-gray-800">
                      {getEventTypeIcon(event.type)}
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-600">{formatDate(event.date)}</div>
                      </div>
                    </div>
                    <Badge variant="success">Completed</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
