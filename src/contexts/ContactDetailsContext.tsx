'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ContactDetails {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  company?: string;
  position?: string;
  notes?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContactDetailsContextType {
  contactDetails: ContactDetails[];
  loading: boolean;
  error: string | null;
  createContactDetails: (data: Omit<ContactDetails, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<ContactDetails | null>;
  updateContactDetails: (id: string, data: Partial<ContactDetails>) => Promise<ContactDetails | null>;
  deleteContactDetails: (id: string) => Promise<boolean>;
  setDefaultContactDetails: (id: string) => Promise<boolean>;
  refreshContactDetails: () => Promise<void>;
  getDefaultContactDetails: () => ContactDetails | null;
}

const ContactDetailsContext = createContext<ContactDetailsContextType | undefined>(undefined);

interface ContactDetailsProviderProps {
  children: ReactNode;
}

export const ContactDetailsProvider: React.FC<ContactDetailsProviderProps> = ({ children }) => {
  const [contactDetails, setContactDetails] = useState<ContactDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchContactDetails = async () => {
    try {
      // Skip fetch when unauthenticated to avoid 401 noise on guest pages
      const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
      if (!isAuthenticated && !hasToken) {
        setContactDetails([]);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      const response = await apiClient.getContactDetails();
      if (response.success && response.data) {
        setContactDetails(response.data || []);
      } else {
        setError('Failed to fetch contact details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contact details');
      console.error('Error fetching contact details:', err);
    } finally {
      setLoading(false);
    }
  };

  const createContactDetails = async (data: Omit<ContactDetails, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ContactDetails | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createContactDetails(data as any);
      
      if (response.success) {
        setContactDetails(prev => [...prev, response.data]);
        toast.success(response.message || 'Contact details created successfully');
        return response.data;
      } else {
        setError(response.message || 'Failed to create contact details');
        toast.error(response.message || 'Failed to create contact details');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create contact details';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error creating contact details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateContactDetails = async (id: string, data: Partial<ContactDetails>): Promise<ContactDetails | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateContactDetails(id, data as any);
      
      if (response.success) {
        setContactDetails(prev => prev.map(contact => 
          contact._id === id ? response.data : contact
        ));
        toast.success(response.message || 'Contact details updated successfully');
        return response.data;
      } else {
        setError(response.message || 'Failed to update contact details');
        toast.error(response.message || 'Failed to update contact details');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update contact details';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error updating contact details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteContactDetails = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.deleteContactDetails(id);
      
      if (response.success) {
        setContactDetails(prev => prev.filter(contact => contact._id !== id));
        toast.success(response.message || 'Contact details deleted successfully');
        return true;
      } else {
        setError(response.message || 'Failed to delete contact details');
        toast.error(response.message || 'Failed to delete contact details');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete contact details';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deleting contact details:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultContactDetails = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.setDefaultContactDetails(id);
      
      if (response.success) {
        setContactDetails(prev => prev.map(contact => ({
          ...contact,
          isDefault: contact._id === id
        })));
        toast.success(response.message || 'Default contact updated successfully');
        return true;
      } else {
        setError(response.message || 'Failed to set default contact');
        toast.error(response.message || 'Failed to set default contact');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to set default contact';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error setting default contact:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshContactDetails = async () => {
    await fetchContactDetails();
  };

  const getDefaultContactDetails = (): ContactDetails | null => {
    return contactDetails.find(contact => contact.isDefault) || null;
  };

  useEffect(() => {
    fetchContactDetails();
  }, [isAuthenticated]);

  const value: ContactDetailsContextType = {
    contactDetails,
    loading,
    error,
    createContactDetails,
    updateContactDetails,
    deleteContactDetails,
    setDefaultContactDetails,
    refreshContactDetails,
    getDefaultContactDetails
  };

  return (
    <ContactDetailsContext.Provider value={value}>
      {children}
    </ContactDetailsContext.Provider>
  );
};

export const useContactDetails = (): ContactDetailsContextType => {
  const context = useContext(ContactDetailsContext);
  if (context === undefined) {
    throw new Error('useContactDetails must be used within a ContactDetailsProvider');
  }
  return context;
};

export default ContactDetailsContext;



