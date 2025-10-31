import {
  Briefcase,
  DollarSign,
  HelpCircle,
  LayoutDashboard,
  FileText,
  User,
  Bell,
  CreditCard,
  Users,
  BarChart3,
  Heart,
  Package,
  Search,
  Settings,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  roles?: string[];
  // Visual hierarchy and UX metadata
  section?: 'main' | 'work' | 'account' | 'manage' | 'grow' | 'overview' | 'activity' | 'system';
  badgeKey?: 'notifications' | 'messages' | 'orders';
  badgeCount?: number;
  ariaLabel?: string;
  shortcut?: string;
  dividerAfter?: boolean;
}

export const primaryNavigation: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Browse Gigs',
    href: '/gigs',
  },
  {
    name: 'Categories',
    href: '/categories',
  },
  {
    name: 'About Us',
    href: '/about',
  },
  {
    name: 'Contact',
    href: '/contact',
  },
];

export const freelancerNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    section: 'overview',
    ariaLabel: 'Dashboard home',
    shortcut: 'Ctrl+D',
  },
  {
    name: 'Browse Gigs',
    href: '/gigs',
    icon: Search,
    section: 'overview',
    ariaLabel: 'Find opportunities',
  },
  {
    name: 'Saved Gigs',
    href: '/saved-gigs',
    icon: Heart,
    section: 'overview',
    ariaLabel: 'View saved gigs',
  },
  {
    name: 'My Bids',
    href: '/bids',
    icon: FileText,
    section: 'work',
    ariaLabel: 'View your submitted bids',
  },
  {
    name: 'My Services',
    href: '/services',
    icon: Package,
    section: 'work',
    ariaLabel: 'Manage your services',
  },
  {
    name: 'Payment History',
    href: '/payments',
    icon: CreditCard,
    section: 'activity',
    ariaLabel: 'View payment history',
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    section: 'activity',
    ariaLabel: 'View notifications',
    badgeKey: 'notifications',
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    section: 'account',
    ariaLabel: 'Manage your profile',
  },
  {
    name: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    section: 'account',
    ariaLabel: 'Get help and support',
  },
];

// Employer navigation removed - only admin can post gigs

// Admin navigation items - Only admin can post and manage gigs
export const adminNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    section: 'overview',
    ariaLabel: 'Admin dashboard overview',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    section: 'overview',
    ariaLabel: 'View platform analytics',
  },
  {
    name: 'Post Gig',
    href: '/admin/gigs',
    icon: Briefcase,
    section: 'manage',
    ariaLabel: 'Post new gig',
  },
  {
    name: 'Manage Gigs',
    href: '/admin/gigs',
    icon: Briefcase,
    section: 'manage',
    ariaLabel: 'Manage all gigs',
  },
  {
    name: 'View Bids',
    href: '/admin/bids',
    icon: FileText,
    section: 'manage',
    ariaLabel: 'View and manage bids',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    section: 'manage',
    ariaLabel: 'Manage users',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    section: 'manage',
    ariaLabel: 'Platform settings',
  },
  {
    name: 'Payment Settings',
    href: '/admin/payment-settings',
    icon: DollarSign,
    section: 'system',
    ariaLabel: 'Configure payment and bid fee settings',
  },
  {
    name: 'Payment Logs',
    href: '/admin/payment-logs',
    icon: FileText,
    section: 'system',
    ariaLabel: 'View payment logs and transactions',
  },
];

// Navigation section display labels
export const NAVIGATION_SECTIONS = {
  main: 'Main',
  work: 'Work',
  account: 'Account',
  manage: 'Manage',
  grow: 'Grow',
  overview: 'Overview',
  activity: 'Activity',
  system: 'System',
} as const;

// Role naming now aligned to 'freelancer' and 'employer' (and 'admin').