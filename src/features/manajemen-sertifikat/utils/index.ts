import type { Prodi, AccreditationInfo } from "@/types/api.types"

export interface ProdiWithAccreditation extends Omit<Prodi, 'accreditation'> {
  accreditation: AccreditationInfo | null
}

export type AccreditationStatus = "Aktif" | "Segera Habis" | "Kedaluwarsa" | "Belum Diatur"

export function getStatus(endDate?: string | null): AccreditationStatus {
  if (!endDate) return "Belum Diatur"
  const end = new Date(endDate)
  const now = new Date()
  if (end < now) return "Kedaluwarsa"
  const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diff <= 90) return "Segera Habis"
  return "Aktif"
}

export function formatDate(iso?: string | null) {
  if (!iso) return "-"
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

export function toInputDate(iso?: string | null) {
  if (!iso) return ""
  return new Date(iso).toISOString().slice(0, 10)
}