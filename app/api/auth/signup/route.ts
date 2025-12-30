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

    // Create user in the specified tenant
    const userRecord = await tenantManagerAdmin.createUserInTenant(
      tenantId,
      email,
      password
    )

    // Generate custom token for client-side authentication
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
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}