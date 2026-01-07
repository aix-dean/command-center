import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { firebaseConfig } from './firebase'

// Tenant ID for command-center-rep5o
export const TENANT_ID = 'command-center-rep5o'

// Firebase config with tenant-specific project settings
const getTenantConfig = (tenantId: string) => {
  // For multi-tenancy, you would typically have different projects
  // For now, we'll use the same project but with tenant context
  return {
    ...firebaseConfig,
    // In a real multi-tenant setup, you might have different API keys or projects per tenant
  }
}

class TenantManager {
  private tenantApps: Map<string, any> = new Map()
  private tenantAuths: Map<string, any> = new Map()

  // Get or create tenant-specific Firebase app
  getTenantApp(tenantId: string) {
    if (this.tenantApps.has(tenantId)) {
      return this.tenantApps.get(tenantId)
    }

    const config = getTenantConfig(tenantId)
    const appName = `tenant-${tenantId}`

    // Check if app already exists
    const existingApps = getApps()
    const existingApp = existingApps.find(app => app.name === appName)

    if (existingApp) {
      this.tenantApps.set(tenantId, existingApp)
      return existingApp
    }

    // Create new app for this tenant
    const app = initializeApp(config, appName)
    this.tenantApps.set(tenantId, app)
    return app
  }

  // Get or create tenant-specific auth instance
  getTenantAuth(tenantId: string) {
    if (this.tenantAuths.has(tenantId)) {
      return this.tenantAuths.get(tenantId)
    }

    const app = this.getTenantApp(tenantId)
    const auth = getAuth(app)

    // Set tenant ID in auth (this is a custom property for our logic)
    ;(auth as any).tenantId = tenantId

    this.tenantAuths.set(tenantId, auth)
    return auth
  }

  // Get the auth instance for command-center-rep5o tenant
  getCommandCenterAuth() {
    return this.getTenantAuth(TENANT_ID)
  }
}

export const tenantManager = new TenantManager()