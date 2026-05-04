"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Award, Activity, Loader2, Edit2, Lock, ChevronDown, Bell, CheckCircle2, Clock, PenLine } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/errors"
import apiClient from "@/lib/api-client"
import { getCurrentUser } from "@/lib/api-prodi"
import { NotificationBell } from "@/components/NotificationBell"
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
  const [formContent, setFormContent] = React.useState<Record<string, string>>({})
  const [formContentLoading, setFormContentLoading] = React.useState(false)
  const [selectedTemplate, setSelectedTemplate] = React.useState<'lam-teknik' | 'lam-infokom' | null>(null)

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
    if (!dashboard || selectedTemplate !== null) return
    setSelectedTemplate(dashboard.lamTemplate === 'INFOKOM' ? 'lam-infokom' : 'lam-teknik')
  }, [dashboard, selectedTemplate])

  useEffect(() => {
    if (!prodiId || !mounted || !selectedTemplate) return
    setFormContentLoading(true)
    setFormContent({})
    const year = new Date().getFullYear().toString()
    const tmpl = selectedTemplate === 'lam-infokom' ? 'INFOKOM' : 'LAM_TEKNIK'
    const fetchContent = async () => {
      try {
        const res = await apiClient.get(`/led/form/history/${prodiId}/${year}?template=${tmpl}`)
        const latest = res.data.data?.[0]
        if (!latest?.id) return
        const versionRes = await apiClient.get(`/led/form/${latest.id}`)
        const raw = versionRes.data.data?.content
        const parsed: Record<string, string> = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? {})
        setFormContent(parsed)
      } catch { /* silently fail */ } finally {
        setFormContentLoading(false)
      }
    }
    fetchContent()
  }, [prodiId, mounted, selectedTemplate])

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

  const refreshFormContent = React.useCallback(async () => {
    if (!prodiId || !selectedTemplate) return
    setFormContentLoading(true)
    const year = new Date().getFullYear().toString()
    const tmpl = selectedTemplate === 'lam-infokom' ? 'INFOKOM' : 'LAM_TEKNIK'
    try {
      const res = await apiClient.get(`/led/form/history/${prodiId}/${year}?template=${tmpl}`)
      const latest = res.data.data?.[0]
      if (!latest?.id) return
      const vRes = await apiClient.get(`/led/form/${latest.id}`)
      const raw = vRes.data.data?.content
      const parsed: Record<string, string> = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? {})
      setFormContent(parsed)
    } catch { /* silently fail */ } finally { setFormContentLoading(false) }
  }, [prodiId, selectedTemplate])

  useEffect(() => {
    const onFocus = () => { refreshFormContent() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshFormContent])

  const isInfokomForMemo = selectedTemplate === 'lam-infokom'
  const LAM_TEKNIK_SUBS_MEMO = [
    { id: 'latar_belakang', name: 'Latar Belakang' },
    { id: 'kebijakan',      name: 'Kebijakan' },
    { id: 'iku',            name: 'Indikator Kinerja Utama' },
    { id: 'analisis',       name: 'Analisis Faktor' },
    { id: 'strategi',       name: 'Strategi Perbaikan (SWOT)' },
  ]
  const LAM_INFOKOM_SUBS_MEMO = [
    { id: 'penetapan',    name: 'Penetapan' },
    { id: 'pelaksanaan',  name: 'Pelaksanaan' },
    { id: 'evaluasi',     name: 'Evaluasi' },
    { id: 'pengendalian', name: 'Pengendalian' },
    { id: 'peningkatan',  name: 'Peningkatan' },
  ]
  const TEKNIK_CRITERIA_MEMO = [
    { id: 'c1', code: 'C.1', name: 'Visi, Misi, Tujuan, dan Strategi',           subs: LAM_TEKNIK_SUBS_MEMO },
    { id: 'c2', code: 'C.2', name: 'Tata Pamong, Tata Kelola, dan Kerja Sama',   subs: LAM_TEKNIK_SUBS_MEMO },
    { id: 'c3', code: 'C.3', name: 'Relevansi Pendidikan, Penelitian, dan PkM',  subs: LAM_TEKNIK_SUBS_MEMO },
    { id: 'c4', code: 'C.4', name: 'Sumber Daya Manusia',                         subs: LAM_TEKNIK_SUBS_MEMO },
    { id: 'c5', code: 'C.5', name: 'Sarana, Prasarana, dan K3L',                 subs: LAM_TEKNIK_SUBS_MEMO },
    { id: 'c6', code: 'C.6', name: 'Mahasiswa dan Luaran Mahasiswa',              subs: LAM_TEKNIK_SUBS_MEMO },
    { id: 'c7', code: 'C.7', name: 'Sistem Penjaminan Mutu',                      subs: LAM_TEKNIK_SUBS_MEMO },
  ]
  const INFOKOM_CRITERIA_MEMO = [
    { id: 'c1', code: 'C.1', name: 'Budaya Mutu',                              subs: LAM_INFOKOM_SUBS_MEMO },
    { id: 'c2', code: 'C.2', name: 'Relevansi Pendidikan',                     subs: LAM_INFOKOM_SUBS_MEMO },
    { id: 'c3', code: 'C.3', name: 'Relevansi Penelitian',                     subs: LAM_INFOKOM_SUBS_MEMO },
    { id: 'c4', code: 'C.4', name: 'Relevansi Pengabdian kepada Masyarakat',  subs: LAM_INFOKOM_SUBS_MEMO },
    { id: 'c5', code: 'C.5', name: 'Akuntabilitas',                            subs: LAM_INFOKOM_SUBS_MEMO },
    { id: 'c6', code: 'C.6', name: 'Diferensiasi Misi',                        subs: LAM_INFOKOM_SUBS_MEMO },
  ]

  const TEMPLATE_PLACEHOLDERS_MEMO = [
    'diisi oleh pengusul',
    'penjelasan disampaikan oleh pengusul',
    'data dan analisis disampaikan oleh pengusul',
    'bagian ini berisi',
    'bagian ini menjelaskan',
    'bagian ini memuat',
  ]
  const isFilledSectionMemo = (html: string | undefined): boolean => {
    if (!html) return false
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    if (text.length < 200) return false
    const lower = text.toLowerCase()
    return !TEMPLATE_PLACEHOLDERS_MEMO.some(p => lower.includes(p))
  }

  const criteriaListForMemo = isInfokomForMemo ? INFOKOM_CRITERIA_MEMO : TEKNIK_CRITERIA_MEMO
  const computedCriteria = React.useMemo(() => {
    return criteriaListForMemo.map(c => {
      const subItems = c.subs.map(sub => ({
        id: sub.id, name: sub.name,
        filled: isFilledSectionMemo(formContent[`${c.id}_${sub.id}`]),
      }))
      const filled = subItems.filter(s => s.filled).length
      return { ...c, progress: c.subs.length > 0 ? Math.round((filled / c.subs.length) * 100) : 0, subsections: subItems }
    })
  }, [formContent, isInfokomForMemo])

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
  const isInfokom = isInfokomForMemo

  const getCriterionSubItems = (criterion: any): Array<{ id: string; name: string; progress: number; filled: boolean }> => {
    const found = computedCriteria.find(c => c.id === criterion.id)
    if (found) return found.subsections.map(s => ({ ...s, progress: s.filled ? 100 : 0 }))
    const subs = isInfokom ? LAM_INFOKOM_SUBS_MEMO : LAM_TEKNIK_SUBS_MEMO
    return subs.map(sub => {
      const filled = isFilledSectionMemo(formContent[`${criterion.id}_${sub.id}`])
      return { id: sub.id, name: sub.name, progress: filled ? 100 : 0, filled }
    })
  }

  // ─── CRITERION DETAIL VIEW (Gambar 2) ───────────────────────────────────────
  if (selectedCriterion) {
    const subItems = getCriterionSubItems(selectedCriterion)

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">{dashboard.prodi.fullname}</h1>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                dashboard.lamTemplate === "INFOKOM"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {dashboard.lamTemplate === "INFOKOM" ? "LAM Infokom" : "LAM Teknik"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedCriterion.code} — {selectedCriterion.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
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
                <h2 className="text-sm font-bold text-gray-900">Sub-kriteria: {selectedCriterion.code}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedCriterion.name}</p>
              </div>
              <div className="divide-y divide-gray-100">
                {formContentLoading ? (
                  <div className="p-5 text-center text-xs text-gray-400 animate-pulse">Memuat data...</div>
                ) : subItems.length === 0 ? (
                  <div className="p-5 text-center text-xs text-gray-400">Tidak ada sub-kriteria.</div>
                ) : subItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSubItem(item)}
                    className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors ${
                      selectedSubItem?.id === item.id ? "bg-teal-50 border-l-4 border-l-teal-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {item.filled
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        : <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                      <span className={`text-xs font-semibold flex-1 ${
                        selectedSubItem?.id === item.id ? "text-teal-700" : "text-gray-800"
                      }`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          item.filled ? "bg-green-500" : "bg-gray-200"
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
                      <span className="text-sm font-semibold text-gray-800">
                        {selectedCriterion.code} · {selectedSubItem.name}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        selectedSubItem.filled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {selectedSubItem.filled ? "Sudah Diisi" : "Belum Diisi"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          selectedSubItem.filled ? "bg-green-500" : "bg-gray-200"
                        }`}
                        style={{ width: `${selectedSubItem.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Content preview or CTA */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-gray-900">Isi Dokumen</h3>
                      <button
                        onClick={() => router.push(
                          `/led/form?prodiId=${prodiId}&template=${isInfokom ? 'lam-infokom' : 'lam-teknik'}`
                        )}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        <PenLine className="w-3 h-3" /> Edit di Form
                      </button>
                    </div>
                    {selectedSubItem.filled && formContent[`${selectedCriterion.id}_${selectedSubItem.id}`] ? (
                      <div
                        className="text-xs text-gray-700 leading-relaxed max-h-48 overflow-y-auto prose prose-xs"
                        dangerouslySetInnerHTML={{
                          __html: formContent[`${selectedCriterion.id}_${selectedSubItem.id}`]
                        }}
                      />
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-xs text-gray-400 mb-3">Bagian ini belum diisi.</p>
                        <Button
                          size="sm"
                          onClick={() => router.push(
                            `/led/form?prodiId=${prodiId}&template=${isInfokom ? 'lam-infokom' : 'lam-teknik'}`
                          )}
                          className="text-xs"
                        >
                          <PenLine className="w-3 h-3 mr-1" /> Isi Sekarang
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-8 text-center">
                  <p className="text-sm text-gray-400">Pilih sub-kriteria untuk melihat detail dan status pengisian</p>
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
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">{dashboard.prodi.fullname}</h1>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isInfokom
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {isInfokom ? "LAM Infokom" : "LAM Teknik"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Ringkasan progres kesiapan akreditasi program studi</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Template Selector */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
            <button
              onClick={() => setSelectedTemplate('lam-teknik')}
              className={`px-3 py-1.5 transition-colors ${
                !isInfokom ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >LAM Teknik</button>
            <button
              onClick={() => setSelectedTemplate('lam-infokom')}
              className={`px-3 py-1.5 border-l border-gray-200 transition-colors ${
                isInfokom ? "bg-purple-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >LAM INFOKOM</button>
          </div>
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
          <NotificationBell />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              {currentUser?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-800">{currentUser?.name ?? "—"}</p>
              <p className="text-xs text-gray-400">{currentUser?.role ?? "—"}</p>
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
              {dashboard.accreditation.endDate && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Berlaku s.d. {new Date(dashboard.accreditation.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
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

          {/* Progress LED — dihitung dari rata-rata progress pengisian form criteria */}
          {(() => {
            const criteriaArr = dashboard.criteria ?? []
            const ledFormProgress = criteriaArr.length > 0
              ? Math.round(criteriaArr.reduce((acc: number, c: any) => acc + c.progress, 0) / criteriaArr.length)
              : dashboard.documents.led.progress
            return (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Progress LED</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-2xl font-bold text-gray-900">{ledFormProgress}%</p>
                  <p className="text-[10px] text-gray-400 mt-1">Pengisian formulir</p>
                </div>
              </div>
            )
          })()}

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
              {formContentLoading ? (
                <p className="text-xs text-gray-400 text-center py-6">Memuat data progress...</p>
              ) : (
                computedCriteria.map((criterion) => (
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
                ))
              )}
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