import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Radar, Sparkles, Zap, Trophy, Wand2, Package, Receipt,
  GitBranch, Store, PlusSquare, PackageCheck, Users, KeyRound, CreditCard, Settings,
} from 'lucide-react';

export type Role = 'admin' | 'owner' | 'team';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
  tag?: string;
  /** Phase-2 screens render a clearly-marked shell, not live data. */
  phase2?: boolean;
  active?: boolean;
}

export interface NavSection {
  label?: string;
  roles: Role[];
  store?: boolean; // hidden when storefront is off
  divider?: boolean;
  items: NavItem[];
}

const ALL: Role[] = ['admin', 'owner', 'team'];
const ADMIN_OWNER: Role[] = ['admin', 'owner'];

export const NAV: NavSection[] = [
  {
    roles: ALL,
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ALL },
      { href: '/scanner', label: 'Market Scanner', icon: Radar, roles: ADMIN_OWNER },
      { href: '/assistant', label: 'AI Assistant', icon: Sparkles, roles: ADMIN_OWNER },
    ],
  },
  {
    label: 'Categories',
    roles: ADMIN_OWNER,
    items: [
      { href: '/dashboard', label: 'Pokémon TCG', icon: Zap, roles: ADMIN_OWNER, tag: '847', active: true },
      { href: '/placeholder/sports', label: 'Sports Cards', icon: Trophy, roles: ADMIN_OWNER, tag: '312', phase2: true },
      { href: '/placeholder/mtg', label: 'Magic: The Gathering', icon: Wand2, roles: ADMIN_OWNER, phase2: true },
    ],
  },
  {
    label: 'Operations',
    roles: ALL,
    items: [
      { href: '/inventory', label: 'My Inventory', icon: Package, roles: ALL },
      { href: '/sales', label: 'Sales History', icon: Receipt, roles: ADMIN_OWNER },
      { href: '/pipeline', label: 'Pipeline Status', icon: GitBranch, roles: ADMIN_OWNER },
    ],
  },
  {
    label: 'Store',
    roles: ALL,
    store: true,
    items: [
      { href: '/store', label: 'Storefront', icon: Store, roles: ALL, phase2: true },
      { href: '/store/add', label: 'Add Product', icon: PlusSquare, roles: ALL, phase2: true },
      { href: '/store/orders', label: 'Orders', icon: PackageCheck, roles: ALL, tag: '4', phase2: true },
      { href: '/store/customers', label: 'Customers', icon: Users, roles: ADMIN_OWNER, phase2: true },
    ],
  },
  {
    roles: ADMIN_OWNER,
    divider: true,
    items: [
      { href: '/admin', label: 'Admin Panel', icon: KeyRound, roles: ['admin'], phase2: true },
      { href: '/billing', label: 'Billing & Plans', icon: CreditCard, roles: ADMIN_OWNER, phase2: true },
      { href: '/settings', label: 'Settings', icon: Settings, roles: ALL, phase2: true },
    ],
  },
];
