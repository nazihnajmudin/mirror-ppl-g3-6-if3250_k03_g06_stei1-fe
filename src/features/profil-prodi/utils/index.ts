export interface ProdiData {
  fullname: string
  akreditasi: string
  degree: string
  endDate: string
  namaKaprodi: string
  visi: string
  misi: string[]
  skorAkreditasi: number
  targetSkor: number
  certificateUrl: string
}

export interface TimProdiMember {
  id: string
  name: string
  email: string
  role: string
  indikator: string[]
  isActive: boolean
  initials: string
}

export function makeInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}