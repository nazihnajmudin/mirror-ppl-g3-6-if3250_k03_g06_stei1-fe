import {
  Activity,
  Award,
  Calculator,
  ClipboardList,
  Database,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Settings,
  User,
  Users,
  LucideIcon,
} from "lucide-react"

export type UserRole =
  | "SUPER_ADMIN"
  | "PIMPINAN"
  | "KAPRODI"
  | "TIM_PRODI"

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  roles?: UserRole[]
}

export const mainNavigation: NavigationItem[] = [
  {
    name: "Dashboard Institusi",
    href: "/dashboard-institusi",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "PIMPINAN"],
  },
  {
    name: "Dashboard Prodi",
    href: "/dashboard-prodi",
    icon: LayoutDashboard,
  },
  {
    name: "LKPS",
    href: "/lkps",
    icon: FileSpreadsheet,
  },
  {
    name: "LED",
    href: "/led",
    icon: FileText,
  },
  {
    name: "Template Dokumen",
    href: "/template-dokumen",
    icon: FileText,
  },
  {
    name: "Monitoring & Evaluasi",
    href: "/monitoring",
    icon: Activity,
    roles: ["SUPER_ADMIN", "PIMPINAN", "KAPRODI"],
  },
]

export const generalMenu: NavigationItem[] = [
  {
    name: "Manajemen Akun",
    href: "/manajemen-akun",
    icon: Users,
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Manajemen Sertifikat",
    href: "/manajemen-sertifikat",
    icon: Award,
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Pusat Data Institusi",
    href: "/pusat-data-institusi",
    icon: Database,
    roles: ["SUPER_ADMIN", "PIMPINAN"],
  },
]

export const prodiMenu: NavigationItem[] = [
  {
    name: "Profil Program Studi",
    href: "/profil-prodi",
    icon: User,
  },
  {
    name: "Dokumen Eviden",
    href: "/dokumen-eviden",
    icon: FolderOpen,
  },
  {
    name: "Penugasan Tim Prodi",
    href: "/penugasan",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "PIMPINAN", "KAPRODI"],
  },
  {
    name: "Simulasi Skor Prodi",
    href: "/simulasi-skor",
    icon: Calculator,
    roles: ["SUPER_ADMIN", "PIMPINAN", "KAPRODI"],
  },
]

export const bottomMenu: NavigationItem[] = [
  {
    name: "Pengaturan",
    href: "/pengaturan",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
]