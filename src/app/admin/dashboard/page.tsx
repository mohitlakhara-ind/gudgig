'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Bell, 
  MessageSquare, 
  Settings, 
  BarChart3,
  Crown,
  User,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import WelcomeMessageSender from '@/components/admin/WelcomeMessageSender';

export default function AdminDashboardPage() {
  // Mock data - in production, fetch from API
  const stats = {
    totalUsers: 1250,
    activeUsers: 980,
    totalAdmins: 5,
    notificationsSent: 3420,
    totalRevenue: 125000,
    activeGigs: 156
  };

  return (
    <div className="space-y-6">
     {/* Header */}
      <div className="bg-gradient-subtle-primary rounded-lg p-4 sm:p-6 border border-primary/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your Gigs Mint platform</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 border-primary/40">
            <Crown className="h-3 w-3 text-primary" />
            Administrator
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalAdmins}</div>
                <div className="text-xs text-muted-foreground">Admins</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.notificationsSent.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Notifications</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.activeGigs}</div>
                <div className="text-xs text-muted-foreground">Active Gigs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Welcome Message Sender */}
        <WelcomeMessageSender showDetails={true} />

        {/* Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/admin/notifications/broadcast">
                <MessageSquare className="h-4 w-4 mr-2" />
                Broadcast Messages
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/gigs">
                <BarChart3 className="h-4 w-4 mr-2" />
                Manage Gigs
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Platform Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Latest platform activities and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Welcome message sent to all users</div>
                <div className="text-xs text-muted-foreground">2 minutes ago</div>
              </div>
              <Badge variant="outline" className="text-primary border-primary/40">
                Success
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">New user registration: Alice Cooper</div>
                <div className="text-xs text-muted-foreground">15 minutes ago</div>
              </div>
              <Badge variant="outline" className="text-primary border-primary/40">
                User
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">New gig posted: Frontend Developer</div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </div>
              <Badge variant="outline" className="text-primary border-primary/40">
                Gig
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


