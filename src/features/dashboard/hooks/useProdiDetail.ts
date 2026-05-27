import { useState, useEffect, useCallback, useMemo } from "react"
import apiClient from "@/lib/api-client"
import { getErrorMessage } from "@/lib/errors"
import type { ApiResponse, DashboardData } from "@/types/api.types"

const TEMPLATE_PLACEHOLDERS_MEMO = [
  'diisi oleh pengusul', 'penjelasan disampaikan oleh pengusul',
  'data dan analisis disampaikan oleh pengusul', 'bagian ini berisi',
  'bagian ini menjelaskan', 'bagian ini memuat'
]

const LAM_TEKNIK_SUBS_MEMO = [
  { id: 'latar_belakang', name: 'Latar Belakang' },
  { id: 'kebijakan', name: 'Kebijakan' },
  { id: 'iku', name: 'Indikator Kinerja Utama' },
  { id: 'analisis', name: 'Analisis Faktor' },
  { id: 'strategi', name: 'Strategi Perbaikan (SWOT)' }
]

const LAM_INFOKOM_SUBS_MEMO = [
  { id: 'penetapan', name: 'Penetapan' },
  { id: 'pelaksanaan', name: 'Pelaksanaan' },
  { id: 'evaluasi', name: 'Evaluasi' },
  { id: 'pengendalian', name: 'Pengendalian' },
  { id: 'peningkatan', name: 'Peningkatan' }
]

const TEKNIK_CRITERIA_MEMO = [
  { id: 'c1', code: 'C.1', name: 'Visi, Misi, Tujuan, dan Strategi', subs: LAM_TEKNIK_SUBS_MEMO },
  { id: 'c2', code: 'C.2', name: 'Tata Pamong, Tata Kelola, dan Kerja Sama', subs: LAM_TEKNIK_SUBS_MEMO },
  { id: 'c3', code: 'C.3', name: 'Relevansi Pendidikan, Penelitian, dan PkM', subs: LAM_TEKNIK_SUBS_MEMO },
  { id: 'c4', code: 'C.4', name: 'Sumber Daya Manusia', subs: LAM_TEKNIK_SUBS_MEMO },
  { id: 'c5', code: 'C.5', name: 'Sarana, Prasarana, dan K3L', subs: LAM_TEKNIK_SUBS_MEMO },
  { id: 'c6', code: 'C.6', name: 'Mahasiswa dan Luaran Mahasiswa', subs: LAM_TEKNIK_SUBS_MEMO },
  { id: 'c7', code: 'C.7', name: 'Sistem Penjaminan Mutu', subs: LAM_TEKNIK_SUBS_MEMO }
]

const INFOKOM_CRITERIA_MEMO = [
  { id: 'c1', code: 'C.1', name: 'Budaya Mutu', subs: LAM_INFOKOM_SUBS_MEMO },
  { id: 'c2', code: 'C.2', name: 'Relevansi Pendidikan', subs: LAM_INFOKOM_SUBS_MEMO },
  { id: 'c3', code: 'C.3', name: 'Relevansi Penelitian', subs: LAM_INFOKOM_SUBS_MEMO },
  { id: 'c4', code: 'C.4', name: 'Relevansi Pengabdian kepada Masyarakat', subs: LAM_INFOKOM_SUBS_MEMO },
  { id: 'c5', code: 'C.5', name: 'Akuntabilitas', subs: LAM_INFOKOM_SUBS_MEMO },
  { id: 'c6', code: 'C.6', name: 'Diferensiasi Misi', subs: LAM_INFOKOM_SUBS_MEMO }
]

