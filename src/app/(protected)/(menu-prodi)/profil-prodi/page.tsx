"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import apiClient from "@/lib/api-client"

import { ProdiListView } from "@/features/profil-prodi/components/ProdiListView"
import { ProdiDetailView } from "@/features/profil-prodi/components/ProdiDetailView"

function ProfilProdiContent() {
  const { user, loading } = useUser()
  const searchParams = useSearchParams()
  const urlProdiId = searchParams.get("prodiId")
  const [accessibleProdis, setAccessibleProdis] = useState<any[]>([])
  const [isProdiLoading, setIsProdiLoading] = useState(true)

  useEffect(() => {
    const fetchMyProdis = async () => {
      if (loading) return
      if (!user) {
        setIsProdiLoading(false)
        return
      }
      try {
        const res = await apiClient.get('/prodi/my-prodi')
        setAccessibleProdis(res.data.data || [])
      } catch (err) {
        console.error("Failed to fetch my prodis")
      } finally {
        setIsProdiLoading(false)
      }
    }
    fetchMyProdis()
  }, [user, loading])

  if (loading || isProdiLoading) {
    return (
      <div className="p-12 flex items-center justify-center gap-3 text-gray-500 font-bold">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        Memuat otorisasi...
      </div>
    )
  }
  
  if (!user) return null

  const isGuestRole = user.role === 'PIMPINAN' || user.role === 'SUPER_ADMIN'
  // const canEdit = user.role === 'KAPRODI'
  const canEdit = false

  if (urlProdiId) {
    const hasAccess = accessibleProdis.some(p => p.id === urlProdiId)
    if (!hasAccess && !isGuestRole) {
      return <div className="p-12 text-center text-red-500 font-bold">Akses ditolak. Anda tidak terdaftar di program studi ini.</div>
    }
    return <ProdiDetailView targetProdiId={urlProdiId} canEdit={canEdit && !isGuestRole} />
  }

  if (isGuestRole || accessibleProdis.length > 1) {
    return <ProdiListView />
  }

  if (accessibleProdis.length === 1) {
    return <ProdiDetailView targetProdiId={accessibleProdis[0].id} canEdit={canEdit} />
  }

  return <div className="p-12 text-center text-red-500 font-bold">Akses ditolak atau Program Studi tidak ditemukan.</div>
}

export default function ProfilProdiPage() {
  return (
    <Suspense fallback={<div className="p-12 flex items-center justify-center gap-3 text-gray-500 font-bold"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Memuat halaman...</div>}>
      <ProfilProdiContent />
    </Suspense>
  )
}