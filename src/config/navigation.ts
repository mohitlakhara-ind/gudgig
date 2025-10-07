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
  Heart,
  AlertCircle,
  Calendar,
  Award,
  MessageSquare,
  Plus,
  Package,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  roles?: string[];
  // Visual hierarchy and UX metadata
  section?: 'main' | 'work' | 'account' | 'manage' | 'grow' | 'overview' | 'system';
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
    section: 'main',
    ariaLabel: 'Dashboard home',
    shortcut: 'Ctrl+D',
  },
  {
    name: 'My Bids',
    href: '/dashboard/bids',
    icon: FileText,
    section: 'work',
    ariaLabel: 'View your submitted bids',
  },
  {
    name: 'Payment History',
    href: '/dashboard/payments',
    icon: CreditCard,
    section: 'work',
    ariaLabel: 'View payment history',
  },
  {
    name: 'Saved Gigs',
    href: '/saved-gigs',
    icon: Heart,
    section: 'work',
    ariaLabel: 'View saved gigs',
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    section: 'work',
    ariaLabel: 'Chat with clients',
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    section: 'account',
    ariaLabel: 'View notifications',
    badgeKey: 'notifications',
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
  {
    name: 'Chat',
    href: '/admin/chat',
    icon: MessageSquare,
    section: 'system',
    ariaLabel: 'Chat with users',
    dividerAfter: true,
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
  system: 'System',
} as const;

// Role naming now aligned to 'freelancer' and 'employer' (and 'admin').