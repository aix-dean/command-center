'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-context';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Department = 'ADMIN' | 'SAM' | 'IT';
export type UserRole = 'COMMAND_CENTER' | 'SAM_USER' | 'IT_USER';

export interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DepartmentContextType {
  department: Department;
  setDepartment: (dept: Department) => void;
  userRoles: UserRole[];
  allowedDepartments: Department[];
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

// Role to allowed departments mapping
const roleDepartmentAccess: Record<UserRole, Department[]> = {
  COMMAND_CENTER: ['ADMIN', 'SAM', 'IT'],
  SAM_USER: ['SAM'],
  IT_USER: ['IT'],
};

export function DepartmentProvider({ children }: { children: React.ReactNode }) {
  const [department, setDepartmentState] = useState<Department>('ADMIN');
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [allowedDepartments, setAllowedDepartments] = useState<Department[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Initialize department based on user roles
  useEffect(() => {
    if (user && userRoles.length > 0 && allowedDepartments.length > 0) {
      // Set department to the first allowed department if current department is not allowed
      if (!allowedDepartments.includes(department)) {
        const firstAllowed = allowedDepartments[0];
        setDepartmentState(firstAllowed);
        router.push(departmentDefaults[firstAllowed]);
      }
    }
  }, [user, userRoles, allowedDepartments, department, router]);

  // Listen for real-time updates to user roles from Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      const userDocRef = doc(db, 'command_center_users', user.uid);
      unsubscribe = onSnapshot(userDocRef, (userDoc) => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Support both old 'type' field and new 'roles' field for migration
          const roles = data.roles || (data.type ? [data.type] : []);
          setUserRoles(roles as UserRole[]);
          // Compute allowed departments from all user roles
          const departments = new Set<Department>();
          roles.forEach((role: UserRole) => {
            const depts = roleDepartmentAccess[role] || [];
            depts.forEach(dept => departments.add(dept));
          });
          setAllowedDepartments(Array.from(departments));
        }
      });
    } else {
      setUserRoles([]);
      setAllowedDepartments([]);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const setDepartment = (dept: Department) => {
    if (userRoles.length > 0 && !allowedDepartments.includes(dept)) {
      console.warn(`User with roles ${userRoles.join(', ')} cannot access department ${dept}`);
      return;
    }
    setDepartmentState(dept);
    // Navigate to default route for the new department
    router.push(departmentDefaults[dept]);
  };

  // Check if current route is allowed for current department and user roles
  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (user) {
      // Only enforce department restrictions when authenticated
      console.log('Department check:', { department, pathname, allowedRoutes: departmentRoutes[department], userRoles, allowedDepartments });

      // First check if user can access the current department
      if (userRoles.length > 0 && !allowedDepartments.includes(department)) {
        console.log('User cannot access current department, redirecting to first allowed department');
        const firstAllowed = allowedDepartments[0] || 'ADMIN';
        setDepartmentState(firstAllowed);
        router.push(departmentDefaults[firstAllowed]);
        return;
      }

      // Then check if current route is allowed for the department
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
  }, [department, pathname, user, loading, userRoles, allowedDepartments]);

  return (
    <DepartmentContext.Provider value={{ department, setDepartment, userRoles, allowedDepartments }}>
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