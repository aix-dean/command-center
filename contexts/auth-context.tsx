"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db, tenantAuth } from '@/lib/firebase'
import { tenantManager } from '@/lib/tenant-manager'

interface AuthContextType {
  user: User | null
  tenant: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(tenantAuth, async (user) => {
      console.log('Auth state changed:', { user: user ? 'authenticated' : 'not authenticated', uid: user?.uid, tenantId: tenantAuth.tenantId })
      setUser(user)

      if (user) {
        console.log('Auth state changed - user authenticated:', user.email, user.uid)
        const newUserDocRef = doc(db, 'command_center_users', user.uid)
        console.log('Looking for user doc at:', newUserDocRef.path)
        let userDoc = await getDoc(newUserDocRef)
        if (userDoc.exists()) {
          console.log('User document found in tenant path')
          const userData = userDoc.data()
          if (!userData.tenant) {
            console.log('Updating user document with tenant')
            await updateDoc(newUserDocRef, { tenant: 'command-center-rep5o' })
          }
          setTenant(userData.tenant || 'command-center-rep5o')
        } else {
          console.log('User document not found in tenant path, checking old paths')
          // Check old paths for migration
          const oldPaths = ['command-center/command-center-rep5o/command_center_users', 'command_center_users', 'users']
          let migrated = false
          for (const oldPath of oldPaths) {
            const oldUserDocRef = doc(db, oldPath, user.uid)
            console.log('Checking old path:', oldUserDocRef.path)
            const oldUserDoc = await getDoc(oldUserDocRef)
            if (oldUserDoc.exists()) {
              console.log('Found user document in old path, migrating')
              const oldData = oldUserDoc.data()
              const newData = { ...oldData, tenant: 'command-center-rep5o' }
              await setDoc(newUserDocRef, newData)
              setTenant('command-center-rep5o')
              migrated = true
              break
            }
          }
          if (!migrated) {
            console.log('No existing user document found, creating new one')
            // If no document found anywhere, create it with default tenant
            await setDoc(newUserDocRef, {
              email: user.email,
              uid: user.uid,
              roles: ["IT_USER"],
              createdAt: new Date()
            })
            setTenant('command-center-rep5o')
          }
        }
      } else {
        console.log('Auth state changed - user signed out')
        setTenant(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("=== LOGIN DEBUG START ===")
    console.log("Tenant ID:", tenantAuth.tenantId)
    console.log("Logging in user with tenant ID:", tenantAuth.tenantId)

    // Try tenant auth only
    const userCredential = await signInWithEmailAndPassword(tenantAuth, email, password)
    console.log("✅ Tenant auth successful for user:", userCredential.user.uid)
  }

  const signUp = async (email: string, password: string) => {
    // Create user in Firebase Auth (tenant)
    const userCredential = await createUserWithEmailAndPassword(tenantAuth, email, password)
    const firebaseUser = userCredential.user
  }

  const logout = async () => {
    await signOut(tenantAuth)
  }

  const value: AuthContextType = {
    user,
    tenant,
    loading,
    signIn,
    signUp,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}