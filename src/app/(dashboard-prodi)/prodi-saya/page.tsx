"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Loader2, AlertCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/errors"
import apiClient from "@/lib/api-client"
import type { ApiResponse, ProdiOption } from "@/types/api.types"

export default function ProdiSayaPage() {
  const [prodis, setProdis] = useState<ProdiOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadProdis = async () => {
      try {
        const response = await apiClient.get<ApiResponse<ProdiOption[]>>("/prodi/my-prodi")
        setProdis(response.data.data || [])
        setError(null)
      } catch (err: any) {
        const message = err?.response?.data?.message || "Gagal memuat daftar prodi"
        setError(message)
        console.error("Error loading prodis:", err)
        console.error("Error status:", err?.response?.status)
        console.error("Error response:", err?.response?.data)
      } finally {
        setLoading(false)
      }
    }

    loadProdis()
  }, [mounted])

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Prodi Saya</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Pilih program studi untuk melihat dashboard dan progress akreditasi</p>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12 md:py-16">
          <Loader2 className="w-6 md:w-8 h-6 md:h-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 md:p-6 flex items-center gap-2 md:gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium text-sm md:text-base">{error}</p>
              <p className="text-xs md:text-sm text-red-700 mt-1">Pastikan token Anda masih valid dan memiliki akses ke program studi</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && prodis.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="p-8 md:p-16 text-center">
            <BookOpen className="w-10 md:w-12 h-10 md:h-12 text-gray-300 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mt-2 md:mt-4">Belum ada program studi</h3>
            <p className="text-xs md:text-sm text-gray-600 mt-2">
              Anda belum ditugaskan ke program studi manapun. Hubungi administrator untuk mendapatkan akses.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prodis Grid */}
      {!loading && !error && prodis.length > 0 && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {prodis.map((prodi) => (
            <Link
              key={prodi.id}
              href={`/dashboard-prodi?prodiId=${prodi.id}`}
              className="group"
            >
              <Card className="rounded-lg md:rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 h-full">
                <CardHeader className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {prodi.fullname}
                      </CardTitle>
                      {prodi.abbreviation && (
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                          {prodi.abbreviation}
                          {prodi.degree && ` • ${prodi.degree}`}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 md:w-5 h-4 md:h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-gray-600">Status</span>
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 text-xs">
                        Aktif
                      </Badge>
                    </div>
                    <div className="pt-1 md:pt-2">
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 transition-all text-xs md:text-sm"
                      >
                        Lihat Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
