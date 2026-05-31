import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"
import { formatBytes } from "../utils/index"

export function useEvidenForm(user: any, mode: 'add' | 'edit' | 'view', evidenId: string | null, urlProdiId: string | null) {
  const router = useRouter()
  const { toast } = useToast()

  const [accessibleProdis, setAccessibleProdis] = useState<any[]>([])
  const [activeProdi, setActiveProdi] = useState<any>(null)
  const [isProdiLoading, setIsProdiLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isFetchingDetail, setIsFetchingDetail] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [kategoriKriteria, setKategoriKriteria] = useState<"LAM" | "LKPS">("LAM")

  const [formData, setFormData] = useState({
    prodiId: "", judul: "", deskripsi: "", indikator: [] as string[],
    periode: "", status: "DRAFT"
  })

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isLocked = formData.status === 'FINAL'
  const isViewOnly = mode === 'view' || user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN' || isLocked
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN'
  const canToggleLock = user?.role === 'SUPER_ADMIN' || (user?.role === 'KAPRODI' && activeProdi?.id === user?.prodiId)

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionStorage.getItem('unsavedChanges') === 'true') { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  useEffect(() => {
    const fetchProdi = async () => {
      if (!user) return
      try {
        const res = await apiClient.get('/prodi/my-prodi')
        const prodis = res.data.data || []
        setAccessibleProdis(prodis)

        if (mode === 'add') {
          const prodi = prodis.find((p: any) => p.id === urlProdiId) || prodis[0]
          if (prodi) { setActiveProdi(prodi); setFormData(prev => ({ ...prev, prodiId: prodi.id })) }
        }
      } catch (err) { console.error("Failed to fetch my prodis") } 
      finally { setIsProdiLoading(false) }
    }
    fetchProdi()
  }, [user, urlProdiId, mode])

  useEffect(() => {
    const fetchDetail = async () => {
      if (!evidenId) return
      setIsFetchingDetail(true)
      try {
        const res = await apiClient.get(`/eviden/${evidenId}`)
        const data = res.data.data

        setFormData({
          prodiId: data.prodiId, judul: data.judul, deskripsi: data.deskripsi || "",
          indikator: data.indikator || [], periode: data.periode || "", status: data.status || "DRAFT"
        })

        if (data.indikator && data.indikator.some((ind: string) => ind.startsWith('LKPS'))) {
          setKategoriKriteria("LKPS")
        }

        if (data.files && data.files.length > 0) {
          setUploadedFiles(data.files.map((f: any) => ({
            id: f.id, name: f.originalFilename, type: f.mimeType,
            size: formatBytes(f.size), isExisting: true
          })))
        }
      } catch (error) {
        alert("Gagal mengambil detail eviden."); router.push('/eviden')
      } finally { setIsFetchingDetail(false) }
    }
    if (mode !== 'add') fetchDetail()
  }, [evidenId, mode, router])

  useEffect(() => {
    if (mode !== 'add' && formData.prodiId && accessibleProdis.length > 0) {
      const matchedProdi = accessibleProdis.find(p => p.id === formData.prodiId)
      if (matchedProdi) setActiveProdi(matchedProdi)
    }
  }, [formData.prodiId, accessibleProdis, mode])

  const markAsUnsaved = () => { if (!isViewOnly) sessionStorage.setItem('unsavedChanges', 'true') }

  const handleFormChange = (key: keyof typeof formData, value: any) => {
    if (isLocked) return
    setFormData(prev => ({ ...prev, [key]: value }))
    markAsUnsaved()
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || isLocked) return
    const newFiles = Array.from(files).map(f => ({ name: f.name, type: f.type || "unknown", size: formatBytes(f.size), raw: f, isExisting: false }))
    setUploadedFiles(prev => [...prev, ...newFiles])
    markAsUnsaved()
  }

  const handleRemoveFile = (index: number) => {
    if (isLocked) return
    const fileToRemove = uploadedFiles[index]
    if (fileToRemove.isExisting && fileToRemove.id) setDeletedFileIds(prev => [...prev, fileToRemove.id])
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    markAsUnsaved()
  }

  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      const response = await apiClient.get(`/eviden/file/download/${fileId}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a'); link.href = url; link.setAttribute('download', filename); document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(url)
    } catch (error) { alert(`Gagal mengunduh file.`) }
  }

  const handleToggleStatus = async () => {
    const target = formData.status === 'DRAFT' ? 'FINAL' : 'DRAFT'
    if (!confirm(`Yakin ingin ${target === 'FINAL' ? 'mengunci' : 'membuka kunci'} dokumen eviden ini?`)) return
    try {
      await apiClient.put(`/eviden/status/${evidenId}`, { status: target })
      setFormData(prev => ({ ...prev, status: target }))
      alert(`Status berhasil diubah menjadi ${target}.`)
    } catch (error: any) { alert(error?.response?.data?.message || "Gagal mengubah status dokumen.") }
  }

  const handleSave = async () => {
    if (isLocked) return
    if (!formData.prodiId || !formData.judul || !formData.periode) { alert("Program Studi, Periode, dan Judul wajib diisi."); return }
    setIsSaving(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('prodiId', formData.prodiId)
      formDataObj.append('judul', formData.judul)
      formDataObj.append('deskripsi', formData.deskripsi)
      formDataObj.append('indikator', JSON.stringify(formData.indikator))
      formDataObj.append('periode', formData.periode)

      if (deletedFileIds.length > 0) formDataObj.append('deletedFileIds', JSON.stringify(deletedFileIds))
      uploadedFiles.forEach(f => { if (!f.isExisting && f.raw) formDataObj.append('files', f.raw) })

      if (mode === 'edit' && evidenId) await apiClient.put(`/eviden/${evidenId}`, formDataObj, { headers: { 'Content-Type': 'multipart/form-data' } })
      else await apiClient.post('/eviden', formDataObj, { headers: { 'Content-Type': 'multipart/form-data' } })

      sessionStorage.removeItem('unsavedChanges')
      toast({ title: "Berhasil", description: "Eviden berhasil disimpan!" })
      router.push(mode === 'add' && urlProdiId ? `/eviden?prodiId=${urlProdiId}` : '/eviden')
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal menyimpan", description: error?.response?.data?.message || "Terjadi kesalahan." })
    } finally { setIsSaving(false) }
  }

  const goBack = () => router.push(mode === 'add' && urlProdiId ? `/eviden?prodiId=${urlProdiId}` : '/dokumen-eviden')
  const handleCancel = () => { if (sessionStorage.getItem('unsavedChanges') === 'true') setConfirmCancelOpen(true); else goBack() }

  return {
    accessibleProdis, activeProdi, isProdiLoading, isSaving, isFetchingDetail, confirmCancelOpen, setConfirmCancelOpen,
    kategoriKriteria, setKategoriKriteria, formData, uploadedFiles, isDragging, setIsDragging, fileInputRef, isLocked, isViewOnly, isAdmin, canToggleLock,
    handleFormChange, handleFileSelect, handleRemoveFile, handleDownloadFile, handleToggleStatus, handleSave, goBack, handleCancel
  }
}