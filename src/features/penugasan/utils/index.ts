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
  { id: "C1", label: "Visi Misi Tujuan Strategi" },
  { id: "C2", label: "Tata Pamong, Tata Kelola, dan Kerjasama" },
  { id: "C3", label: "Relevansi Pendidikan dan Penelitian/PkM" },
  { id: "C4", label: "Sumber Daya Manusia" },
  { id: "C5", label: "Sarana dan Prasarana" },
  { id: "C6", label: "Mahasiswa dan Luaran Mahasiswa" },
  { id: "C7", label: "Sistem Penjaminan Mutu" },
]

export function makeInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}