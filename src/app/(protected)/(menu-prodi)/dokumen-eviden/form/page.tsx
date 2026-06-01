"use client"
import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { Loader2 } from "lucide-react"
import { useEvidenForm } from "@/features/dokumen-eviden/hooks/useEvidenForm"
import { EvidenFormMain } from "@/features/dokumen-eviden/components/EvidenFormMain"

function EvidenFormPageContent() {
  const { user, loading: userLoading } = useUser()
  const searchParams = useSearchParams()
  
  const mode = (searchParams.get('mode') as 'add' | 'edit' | 'view') || 'view'
  const evidenId = searchParams.get('id')
  const urlProdiId = searchParams.get('prodiId')

  const logic = useEvidenForm(user, mode, evidenId, urlProdiId)

  if (userLoading || logic.isProdiLoading || logic.isFetchingDetail) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  if (!user) return null

  return <EvidenFormMain logic={logic} mode={mode} evidenId={evidenId} urlProdiId={urlProdiId} />
}

export default function EvidenFormPage() {
  return (
    <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <EvidenFormPageContent />
    </Suspense>
  )
}