const LKPS_CRITERIA_MEMO = [
  { id: '1', code: 'C.1', name: 'Visi Misi Tujuan Strategi', subs: [{ id: '1', name: 'Visi Misi Tujuan Strategi PT dan UPPS' }] },
  { id: '2', code: 'C.2', name: 'Tata Pamong, Tata Kelola, dan Kerjasama', subs: [{ id: '2a1', name: 'Kerjasama Pendidikan' }, { id: '2a2', name: 'Kerjasama Penelitian' }, { id: '2a3', name: 'Kerjasama Pengabdian Masyarakat' }, { id: '2b', name: 'Penggunaan Dana' }] },
  { id: '3', code: 'C.3', name: 'Relevansi Pendidikan dan Penelitian/PkM', subs: [{ id: '3a1', name: 'Kurikulum dan Rencana Pembelajaran' }, { id: '3a2', name: 'Mata Kuliah Pembelajaran (PSPPI)' }, { id: '3a3', name: 'Integrasi Penelitian/PkM dalam Pembelajaran' }, { id: '3a4', name: 'Basic Science dan Matematika' }, { id: '3a5', name: 'Capstone Design' }, { id: '3b', name: 'Penelitian DTPS' }, { id: '3c', name: 'PkM DTPS' }] },
  { id: '4', code: 'C.4', name: 'Sumber Daya Manusia', subs: [{ id: '4a', name: 'Profil Dosen' }, { id: '4b', name: 'Tenaga Kependidikan' }, { id: '4c', name: 'Beban Kerja Dosen Tetap' }, { id: '4d', name: 'Publikasi Ilmiah DTPS' }, { id: '4e', name: 'Publikasi DTPS (Vokasi)' }, { id: '4f-1', name: 'HKI Paten' }, { id: '4f-2', name: 'HKI Hak Cipta' }, { id: '4f-3', name: 'Teknologi Tepat Guna (TTG)' }, { id: '4f-4', name: 'Buku ISBN' }, { id: '4g', name: 'Produk/Jasa DTPS' }, { id: '4h', name: 'Kinerja DTPS' }, { id: '4i', name: 'Karya Ilmiah Disitasi' }, { id: '4j', name: 'Pengakuan DTPS' }, { id: '4k', name: 'Pembimbing Lapangan (PSPPI)' }] },
  { id: '5', code: 'C.5', name: 'Sarana dan Prasarana', subs: [{ id: '5a', name: 'Prasarana dan Peralatan' }, { id: '5b', name: 'Dokumen K3L' }, { id: '5c', name: 'Fasilitas K3L' }] },
  { id: '6', code: 'C.6', name: 'Mahasiswa dan Luaran Mahasiswa', subs: [{ id: '6a', name: 'Jumlah Mahasiswa' }, { id: '6b', name: 'IPK Lulusan' }, { id: '6c1', name: 'Prestasi Akademik' }, { id: '6c2', name: 'Prestasi Non-akademik' }, { id: '6d', name: 'Masa Studi Lulusan' }, { id: '6e1', name: 'Publikasi Mahasiswa' }, { id: '6e2', name: 'Publikasi Mahasiswa (Vokasi)' }, { id: '6e3-1', name: 'HKI Mahasiswa Paten' }, { id: '6e3-2', name: 'HKI Mahasiswa Hak Cipta' }, { id: '6e3-3', name: 'TTG Mahasiswa' }, { id: '6e3-4', name: 'Buku ISBN Mahasiswa' }, { id: '6e4', name: 'Produk/Jasa Mahasiswa' }, { id: '6f1', name: 'Waktu Tunggu Lulusan' }, { id: '6f2', name: 'Kesesuaian Bidang Kerja' }, { id: '6g1', name: 'Tempat Kerja Lulusan' }, { id: '6g2', name: 'Kepuasan Pengguna' }, { id: '6h1', name: 'Penelitian DTPS + Mahasiswa' }, { id: '6h2', name: 'Penelitian Rujukan Tesis' }, { id: '6i', name: 'PkM DTPS + Mahasiswa' }] },
  { id: '7', code: 'C.7', name: 'Sistem Penjaminan Mutu', subs: [{ id: '7a', name: 'Dokumen SPMI' }, { id: '7b', name: 'Pelaksanaan SPMI' }] },
]

const isFilledSectionMemo = (html: string | undefined): boolean => {
  if (!html) return false
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (text.length < 200) return false
  const lower = text.toLowerCase()
  return !TEMPLATE_PLACEHOLDERS_MEMO.some(p => lower.includes(p))
}

