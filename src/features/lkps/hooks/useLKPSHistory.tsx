import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"
import { useLKPS } from "./useLKPS"

export function useLKPSHistory(prodiId: string) {
  const [user, setUser] = useState<any>(null)
  const [activePeriode, setActivePeriode] = useState<string>(new Date().getFullYear().toString())
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)
  const [format, setFormat] = useState<'INFOKOM' | 'TEKNIK'>('INFOKOM')
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    apiClient.get('/auth/me').then(res => setUser(res.data.data)).catch(() => {})
    if (prodiId) {
      apiClient.get(`/lkps/format/${prodiId}`).then(res => {
        if (res.data?.data?.format) {
          setFormat(res.data.data.format)
        }
      }).catch(() => {})
    }
  }, [prodiId])

  const { versions: allVersions, loading, refresh } = useLKPS(prodiId)
  const versions = allVersions.filter(v => (v.periode || new Date(v.createdAt).getFullYear().toString()) === activePeriode)

  useEffect(() => {
    const currentYear = new Date().getFullYear().toString()
    const periods = new Set<string>([currentYear])
    allVersions.forEach(v => periods.add(v.periode || new Date(v.createdAt).getFullYear().toString()))
    setAvailablePeriods(Array.from(periods).sort())
    if (!activePeriode) setActivePeriode(currentYear)
  }, [allVersions, activePeriode])

  useEffect(() => {
    if (versions.length > 0) {
      if (!activeVersionId || !versions.some(v => v.id === activeVersionId)) setActiveVersionId(versions[0].id)
    } else setActiveVersionId(null)
  }, [versions, activeVersionId])

  const activeVersion = versions.find(v => v.id === activeVersionId) || (versions.length > 0 ? versions[0] : null)

  const handleExport = async () => {
    if (!activeVersionId) return
    toast({ title: "Menyiapkan Unduhan", description: "Excel sedang digenerate..." })
    try {
      const res = await apiClient.get(`/lkps/${activeVersionId}`)
      const docContent = res.data.data.content
      const { getTableConfig } = await import('@/features/lkps/config/tableConfigs')
      const { exportToExcel } = await import('@/features/lkps/utils/exportUtils')
      const { getSheetNamesByFormat } = await import('@/features/lkps/config/lkpsFormat')
      
      const convertedData: Record<string, any[]> = {}
      const SHEETS = getSheetNamesByFormat(format)
      
      if (docContent && typeof docContent === 'object') {
        for (const sheet of SHEETS) {
          if (Array.isArray(docContent[sheet])) {
            const sheetData = docContent[sheet]
            if (sheetData.length === 0) {
              convertedData[sheet] = []
            } else if (Array.isArray(sheetData[0])) {
              convertedData[sheet] = sheetData
            } else {
              const sheetConfig = getTableConfig(sheet, format)
              convertedData[sheet] = sheetData.map((row: any) => {
                if (typeof row !== 'object' || row === null) return []
                if (sheetConfig?.columns?.length > 0) return sheetConfig.columns.map((column: any) => row[column.key] ?? '')
                return Object.keys(row).map((key) => row[key] ?? '')
              })
            }
          }
        }
      }
      
      await exportToExcel(convertedData)
      toast({ title: "Unduhan Berhasil", description: "File LKPS telah berhasil diunduh." })
    } catch (err) { toast({ variant: "destructive", title: "Unduhan Gagal", description: "Terjadi kesalahan." }) }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const target = currentStatus === 'DRAFT' ? 'FINAL' : 'DRAFT'
    if (!confirm(`Ubah status dokumen menjadi ${target}?`)) return
    try {
        await apiClient.put(`/lkps/document/status/${id}`, { status: target })
        toast({ title: "Berhasil", description: `Status dokumen diubah menjadi ${target}` })
        refresh()
    } catch (error: any) { toast({ variant: "destructive", title: "Gagal", description: error?.response?.data?.message || "Terjadi kesalahan." }) }
  }

  return {
    user, activePeriode, setActivePeriode, availablePeriods, activeVersionId, setActiveVersionId,
    versions, allVersions, activeVersion, loading, refresh, handleExport, handleToggleStatus, router, format
  }
}