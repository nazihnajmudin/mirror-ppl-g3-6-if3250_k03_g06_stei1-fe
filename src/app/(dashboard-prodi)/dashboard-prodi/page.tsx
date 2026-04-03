"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Award, Activity, Loader2, Edit2, Lock, ChevronDown, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/errors"
import apiClient from "@/lib/api-client"
import { getCurrentUser } from "@/lib/api-prodi"
import type { ApiResponse, CurrentUser, DashboardData } from "@/types/api.types"

export default function DashboardProdiPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prodiId = searchParams.get("prodiId")

  const [dashboard, setDashboard] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editMode, setEditMode] = React.useState(false)
  const [showProdiSelector, setShowProdiSelector] = React.useState(false)
  const [myProdis, setMyProdis] = React.useState<any[]>([])
  const [mounted, setMounted] = React.useState(false)
  const [selectedCriterion, setSelectedCriterion] = React.useState<any | null>(null)
  const [selectedSubItem, setSelectedSubItem] = React.useState<any | null>(null)
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    getCurrentUser().then(setCurrentUser).catch(() => {})
  }, [])

  useEffect(() => {
    if (!mounted) return
    const loadDashboard = async () => {
      if (!prodiId) {
        setError("ID Program Studi tidak diberikan")
        setLoading(false)
        return
      }
      try {
        const response = await apiClient.get<ApiResponse<DashboardData>>(`/prodi/${prodiId}/dashboard`)
        setDashboard(response.data.data || null)
        if (response.data.data?.accessInfo?.isReadOnly) setEditMode(false)
        setError(null)
      } catch (err: unknown) {
        setError(getErrorMessage(err) || "Gagal memuat dashboard prodi")
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [prodiId, mounted])

  useEffect(() => {
    if (!mounted) return
    const loadMyProdis = async () => {
      try {
        const response = await apiClient.get<ApiResponse<any[]>>("/prodi/my-prodi")
        setMyProdis(response.data.data || [])
      } catch (err: unknown) {
        console.error("Error loading prodis:", err)
      }
    }
    loadMyProdis()
  }, [mounted])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="p-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <p className="text-sm text-red-800">{error || "Data dashboard tidak ditemukan"}</p>
      </div>
    )
  }

  const getAccreditationColor = (grade: string | null) => {
    if (!grade) return "text-gray-800"
    switch (grade.toLowerCase()) {
      case "unggul": return "text-gray-900"
      case "sangat baik": return "text-blue-700"
      case "baik": return "text-yellow-700"
      default: return "text-gray-800"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-gray-900"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const canEdit = dashboard.accessInfo?.canEdit
  const isReadOnly = dashboard.accessInfo?.isReadOnly

  // Mock sub-items for criterion detail view (mimics gambar 2)
  const getCriterionSubItems = (criterion: any) => {
    // In real app, fetch from API. Here we mock based on criterion code/name.
    return [
      { id: "sub1", name: "Visi Program Studi", progress: 100 },
      { id: "sub2", name: "Misi Program Studi", progress: 100 },
      { id: "sub3", name: "Tujuan Program Studi", progress: 100 },
      { id: "sub4", name: "Strategi Program Studi", progress: 100 },
    ]
  }

  // ─── CRITERION DETAIL VIEW (Gambar 2) ───────────────────────────────────────
  if (selectedCriterion) {
    const subItems = getCriterionSubItems(selectedCriterion)

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{dashboard.prodi.fullname}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedCriterion.code} — {selectedCriterion.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-500" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                {currentUser?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-800">{currentUser?.name ?? "—"}</p>
                <p className="text-xs text-gray-400">{currentUser?.role ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <button
            onClick={() => { setSelectedCriterion(null); setSelectedSubItem(null) }}
            className="mb-4 text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
          >
            ← Kembali ke Dashboard
          </button>

          <div className="grid grid-cols-5 gap-6">
            {/* Left: Sub-item list */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Progress Pengisian per Kriteria</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {subItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSubItem(item)}
                    className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors ${
                      selectedSubItem?.id === item.id ? "bg-teal-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-xs font-semibold ${
                        selectedSubItem?.id === item.id ? "text-teal-700" : "text-gray-800"
                      }`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          selectedSubItem?.id === item.id ? "bg-teal-500" : getProgressColor(item.progress)
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Document detail */}
            <div className="col-span-3 space-y-4">
              {selectedSubItem ? (
                <>
                  {/* Progress bar header */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-800">{selectedSubItem.name}</span>
                      <span className="text-sm font-bold text-gray-700">{selectedSubItem.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gray-900"
                        style={{ width: `${selectedSubItem.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Document content */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Isi Dokumen</h3>
                    <p className="text-xs text-gray-400 italic">
                      {selectedSubItem.name} dari program studi ini adalah ...
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-8 text-center">
                  <p className="text-sm text-gray-400">Pilih sub-kriteria untuk melihat detail dokumen</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── MAIN DASHBOARD VIEW (Gambar 1) ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{dashboard.prodi.fullname}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Ringkasan progres kesiapan akreditasi program studi</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Multi-Prodi Selector */}
          {myProdis.length > 1 && (
            <div className="relative">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowProdiSelector(!showProdiSelector)}>
                Pilih Prodi <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              {showProdiSelector && (
                <div className="absolute z-10 top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
                  {myProdis.map((prodi) => (
                    <button
                      key={prodi.id}
                      onClick={() => { router.push(`/dashboard-prodi?prodiId=${prodi.id}`); setShowProdiSelector(false) }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0 text-xs ${prodi.id === dashboard.prodi.id ? "bg-blue-50 text-blue-700 font-semibold" : ""}`}
                    >
                      {prodi.fullname}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {canEdit && (
            <Button variant={editMode ? "default" : "outline"} size="sm" onClick={() => setEditMode(!editMode)} className="text-xs">
              <Edit2 className="w-3 h-3 mr-1" />{editMode ? "Done" : "Edit"}
            </Button>
          )}
          {isReadOnly && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-100 rounded-lg">
              <Lock className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-gray-600">Read Only</span>
            </div>
          )}
          <Bell className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">M</div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-800">Michael</p>
              <p className="text-xs text-gray-400">Pimpinan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ── Status Cards ── */}
        <div className="grid grid-cols-4 gap-4">
          {/* Status Akreditasi */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Status Akreditasi</p>
            </div>
            <div className="px-5 py-4">
              <p className={`text-2xl font-bold ${getAccreditationColor(dashboard.accreditation.grade)}`}>
                {dashboard.accreditation.grade || "Belum"}
              </p>
            </div>
          </div>

          {/* Progress LKPS */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Progress LKPS</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-2xl font-bold text-gray-900">{dashboard.documents.lkps.progress}%</p>
            </div>
          </div>

          {/* Progress LED */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Progress LED</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-2xl font-bold text-gray-900">{dashboard.documents.led.progress}%</p>
            </div>
          </div>

          {/* Skor Simulasi */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Skor Simulasi</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-2xl font-bold text-gray-900">{dashboard.simulationScore}</p>
            </div>
          </div>
        </div>

        {/* ── Main Content: Progress + Sidebar ── */}
        <div className="grid grid-cols-5 gap-5">
          {/* Left col: Progress per Kriteria */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Progress Pengisian per Kriteria</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              {dashboard.criteria.map((criterion) => (
                <button
                  key={criterion.id}
                  onClick={() => { setSelectedCriterion(criterion); setSelectedSubItem(null) }}
                  className="w-full text-left group"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {criterion.code} — {criterion.name}
                    </span>
                    <span className="text-xs font-bold text-gray-600 ml-2 flex-shrink-0">{criterion.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 group-hover:bg-gray-300 transition-colors">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(criterion.progress)} group-hover:opacity-90 transition-opacity`}
                      style={{ width: `${criterion.progress}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right col: Indikator Kritis + Aktivitas Terbaru */}
          <div className="col-span-2 space-y-4">
            {/* Indikator Kritis */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <h2 className="text-sm font-bold text-gray-900">Indikator Kritis</h2>
              </div>
              <div className="px-5 py-4">
                {dashboard.criticalIndicators.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-3">Saat ini tidak ada indikator kritis</p>
                ) : (
                  <div className="space-y-2">
                    {dashboard.criticalIndicators.map((indicator) => (
                      <div key={indicator.id} className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-red-900">{indicator.name}</p>
                          <p className="text-xs text-red-700 mt-0.5">Status: {indicator.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Aktivitas Terbaru */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Aktivitas Terbaru</h2>
              </div>
              <div className="px-5 py-2">
                {dashboard.recentActivities.length === 0 ? (
                  <div className="text-center py-6">
                    <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Belum ada aktivitas</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {dashboard.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 py-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">
                            {activity.user.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-gray-900 truncate">{activity.user}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                              {new Date(activity.timestamp).toLocaleDateString("id-ID", {
                                hour: "2-digit", minute: "2-digit"
                              })}
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{activity.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}