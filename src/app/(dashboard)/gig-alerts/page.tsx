'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, Plus, Edit, Trash2, MapPin, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface GigAlert {
  id: string;
  name: string;
  keywords: string;
  location: string;
  gigType: 'all' | 'full-time' | 'part-time' | 'contract' | 'remote';
  salaryMin: string;
  salaryMax: string;
  frequency: 'immediate' | 'daily' | 'weekly';
  isActive: boolean;
  createdDate: string;
  lastTriggered?: string;
  matchCount: number;
}

export default function GigAlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<GigAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<GigAlert | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    location: '',
    gigType: 'all' as GigAlert['gigType'],
    salaryMin: '',
    salaryMax: '',
    frequency: 'daily' as GigAlert['frequency'],
    isActive: true,
  });

  // Fetch real gig alerts from API
  useEffect(() => {
    const fetchGigAlerts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getJobAlerts();
        if (response.success && response.data?.alerts) {
          // Transform alerts data to gig alerts format
          const gigAlerts = response.data.alerts.map((alert: any) => ({
            id: alert._id,
            name: alert.name || `${alert.keyword || 'Job'} Alert`,
            keywords: alert.keyword || '',
            location: alert.location || 'Any',
            gigType: 'all' as GigAlert['gigType'], // Default to all since API doesn't specify
            salaryMin: '',
            salaryMax: '',
            frequency: 'daily' as GigAlert['frequency'], // Default frequency
            isActive: alert.isActive !== false, // Default to active
            createdDate: alert.createdAt || new Date().toISOString().split('T')[0],
            lastTriggered: alert.lastTriggered,
            matchCount: alert.matchCount || 0
          }));
          setAlerts(gigAlerts);
        } else {
          setAlerts([]);
        }
      } catch (error) {
        console.error('Error fetching gig alerts:', error);
        
        // Show more specific error message
        let errorMessage = 'Failed to load gig alerts';
        if (error instanceof Error) {
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            errorMessage = 'Please log in to view your gig alerts';
          } else if (error.message.includes('404')) {
            errorMessage = 'Gig alerts service not available';
          } else if (error.message.includes('500')) {
            errorMessage = 'Server error. Please try again later';
          } else if (error.message.includes('Network error')) {
            errorMessage = 'Network error. Please check your connection';
          }
        }
        
        toast.error(errorMessage);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGigAlerts();
  }, []);

  const handleCreateAlert = async () => {
    try {
      const response = await apiClient.createJobAlert({
        keyword: formData.keywords,
        category: formData.gigType !== 'all' ? formData.gigType : undefined,
        location: formData.location || undefined
      });
      
      if (response.success) {
        const newAlert: GigAlert = {
          id: response.data?._id || Date.now().toString(),
          ...formData,
          createdDate: new Date().toISOString().split('T')[0],
          matchCount: 0,
        };
        
        setAlerts(prev => [...prev, newAlert]);
        toast.success('Gig alert created successfully');
      } else {
        toast.error('Failed to create gig alert');
      }
    } catch (error) {
      console.error('Error creating gig alert:', error);
      
      let errorMessage = 'Failed to create gig alert';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Please log in to create gig alerts';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid alert data. Please check your inputs';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later';
        }
      }
      
      toast.error(errorMessage);
    }
    
    setFormData({
      name: '',
      keywords: '',
      location: '',
      gigType: 'all',
      salaryMin: '',
      salaryMax: '',
      frequency: 'daily',
      isActive: true,
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditAlert = (alert: GigAlert) => {
    setEditingAlert(alert);
    setFormData({
      name: alert.name,
      keywords: alert.keywords,
      location: alert.location,
      gigType: alert.gigType,
      salaryMin: alert.salaryMin,
      salaryMax: alert.salaryMax,
      frequency: alert.frequency,
      isActive: alert.isActive,
    });
    setIsCreateDialogOpen(true);
  };

  const handleUpdateAlert = () => {
    if (!editingAlert) return;
    
    setAlerts(prev => prev.map(alert => 
      alert.id === editingAlert.id 
        ? { ...alert, ...formData }
        : alert
    ));
    
    setEditingAlert(null);
    setFormData({
      name: '',
      keywords: '',
      location: '',
      gigType: 'all',
      salaryMin: '',
      salaryMax: '',
      frequency: 'daily',
      isActive: true,
    });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await apiClient.deleteJobAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Gig alert deleted successfully');
    } catch (error) {
      console.error('Error deleting gig alert:', error);
      
      let errorMessage = 'Failed to delete gig alert';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Please log in to delete gig alerts';
        } else if (error.message.includes('404')) {
          errorMessage = 'Gig alert not found';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later';
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'part-time':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'contract':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'remote':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'immediate':
        return 'Immediate';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      default:
        return frequency;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gig Alerts</h1>
            <p className="text-muted-foreground">Manage your gig notifications</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gig Alerts</h1>
          <p className="text-muted-foreground">
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAlert ? 'Edit Gig Alert' : 'Create Gig Alert'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pr-2">
              <div>
                <Label htmlFor="name">Alert Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Frontend Developer Jobs"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., React, TypeScript, Frontend"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA or Remote"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="gigType">Job Type</Label>
                <Select value={formData.gigType} onValueChange={(value) => setFormData(prev => ({ ...prev, gigType: value as GigAlert['gigType'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Min Salary</Label>
                  <Input
                    id="salaryMin"
                    placeholder="50000"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax">Max Salary</Label>
                  <Input
                    id="salaryMax"
                    placeholder="100000"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="frequency">Notification Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as GigAlert['frequency'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingAlert(null);
                  setFormData({
                    name: '',
                    keywords: '',
                    location: '',
                    gigType: 'all',
                    salaryMin: '',
                    salaryMax: '',
                    frequency: 'daily',
                    isActive: true,
                  });
                }}>
                  Cancel
                </Button>
                <Button onClick={editingAlert ? handleUpdateAlert : handleCreateAlert}>
                  {editingAlert ? 'Update Alert' : 'Create Alert'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No gig alerts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first gig alert to get notified about relevant opportunities
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`${alert.isActive ? '' : 'opacity-60'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{alert.name}</h3>
                      {alert.isActive ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm">
                        <strong>Keywords:</strong> {alert.keywords}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {alert.location}
                        </div>
                        {alert.salaryMin && alert.salaryMax && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${alert.salaryMin} - ${alert.salaryMax}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {getFrequencyLabel(alert.frequency)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      {alert.gigType !== 'all' && (
                        <Badge className={getJobTypeColor(alert.gigType)}>
                          {alert.gigType.replace('-', ' ')}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {alert.matchCount} matches
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created {formatDate(alert.createdDate)}
                      {alert.lastTriggered && (
                        <span> • Last triggered {formatDate(alert.lastTriggered)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={() => handleToggleAlert(alert.id)}
                      />
                      <span className="text-sm">Active</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAlert(alert)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
