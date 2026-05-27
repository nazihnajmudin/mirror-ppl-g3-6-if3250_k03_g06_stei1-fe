"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { useUser } from "@/hooks/useUser"
import { cn } from "@/lib/utils"

type Props = {
  showRole?: boolean
  compact?: boolean
  className?: string
}

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  PIMPINAN: "Pimpinan",
  KAPRODI: "Kaprodi",
  TIM_PRODI: "Tim Prodi",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

export function UserProfile({
  showRole = true,
  compact = false,
  className,
}: Props) {
  const { user } = useUser()

  const displayName =
    user?.name ||
    user?.email ||
    "Memuat..."

  const displayRole = user
    ? roleLabel[user.role] ?? user.role
    : "Memuat..."

  const initials = user?.name
    ? getInitials(user.name)
    : "?"

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        className
      )}
    >
      {/* Text */}
      {!compact && (
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-bold text-gray-900">
            {displayName}
          </span>

          {showRole && (
            <span className="text-xs text-gray-500">
              {displayRole}
            </span>
          )}
        </div>
      )}

      {/* Avatar */}
      <Avatar className="h-10 w-10 border border-gray-200 shadow-sm">
        <AvatarImage
          src=""
          alt={displayName}
        />

        <AvatarFallback className="bg-blue-50 text-blue-600 text-sm font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}