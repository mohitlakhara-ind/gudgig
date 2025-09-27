import {
  Home,
  Briefcase,
  DollarSign,
  HelpCircle,
  Phone,
  LayoutDashboard,
  FileText,
  User,
  Bell,
  CreditCard,
  Building,
  Users,
  Settings,
  BarChart3,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  roles?: string[];
}

export const primaryNavigation: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Browse Services',
    href: '/dashboard/services',
  },
  {
    name: 'Find MicroJobs',
    href: '/jobs',
  },
  {
    name: 'Pricing',
    href: '/pricing',
  },
  {
    name: 'Help Center',
    href: '/help-center',
  },
  {
    name: 'Contact',
    href: '/contact',
  },
];

export const jobSeekerNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'My Services',
    href: '/dashboard/services',
    icon: Briefcase,
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: FileText,
  },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: Bell,
  },
  {
    name: 'My Applications',
    href: '/applications',
    icon: FileText,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    name: 'Subscription',
    href: '/subscription',
    icon: CreditCard,
  },
];

export const employerNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/employer/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Browse Services',
    href: '/dashboard/services',
    icon: Briefcase,
  },
  {
    name: 'Post a MicroJob',
    href: '/employer/post-job',
    icon: Briefcase,
  },
  {
    name: 'My MicroJobs',
    href: '/employer/jobs',
    icon: Building,
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: FileText,
  },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: Bell,
  },
  {
    name: 'Applications',
    href: '/employer/applications',
    icon: Users,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Promote',
    href: '/employer/promote',
    icon: BarChart3,
  },
];

export const adminNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'MicroJobs',
    href: '/admin/jobs',
    icon: Briefcase,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];