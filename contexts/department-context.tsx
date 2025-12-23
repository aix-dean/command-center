'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type Department = 'ADMIN' | 'SAM';

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
};

// Routes allowed for each department
const departmentRoutes: Record<Department, string[]> = {
  ADMIN: ['/', '/companies', '/products'],
  SAM: ['/sam-booking'],
};

export function DepartmentProvider({ children }: { children: React.ReactNode }) {
  const [department, setDepartmentState] = useState<Department>('ADMIN');
  const router = useRouter();
  const pathname = usePathname();

  const setDepartment = (dept: Department) => {
    setDepartmentState(dept);
    // Navigate to default route for the new department
    router.push(departmentDefaults[dept]);
  };

  // Check if current route is allowed for current department
  useEffect(() => {
    if (!departmentRoutes[department].includes(pathname)) {
      router.push(departmentDefaults[department]);
    }
  }, [department, pathname, router]);

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