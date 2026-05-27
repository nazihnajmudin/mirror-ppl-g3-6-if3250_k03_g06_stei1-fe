import React from "react"
import { FileText, Image as ImageIcon, FileSpreadsheet, FileArchive, Music, Video, MonitorPlay } from "lucide-react"

export const KRITERIA_LAM_TEKNIK = [
  { id: "C1", label: "Visi, Misi, Tujuan, dan Strategi" },
  { id: "C2", label: "Tata Pamong, Tata Kelola, dan Kerja Sama" },
  { id: "C3", label: "Relevansi Pendidikan, Penelitian, dan PkM" },
  { id: "C4", label: "Sumber Daya Manusia" },
  { id: "C5", label: "Sarana, Prasarana, dan K3L" },
  { id: "C6", label: "Mahasiswa dan Luaran Mahasiswa" },
  { id: "C7", label: "Sistem Penjaminan Mutu" },
]

export const KRITERIA_LAM_INFOKOM = [
  { id: "C1", label: "Budaya Mutu" },
  { id: "C2", label: "Relevansi Pendidikan" },
  { id: "C3", label: "Relevansi Penelitian" },
  { id: "C4", label: "Relevansi Pengabdian kepada Masyarakat" },
  { id: "C5", label: "Akuntabilitas" },
  { id: "C6", label: "Diferensiasi Misi" },
]

export const KRITERIA_LKPS = [
  { id: "LKPS-1", label: "Tata Pamong, Tata Kelola, dan Kerjasama" },
  { id: "LKPS-2", label: "Mahasiswa" },
  { id: "LKPS-3", label: "Sumber Daya Manusia" },
  { id: "LKPS-4", label: "Keuangan, Sarana, dan Prasarana" },
  { id: "LKPS-5", label: "Pendidikan" },
  { id: "LKPS-6", label: "Penelitian" },
  { id: "LKPS-7", label: "Pengabdian kepada Masyarakat" },
  { id: "LKPS-8", label: "Luaran dan Capaian Tridharma" },
]

export const isInfokom = (abbreviation?: string) => ['IF', 'II'].includes(abbreviation?.toUpperCase() || '')

export const getFileIcon = (type: string) => {
  if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-emerald-500" />
  if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet className="w-5 h-5 text-green-600" />
  if (type.includes('audio')) return <Music className="w-5 h-5 text-purple-500" />
  if (type.includes('video') || type.includes('mp4')) return <Video className="w-5 h-5 text-pink-500" />
  if (type.includes('powerpoint') || type.includes('presentation')) return <MonitorPlay className="w-5 h-5 text-orange-500" />
  if (type.includes('zip') || type.includes('rar')) return <FileArchive className="w-5 h-5 text-yellow-600" />
  return <FileText className="w-5 h-5 text-blue-500" />
}

export const getFileExtension = (filename: string, filetype: string) => {
  const extMatch = filename.match(/\.([^.]+)$/)
  if (extMatch) return extMatch[1].toUpperCase()
  if (filetype) return filetype.split('/')[1]?.toUpperCase() || 'FILE'
  return 'FILE'
}

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals))} ${sizes[i]}`
}