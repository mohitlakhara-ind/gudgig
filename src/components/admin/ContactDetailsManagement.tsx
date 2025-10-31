'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PhoneNumberInput } from '@/components/ui/PhoneNumberInput';
import { apiClient } from '@/lib/api';
import { ContactDetails, User } from '@/types/api';
import { Plus, Edit, Trash2, Search, Users, Mail, Phone, Building } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactDetailsManagementProps {
  className?: string;
}

export default function ContactDetailsManagement({ className }: ContactDetailsManagementProps) {
  const [contactDetails, setContactDetails] = useState<ContactDetails[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDetails | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    countryCode: 'US',
    company: '',
    position: '',
    notes: '',
    isDefault: false
  });

  useEffect(() => {
    fetchContactDetails();
    fetchUsers();
  }, [pagination.page, searchTerm, selectedUserId]);

  const fetchContactDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllContactDetails({
        page: pagination.page,
        limit: pagination.limit,
        userId: selectedUserId || undefined,
        search: searchTerm || undefined
      });

      if (response.success && response.data) {
        setContactDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      toast.error('Failed to fetch contact details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getAllUsers({ page: 1, limit: 50 });
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateContact = async () => {
    try {
      setLoading(true);
      const response = await apiClient.adminCreateContactDetails(formData);
      
      if (response.success) {
        toast.success('Contact details created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchContactDetails();
      } else {
        toast.error(response.message || 'Failed to create contact details');
      }
    } catch (error) {
      console.error('Error creating contact details:', error);
      toast.error('Failed to create contact details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;

    try {
      setLoading(true);
      const response = await apiClient.adminUpdateContactDetails(editingContact._id, formData);
      
      if (response.success) {
        toast.success('Contact details updated successfully');
        setIsEditDialogOpen(false);
        setEditingContact(null);
        resetForm();
        fetchContactDetails();
      } else {
        toast.error(response.message || 'Failed to update contact details');
      }
    } catch (error) {
      console.error('Error updating contact details:', error);
      toast.error('Failed to update contact details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact details?')) return;

    try {
      setLoading(true);
      const response = await apiClient.adminDeleteContactDetails(id);
      
      if (response.success) {
        toast.success('Contact details deleted successfully');
        fetchContactDetails();
      } else {
        toast.error(response.message || 'Failed to delete contact details');
      }
    } catch (error) {
      console.error('Error deleting contact details:', error);
      toast.error('Failed to delete contact details');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      name: '',
      email: '',
      phone: '',
      countryCode: 'US',
      company: '',
      position: '',
      notes: '',
      isDefault: false
    });
  };

  const openEditDialog = (contact: ContactDetails) => {
    setEditingContact(contact);
    setFormData({
      userId: contact.userId,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      countryCode: contact.countryCode,
      company: contact.company || '',
      position: contact.position || '',
      notes: contact.notes || '',
      isDefault: contact.isDefault
    });
    setIsEditDialogOpen(true);
  };

  const handlePhoneChange = (phone: string | undefined) => {
    if (phone) {
      try {
        const { parsePhoneNumber } = require('react-phone-number-input');
        const parsed = parsePhoneNumber(phone);
        setFormData(prev => ({
          ...prev,
          phone: parsed.number,
          countryCode: parsed.country || 'US'
        }));
      } catch (error) {
        setFormData(prev => ({ ...prev, phone }));
      }
    } else {
      setFormData(prev => ({ ...prev, phone: '', countryCode: 'US' }));
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contact Details Management
            </CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Contact Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userId">User</Label>
                    <Select value={formData.userId} onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <PhoneNumberInput
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="Job title"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    />
                    <Label htmlFor="isDefault">Set as default contact</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateContact} disabled={loading}>
                      {loading ? 'Creating...' : 'Create Contact'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact Details List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : contactDetails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No contact details found
                </div>
              ) : (
                contactDetails.map((contact) => (
                  <Card key={contact._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{contact.name}</h3>
                            {contact.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {contact.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {contact.phone}
                            </div>
                            {contact.company && (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {contact.company}
                              </div>
                            )}
                            {contact.position && (
                              <div className="text-gray-500">
                                {contact.position}
                              </div>
                            )}
                          </div>

                          {contact.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <strong>Notes:</strong> {contact.notes}
                            </div>
                          )}

                          <div className="mt-2 text-xs text-gray-500">
                            User: {contact.userId && typeof contact.userId === 'object' 
                              ? `${(contact as any).userId?.name ?? 'Unknown'} (${(contact as any).userId?.email ?? 'unknown@example.com'})` 
                              : 'Unknown User'}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContact(contact._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <Label>Phone Number</Label>
              <PhoneNumberInput
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  id="edit-position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Job title"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              />
              <Label htmlFor="edit-isDefault">Set as default contact</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateContact} disabled={loading}>
                {loading ? 'Updating...' : 'Update Contact'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



