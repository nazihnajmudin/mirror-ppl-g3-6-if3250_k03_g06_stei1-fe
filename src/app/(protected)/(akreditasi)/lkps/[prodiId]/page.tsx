"use client"
import React, { Suspense } from 'react'
import { useLKPSHistory } from "@/features/lkps/hooks/useLKPSHistory"
import { LKPSHistoryMain } from "@/features/lkps/components/LKPSHistoryMain"

function HistoryContent({ prodiId }: { prodiId: string }) {
  const logic = useLKPSHistory(prodiId)
  return <LKPSHistoryMain logic={logic} prodiId={prodiId} />
}

export default function Page({ params }: { params: Promise<{ prodiId: string }> }) {
  const resolvedParams = React.use(params)
  return <Suspense><HistoryContent prodiId={resolvedParams.prodiId} /></Suspense>
}