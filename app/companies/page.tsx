"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, onSnapshot, type Firestore } from "firebase/firestore"
import { getFirestoreDb } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"

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

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const db = getFirestoreDb()
        const q = query(
          collection(db, "companies"),
          orderBy("created_at", "desc")
        )

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedCompanies: Company[] = []
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            fetchedCompanies.push({
              id: doc.id,
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
          })

          setCompanies(fetchedCompanies)
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error("Error fetching companies:", error)
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const handleRowClick = (companyId: string) => {
    router.push(`/companies/${companyId}`)
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            <h1 className="text-4xl font-bold text-foreground">Companies</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Management</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Loading companies...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">No companies found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Business Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow
                        key={company.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => company.id && handleRowClick(company.id)}
                      >
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.industry}</TableCell>
                        <TableCell>{company.business_type}</TableCell>
                        <TableCell>
                          {company.point_person?.email || company.phone || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                            {company.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {company.created_at?.toLocaleDateString() || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}