export function useProdiDetail(prodiId: string | null) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [myProdis, setMyProdis] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  
  const [selectedCriterion, setSelectedCriterion] = useState<any | null>(null)
  const [selectedSubItem, setSelectedSubItem] = useState<any | null>(null)
  const [formContent, setFormContent] = useState<Record<string, string>>({})
  const [formContentLoading, setFormContentLoading] = useState(false)

  const [lkpsProgressData, setLkpsProgressData] = useState<Record<string, number>>({})
  const [lkpsProgressLoading, setLkpsProgressLoading] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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

  const isInfokomForMemo = useMemo(() => {
    if (!dashboard?.prodi) return false
    const abbr = dashboard.prodi.abbreviation?.toUpperCase() || ""
    const name = dashboard.prodi.fullname?.toUpperCase() || ""
    return ["IF", "II", "STI", "MI", "MSTI"].includes(abbr) ||
           name.includes("INFORMATIKA") ||
           name.includes("SISTEM DAN TEKNOLOGI INFORMASI")
  }, [dashboard])

  const refreshFormContent = useCallback(async () => {
    if (!prodiId || !dashboard) return
    setFormContentLoading(true)
    const year = new Date().getFullYear().toString()
    const tmpl = isInfokomForMemo ? 'INFOKOM' : 'LAM_TEKNIK'
    
    try {
      const res = await apiClient.get(`/led/form/history/${prodiId}/${year}?template=${tmpl}`)
      const latest = res.data.data?.[0]
      if (!latest?.id) {
        setFormContentLoading(false)
        return
      }
      const vRes = await apiClient.get(`/led/form/${latest.id}`)
      const raw = vRes.data.data?.content
      const parsed: Record<string, string> = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? {})
      setFormContent(parsed)
    } catch { 
      // silently fail
    } finally { 
      setFormContentLoading(false) 
    }
  }, [prodiId, dashboard, isInfokomForMemo])

  const refreshLkpsProgress = useCallback(async () => {
    if (!prodiId) return
    setLkpsProgressLoading(true)
    try {
      // Endpoint API LKPS Progress di-hit di sini
      const res = await apiClient.get(`/lkps/${prodiId}/progress`)
      setLkpsProgressData(res.data.data || {})
    } catch { 
      setLkpsProgressData({})
    } finally { 
      setLkpsProgressLoading(false) 
    }
  }, [prodiId])

  useEffect(() => {
    if (!prodiId || !mounted || !dashboard) return
    refreshFormContent()
    refreshLkpsProgress()
  }, [prodiId, mounted, dashboard, refreshFormContent, refreshLkpsProgress])

  useEffect(() => {
    const onFocus = () => { refreshFormContent() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshFormContent])

  const criteriaListForMemo = isInfokomForMemo ? INFOKOM_CRITERIA_MEMO : TEKNIK_CRITERIA_MEMO
  
  const computedCriteria = useMemo(() => {
    return criteriaListForMemo.map(c => {
      const subItems = c.subs.map(sub => ({
        id: sub.id, name: sub.name,
        filled: isFilledSectionMemo(formContent[`${c.id}_${sub.id}`]),
      }))
      const filled = subItems.filter(s => s.filled).length
      return { ...c, progress: c.subs.length > 0 ? Math.round((filled / c.subs.length) * 100) : 0, subsections: subItems }
    })
  }, [formContent, isInfokomForMemo, criteriaListForMemo])

  const computedLkpsCriteria = useMemo(() => {
    return LKPS_CRITERIA_MEMO.map(c => {
      const subItems = c.subs.map(sub => ({
        ...sub,
        progress: lkpsProgressData[sub.id] || 0
      }))
      const totalProgress = subItems.reduce((acc, curr) => acc + curr.progress, 0)
      const avgProgress = subItems.length > 0 ? Math.round(totalProgress / subItems.length) : 0
      return { ...c, progress: avgProgress, subsections: subItems }
    })
  }, [lkpsProgressData])

  const getCriterionSubItems = (criterion: any): Array<{ id: string; name: string; progress: number; filled: boolean }> => {
    const found = computedCriteria.find(c => c.id === criterion.id)
    if (found) return found.subsections.map(s => ({ ...s, progress: s.filled ? 100 : 0 }))
    const subs = isInfokomForMemo ? LAM_INFOKOM_SUBS_MEMO : LAM_TEKNIK_SUBS_MEMO
    return subs.map(sub => {
      const filled = isFilledSectionMemo(formContent[`${criterion.id}_${sub.id}`])
      return { id: sub.id, name: sub.name, progress: filled ? 100 : 0, filled }
    })
  }

  return {
    dashboard, loading, error, editMode, setEditMode, 
    myProdis, formContentLoading, isInfokom: isInfokomForMemo,
    selectedCriterion, setSelectedCriterion,
    selectedSubItem, setSelectedSubItem,
    computedCriteria, getCriterionSubItems,
    computedLkpsCriteria, lkpsProgressLoading
  }
}