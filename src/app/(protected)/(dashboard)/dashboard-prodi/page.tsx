"use client"

import React from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useMyProdi } from "@/features/dashboard/hooks/useMyProdi"
import { ProdiGrid } from "@/features/dashboard/components/ProdiGrid"

export default function ProdiSayaPage() {
  const { prodis, loading, error } = useMyProdi()

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Prodi Saya</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pilih program studi untuk melihat dashboard dan progress akreditasi
        </p>
      </header>

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
                Pastikan token Anda masih valid dan memiliki akses ke program studi
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && <ProdiGrid prodis={prodis} />}
    </div>
  )
}