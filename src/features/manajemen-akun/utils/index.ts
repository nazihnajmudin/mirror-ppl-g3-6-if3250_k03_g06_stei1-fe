import type { UserRole } from "@/types/api.types"

export const roleLabel: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  PIMPINAN: "Pimpinan",
  KAPRODI: "Kaprodi",
  TIM_PRODI: "Tim Prodi",
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export const requiresProdiRole = (role: UserRole): boolean => {
  return role === "KAPRODI" || role === "TIM_PRODI"
}