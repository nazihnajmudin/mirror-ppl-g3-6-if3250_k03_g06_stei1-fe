import { useState, useEffect } from "react"
import { getProdiById, getAccreditation, updateProdi, upsertAccreditation, addProdiMember, getProdiMembers, getPenugasan, isLocalCertificate } from "@/lib/api-prodi"
import type { ProdiData, TimProdiMember } from "../utils"
import { makeInitials } from "../utils"

export function useProdiDetailData(targetProdiId: string) {
  const [activeTab, setActiveTab] = useState<"informasi" | "tim">("informasi")
  const [prodiData, setProdiData] = useState<ProdiData>({
    fullname: "", akreditasi: "", degree: "", endDate: "", namaKaprodi: "",
    visi: "", misi: [], skorAkreditasi: 0, targetSkor: 0, certificateUrl: "",
  })
  const [timProdi, setTimProdi] = useState<TimProdiMember[]>([])
  const [penugasanList, setPenugasanList] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [editForm, setEditForm] = useState<ProdiData>(prodiData)
  const [misiText, setMisiText] = useState("")
  const [showSertifikat, setShowSertifikat] = useState(false)
  const [showTambahAnggota, setShowTambahAnggota] = useState(false)
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  
  const [newNama, setNewNama] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState("TIM_PRODI")
  const [newIsActive, setNewIsActive] = useState(true)
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; general?: string }>({})

  useEffect(() => {
    if (targetProdiId) {
      setError(null)
      setIsLoadingData(true)
      Promise.all([
        loadProdiData(targetProdiId), 
        loadTimProdi(targetProdiId),
        loadPenugasan(targetProdiId)
      ]).finally(() => setIsLoadingData(false))
    }
  }, [targetProdiId])

  const loadProdiData = async (id: string) => {
    try {
      const prodi = await getProdiById(id)
      const accreditation = await getAccreditation(id)
      setProdiData((prev) => ({
        ...prev,
        fullname: prodi.fullname,
        degree: prodi.degree ?? "",
        akreditasi: accreditation?.grade ?? "",
        endDate: accreditation?.endDate ? new Date(accreditation.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "",
        certificateUrl: accreditation?.certificateUrl ?? "",
      }))
    } catch (err: any) {
      setError("Gagal memuat data program studi. Pastikan Anda memiliki akses.")
    }
  }

  const loadTimProdi = async (id: string) => {
    try {
      const members = await getProdiMembers(id)
      setTimProdi(members.map((m) => ({
        id: m.id, name: m.name, email: m.email, role: m.role,
        indikator: [], isActive: m.isActive !== false, initials: makeInitials(m.name),
      })))
    } catch (err: any) {
      console.error("Gagal memuat tim prodi:", err)
    }
  }

  const loadPenugasan = async (id: string) => {
    try {
      const assignments = await getPenugasan(id)
      setPenugasanList(assignments || [])
    } catch (err) {
      console.error("Gagal memuat data penugasan:", err)
    }
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showNotification = (message: string, type: "success" | "error") => {
    setToast({ message, type })
  }

  const openEditProfil = () => {
    setEditForm(prodiData)
    setMisiText(prodiData.misi.join("\n"))
    setIsEditing(true)
  }

  const handleSimpanProfil = async () => {
    try {
      await updateProdi(targetProdiId, { fullname: editForm.fullname, degree: editForm.degree })
      if (editForm.akreditasi || (editForm.certificateUrl && !isLocalCertificate(editForm.certificateUrl))) {
        await upsertAccreditation(targetProdiId, {
          grade: editForm.akreditasi,
          certificateUrl: isLocalCertificate(editForm.certificateUrl) ? undefined : editForm.certificateUrl,
        })
      }
      setProdiData({
        ...editForm,
        misi: misiText.split("\n").map((s) => s.trim()).filter(Boolean),
      })
      setIsEditing(false)
      showNotification("Profil berhasil diperbarui", "success")
    } catch (error: any) {
      showNotification(error?.response?.data?.message || "Gagal menyimpan profil", "error")
    }
  }

  const handleBatalEdit = () => setIsEditing(false)

  const openTambahAnggota = () => {
    setNewNama("")
    setNewEmail("")
    setNewRole("TIM_PRODI")
    setNewIsActive(true)
    setFormErrors({})
    setShowTambahAnggota(true)
  }

  const handleTambahAnggota = async () => {
    if (!newNama.trim() || !newEmail.trim()) {
      setFormErrors({ general: "Nama dan Email wajib diisi" })
      return
    }
    setFormErrors({})
    try {
      const savedUser = await addProdiMember({
        name: newNama.trim(), email: newEmail.trim(), role: newRole,
        password: "password123", prodiId: targetProdiId,
      })
      const savedName = savedUser.name || newNama
      setTimProdi((prev) => [
        ...prev,
        { id: savedUser.id, name: savedName, email: savedUser.email, role: savedUser.role,
          indikator: [], isActive: true, initials: makeInitials(savedName) }
      ])
      setShowTambahAnggota(false)
      showNotification("Berhasil menambahkan anggota baru!", "success")
    } catch (error: any) {
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const newErrors: Record<string, string> = {}
        error.response.data.details.forEach((e: any) => { if (e.field) newErrors[e.field] = e.message })
        setFormErrors(newErrors)
      } else {
        setFormErrors({ general: error.response?.data?.message || error.message })
      }
      showNotification("Gagal menambahkan anggota", "error")
    }
  }

  return {
    activeTab, setActiveTab, prodiData, timProdi, penugasanList, isEditing, isLoadingData, error,
    editForm, setEditForm, misiText, setMisiText, showSertifikat, setShowSertifikat, showTambahAnggota, setShowTambahAnggota,
    toast, newNama, setNewNama, newEmail, setNewEmail, newRole, setNewRole, newIsActive, setNewIsActive, formErrors, setFormErrors,
    openEditProfil, handleSimpanProfil, handleBatalEdit, openTambahAnggota, handleTambahAnggota
  }
}