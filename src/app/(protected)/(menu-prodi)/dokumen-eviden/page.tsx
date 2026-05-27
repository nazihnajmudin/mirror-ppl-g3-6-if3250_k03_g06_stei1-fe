"use client"
import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { useEvidenList } from "@/features/dokumen-eviden/hooks/useEvidenList"
import { EvidenListMain } from "@/features/dokumen-eviden/components/EvidenListMain"

function EvidenListPageContent() {
  const { user, loading } = useUser()
  const searchParams = useSearchParams()
  const urlProdiId = searchParams.get("prodiId")
  const logic = useEvidenList(user)

  if (loading || logic.isFetching) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }
  
  if (!user) return null

  return <EvidenListMain user={user} logic={logic} urlProdiId={urlProdiId} />
}

export default function EvidenListPage() {
  return (
    <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <EvidenListPageContent />
    </Suspense>
  )
}