"use client"

import React, { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/hooks/useUser"
import { cn } from "@/lib/utils"

import { useCertificates } from "@/features/manajemen-sertifikat/hooks/useCertificates"
import { CertificateTable } from "@/features/manajemen-sertifikat/components/CertificateTable"
import { EditCertificateModal } from "@/features/manajemen-sertifikat/components/EditCertificateModal"
import type { ProdiWithAccreditation } from "@/features/manajemen-sertifikat/utils"

export default function ManajemenSertifikatPage() {
  const { user, loading: userLoading } = useUser()
  const { data, loading, fetchData } = useCertificates()
  
  const [editingProdi, setEditingProdi] = useState<ProdiWithAccreditation | null>(null)

  if (userLoading) return null
  if (user?.role !== "SUPER_ADMIN") {
    return <div className="p-8 text-center text-sm text-gray-500">Akses ditolak. Halaman ini hanya untuk Super Admin.</div>
  }

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Sertifikat Akreditasi</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola sertifikat dan masa berlaku akreditasi seluruh program studi.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
          <CardTitle className="text-lg font-bold text-gray-900">Daftar Program Studi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CertificateTable 
            data={data} 
            loading={loading} 
            onEdit={(prodi) => setEditingProdi(prodi)} 
          />
        </CardContent>
      </Card>

      <EditCertificateModal 
        prodi={editingProdi} 
        onClose={() => setEditingProdi(null)} 
        onSuccess={() => {
          setEditingProdi(null)
          fetchData()
        }}
      />
    </>
  )
}