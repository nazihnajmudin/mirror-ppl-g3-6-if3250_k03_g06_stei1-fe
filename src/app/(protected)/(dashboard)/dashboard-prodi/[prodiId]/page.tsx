"use client"

import React from "react"
import { useParams } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card" 

import { useProdiDetail } from "@/features/dashboard/hooks/useProdiDetail"
import { ProdiDetailTopbar } from "@/features/dashboard/components/ProdiDetailTopbar"
import { ProdiStatusCards } from "@/features/dashboard/components/ProdiStatusCards"
import { ProdiMainContent } from "@/features/dashboard/components/ProdiMainContent"
import { ProdiCriterionView } from "@/features/dashboard/components/ProdiCriterionView"

export default function DashboardProdiPage() {
  const params = useParams()
  const prodiId = params.prodiId as string
  
  const detailLogic = useProdiDetail(prodiId)
  const { loading, error, dashboard, selectedCriterion } = detailLogic

  return (
    <div className="space-y-6 md:space-y-8">
      
      {!loading && !error && dashboard && (
        <ProdiDetailTopbar {...detailLogic} isCriterionView={!!selectedCriterion} />
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 md:py-16">
          <Loader2 className="w-6 md:w-8 h-6 md:h-8 animate-spin text-gray-400" />
        </div>
      )}

      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 md:p-6 flex items-center gap-2 md:gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium text-sm md:text-base">{error}</p>
              <p className="text-xs md:text-sm text-red-700 mt-1">
                Gagal memuat data dashboard program studi
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && dashboard && (
        selectedCriterion ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <ProdiCriterionView {...detailLogic} prodiId={prodiId} />
          </div>
        ) : (
          <>
            <ProdiStatusCards dashboard={dashboard} />
            <ProdiMainContent {...detailLogic} />
          </>
        )
      )}
    </div>
  )
}