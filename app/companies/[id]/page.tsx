"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { getFirestoreDb } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, Mail, Phone, Globe, MapPin, User, Calendar } from "lucide-react"

export interface Company {
  id?: string
  name: string
  description?: string
  phone?: string
  website?: string
  address?: {
    street?: string
    city?: string
    province?: string
  }
  business_type?: string
  industry?: string
  size?: string
  point_person?: {
    email?: string
    first_name?: string
    last_name?: string
    position?: string
  }
  created_at?: Date
  updated_at?: Date
  status?: string
  owner_id?: string
}

export default function CompanyDetailsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return

      try {
        const db = getFirestoreDb()
        const docRef = doc(db, "companies", companyId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setCompany({
            id: docSnap.id,
            name: data.name || '',
            description: data.description || '',
            phone: data.phone || '',
            website: data.website || '',
            address: data.address || {},
            business_type: data.business_type || '',
            industry: data.industry || '',
            size: data.size || '',
            point_person: data.point_person || {},
            created_at: data.created_at?.toDate(),
            updated_at: data.updated_at?.toDate(),
            status: data.status || 'active',
            owner_id: data.owner_id || '',
          })
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching company:", error)
        setLoading(false)
      }
    }

    fetchCompany()
  }, [companyId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading company details...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!company) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Company not found.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/companies')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Companies
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-8 h-8" />
            <h1 className="text-4xl font-bold text-foreground">{company.name}</h1>
            <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
              {company.status || 'active'}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{company.description || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Industry</label>
                <p className="text-sm">{company.industry || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Type</label>
                <p className="text-sm">{company.business_type || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                <p className="text-sm">{company.size || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{company.phone}</span>
                </div>
              )}

              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}

              {company.address && (company.address.street || company.address.city || company.address.province) && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    {company.address.street && <div>{company.address.street}</div>}
                    {(company.address.city || company.address.province) && (
                      <div>{[company.address.city, company.address.province].filter(Boolean).join(', ')}</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {company.point_person && (company.point_person.first_name || company.point_person.last_name || company.point_person.email) && (
            <Card>
              <CardHeader>
                <CardTitle>Point Person</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(company.point_person.first_name || company.point_person.last_name) && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {[company.point_person.first_name, company.point_person.last_name].filter(Boolean).join(' ')}
                    </span>
                  </div>
                )}

                {company.point_person.position && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Position</label>
                    <p className="text-sm">{company.point_person.position}</p>
                  </div>
                )}

                {company.point_person.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{company.point_person.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">{company.created_at.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {company.updated_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Updated</label>
                    <p className="text-sm">{company.updated_at.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}