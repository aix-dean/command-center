import * as admin from 'firebase-admin'
import { firebaseConfig } from './firebase'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId,
  })
}

export const adminAuth = admin.auth()
export const adminFirestore = admin.firestore()

// Tenant management functions
export class TenantManagerAdmin {
  // Create a new tenant
  async createTenant(displayName?: string) {
    try {
      const tenant = await adminAuth.tenantManager().createTenant({
        displayName: displayName || 'Command Center Tenant',
      })
      console.log('Tenant created:', tenant.tenantId)
      return tenant
    } catch (error) {
      console.error('Error creating tenant:', error)
      throw error
    }
  }

  // Get tenant by ID
  async getTenant(tenantId: string) {
    try {
      const tenant = await adminAuth.tenantManager().getTenant(tenantId)
      return tenant
    } catch (error) {
      console.error('Error getting tenant:', error)
      throw error
    }
  }

  // Create user in specific tenant
  async createUserInTenant(tenantId: string, email: string, password: string) {
    try {
      const tenantAuth = adminAuth.tenantManager().authForTenant(tenantId)
      const userRecord = await tenantAuth.createUser({
        email,
        password,
      })
      console.log('User created in tenant:', userRecord.uid, 'tenant:', tenantId)
      return userRecord
    } catch (error) {
      console.error('Error creating user in tenant:', error)
      throw error
    }
  }

  // Generate custom token for tenant authentication
  async generateCustomTokenForTenant(uid: string, tenantId: string) {
    try {
      const tenantAuth = adminAuth.tenantManager().authForTenant(tenantId)
      const customToken = await tenantAuth.createCustomToken(uid)
      return customToken
    } catch (error) {
      console.error('Error generating custom token:', error)
      throw error
    }
  }

  // Get tenant auth instance
  getTenantAuth(tenantId: string) {
    return adminAuth.tenantManager().authForTenant(tenantId)
  }
}

export const tenantManagerAdmin = new TenantManagerAdmin()