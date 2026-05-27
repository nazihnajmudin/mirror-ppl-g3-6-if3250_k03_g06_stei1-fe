import { useState, useEffect } from "react"
import { getProdiMembers, getPenugasan, addPenugasan, deletePenugasan, getProdiById } from "@/lib/api-prodi"
import type { User } from "@/types/api.types"

export function usePenugasanData(targetProdiId: string) {
  const [prodiName, setProdiName] = useState("Program Studi")
  const [anggotaList, setAnggotaList] = useState<User[]>([])
  const [penugasanList, setPenugasanList] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedKriteria, setSelectedKriteria] = useState<string[]>([])
  const [filterAnggota, setFilterAnggota] = useState("Semua Anggota")
  
  const [showHapusDialog, setShowHapusDialog] = useState(false)
  const [penugasanToDelete, setPenugasanToDelete] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [kategoriTugas, setKategoriTugas] = useState<"LAM_TEKNIK" | "INFOKOM" | "LKPS">("LAM_TEKNIK")

  useEffect(() => {
    if (targetProdiId) {
      loadData(targetProdiId)
      fetchProdiName(targetProdiId)
    }
  }, [targetProdiId])

  const fetchProdiName = async (id: string) => {
    try {
      const res = await getProdiById(id)
      setProdiName(res.fullname)
    } catch {}
  }

  const loadData = async (id: string) => {
    try {
      const [members, assignments] = await Promise.all([
        getProdiMembers(id),
        getPenugasan(id),
      ])
      setAnggotaList(members)
      setPenugasanList(assignments)
    } catch {}
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showNotification = (message: string, type: "success" | "error") => setToast({ message, type })

  const toggleKriteria = (id: string) => {
    setSelectedKriteria((prev) => prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id])
  }

  const handleTugaskan = async () => {
    if (!selectedUserId) {
      showNotification("Pilih anggota terlebih dahulu!", "error")
      return
    }

    if (penugasanList.some((p) => p.userId === selectedUserId)) {
      showNotification("Anggota ini sudah memiliki penugasan", "error")
      return
    }

    try {
      const kriteriaWithTemplate = selectedKriteria.map(k => `${kategoriTugas}:${k}`)
      const result = await addPenugasan({ 
          userId: selectedUserId, 
          prodiId: targetProdiId,
          kriteria: kriteriaWithTemplate
      })
      setPenugasanList((prev) => [result, ...prev])
      setSelectedKriteria([])
      setSelectedUserId("")
      showNotification("Penugasan berhasil ditambahkan!", "success")
    } catch (error: any) {
      showNotification(error?.response?.data?.message || error.message || "Gagal menambah penugasan", "error")
    }
  }

  const confirmHapusPenugasan = (id: string) => {
    setPenugasanToDelete(id)
    setShowHapusDialog(true)
  }

  const executeHapusPenugasan = async () => {
    if (!penugasanToDelete) return
    try {
      await deletePenugasan(penugasanToDelete)
      setPenugasanList((prev) => prev.filter((p) => p.id !== penugasanToDelete))
      showNotification("Penugasan berhasil dihapus", "success")
    } catch (error: any) {
      showNotification(error?.response?.data?.message || "Gagal menghapus penugasan", "error")
    } finally {
      setShowHapusDialog(false)
      setPenugasanToDelete(null)
    }
  }

  return {
    prodiName, anggotaList, penugasanList, 
    selectedUserId, setSelectedUserId, selectedKriteria, setSelectedKriteria, toggleKriteria, 
    filterAnggota, setFilterAnggota, kategoriTugas, setKategoriTugas,
    showHapusDialog, setShowHapusDialog, confirmHapusPenugasan, executeHapusPenugasan, handleTugaskan, toast
  }
}