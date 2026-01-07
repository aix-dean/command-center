import { Building2, Package, Home, Eye, Heart } from 'lucide-react';
import { Department, MenuItem } from '@/contexts/department-context';

export const menuConfig: Record<Department, MenuItem[]> = {
  ADMIN: [
    { href: '/', label: 'Booking Censorship', icon: Home },
    { href: '/companies', label: 'Companies', icon: Building2 },
    { href: '/products', label: 'Products', icon: Package },
  ],
  SAM: [
    { href: '/sam-booking', label: 'Booking Censorship', icon: Eye },
    { href: '/sam-wishlist', label: 'Wishlist', icon: Heart },
  ],
};