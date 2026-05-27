import { useState, useEffect, useMemo } from "react"
import apiClient from "@/lib/api-client"

export function useEvidenList(user: any) {
  const [evidenList, setEvidenList] = useState<any[]>([])
  const [accessibleProdis, setAccessibleProdis] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [filters, setFilters] = useState({
    prodi: [] as string[], periode: [] as string[], indikator: [] as string[],
    minCount: "", maxCount: "", minSizeMB: "", maxSizeMB: ""
  })

  const fetchInitialData = async () => {
    setIsFetching(true)
    try {
      const [prodiRes, evidenRes] = await Promise.all([
        apiClient.get('/prodi/my-prodi'),
        apiClient.get('/eviden')
      ])
      setAccessibleProdis(prodiRes.data.data || [])
      setEvidenList(evidenRes.data.data || [])
    } catch (error) {
      console.error("Gagal mengambil data", error)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (user) fetchInitialData()
  }, [user])

  const handleDelete = async (id: string, callback: () => void) => {
    if (!confirm("Yakin ingin menghapus dokumen eviden ini secara permanen?")) return
    setIsDeletingId(id)
    try {
      await apiClient.delete(`/eviden/${id}`)
      setEvidenList(prev => prev.filter(e => e.id !== id))
      callback()
    } catch (error: any) { alert(error?.response?.data?.message || "Gagal hapus eviden.") }
    finally { setIsDeletingId(null) }
  }

  const handleToggleStatus = async (id: string, currentStatus: string, callback: () => void) => {
    const target = currentStatus === 'DRAFT' ? 'FINAL' : 'DRAFT'
    if (!confirm(`Yakin ingin mengubah status dokumen ini menjadi ${target}?`)) return
    try {
      await apiClient.put(`/eviden/status/${id}`, { status: target })
      fetchInitialData()
      callback()
    } catch (error: any) { alert(error?.response?.data?.message || "Gagal ubah status.") }
  }

  const toggleFilterArray = (key: 'prodi' | 'periode' | 'indikator', value: string, checked: boolean) => {
    setFilters(prev => ({ ...prev, [key]: checked ? [...prev[key], value] : prev[key].filter(v => v !== value) }))
  }

  return { 
    evidenList, accessibleProdis, isFetching, isDeletingId, 
    searchQuery, setSearchQuery, sortConfig, setSortConfig, 
    filters, setFilters, toggleFilterArray, handleDelete, handleToggleStatus, fetchInitialData 
  }
}