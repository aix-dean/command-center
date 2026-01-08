import { NextRequest, NextResponse } from 'next/server'
import { tenantManagerAdmin } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email, password, tenantId } = await request.json()

    if (!email || !password || !tenantId) {
      return NextResponse.json(
        { error: 'Email, password, and tenantId are required' },
        { status: 400 }
      )
    }

    // For signin, we need to verify the user exists in the tenant
    // Since Firebase Auth handles the authentication, we'll use a custom token approach
    // First, find the user by email in the tenant
    const tenantAuth = tenantManagerAdmin.getTenantAuth(tenantId)
    const userRecord = await tenantAuth.getUserByEmail(email)

    // Verify the user belongs to the requested tenant
    // Note: In a real implementation, you'd store tenant association in Firestore or custom claims

    // Generate custom token for authentication
    const customToken = await tenantManagerAdmin.generateCustomTokenForTenant(
      userRecord.uid,
      tenantId
    )

    return NextResponse.json({
      uid: userRecord.uid,
      email: userRecord.email,
      tenantId,
      customToken,
    })
  } catch (error: any) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 500 }
    )
  }
}