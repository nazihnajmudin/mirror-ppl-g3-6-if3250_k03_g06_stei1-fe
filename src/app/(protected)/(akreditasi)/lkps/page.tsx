"use client"
import React, { Suspense } from 'react'
import { Loader2 } from "lucide-react"
import { useLKPSProdiList } from "@/features/lkps/hooks/useLKPSProdiList"
import { LKPSProdiListMain } from "@/features/lkps/components/LKPSProdiListMain"
import { useRouter } from 'next/navigation'

function ListContent() {
  const router = useRouter()
  const logic = useLKPSProdiList()
  if (logic.loading) return <div className="flex justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  return <LKPSProdiListMain logic={logic} router={router} />
}

export default function Page() {
  return <Suspense><ListContent /></Suspense>
}