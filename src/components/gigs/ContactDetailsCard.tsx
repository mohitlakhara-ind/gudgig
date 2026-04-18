'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  Building2,
  Shield,
  Eye,
  MapPin,
  Users
} from 'lucide-react';

interface ContactDetails {
  bidderContact: {
    name?: string;
    email: string;
    phone: string;
  };
  posterContact: {
    name?: string;
    email: string;
    phone: string;
    location?: string;
  };
}

interface ContactDetailsCardProps {
  contactDetails: ContactDetails | null;
  loading?: boolean;
}

export default function ContactDetailsCard({ contactDetails, loading = false }: ContactDetailsCardProps) {
  if (loading || !contactDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5" id="contact-details">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Contact Details
          <Badge variant="outline" className="ml-auto text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Order Placed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Employer / Task Provider Contact */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Employer / Task Provider</h3>
          </div>
          <div className="pl-6 space-y-2">
            {contactDetails.posterContact.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium text-foreground">
                  {contactDetails.posterContact.location}
                </span>
              </div>
            )}
            {contactDetails.posterContact.name && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Post Contact:</span>
                <span className="font-medium text-foreground">
                  {contactDetails.posterContact.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground break-all">
                {contactDetails.posterContact.email || 'Not provided'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium text-foreground">
                {contactDetails.posterContact.phone || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Privacy Notice</p>
              <p>
                Contact details are shared only after a successful unlock. Use this information responsibly and keep communications on-topic.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
