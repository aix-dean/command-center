'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-context';

export type Department = 'ADMIN' | 'SAM' | 'IT';

export interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DepartmentContextType {
  department: Department;
  setDepartment: (dept: Department) => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

// Default routes for each department
const departmentDefaults: Record<Department, string> = {
  ADMIN: '/',
  SAM: '/sam-booking',
  IT: '/it/user-management',
};

// Routes allowed for each department
const departmentRoutes: Record<Department, string[]> = {
  ADMIN: ['/', '/companies', '/products'],
  SAM: ['/sam-booking'],
  IT: ['/it/user-management'],
};

export function DepartmentProvider({ children }: { children: React.ReactNode }) {
  const [department, setDepartmentState] = useState<Department>('ADMIN');
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const setDepartment = (dept: Department) => {
    setDepartmentState(dept);
    // Navigate to default route for the new department
    router.push(departmentDefaults[dept]);
  };

  // Check if current route is allowed for current department
  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (user) {
      // Only enforce department restrictions when authenticated
      console.log('Department check:', { department, pathname, allowedRoutes: departmentRoutes[department] });
      if (!departmentRoutes[department].includes(pathname)) {
        console.log('Redirecting to department default:', departmentDefaults[department]);
        router.push(departmentDefaults[department]);
      }
    } else {
      // When not authenticated, allow access to auth routes, redirect others to /login
      if (pathname !== '/login' && pathname !== '/register') {
        router.push('/login');
      }
    }
  }, [department, pathname, user, loading]);

  return (
    <DepartmentContext.Provider value={{ department, setDepartment }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartment() {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartment must be used within DepartmentProvider');
  }
  return context;
}