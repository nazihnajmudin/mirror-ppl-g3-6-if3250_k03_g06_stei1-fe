"use client"

import { Menu } from "lucide-react"

import { NotificationBell } from "@/components/NotificationBell"
import { UserProfile } from "./user-profile"

import { useUser } from "@/hooks/useUser"

type Props = {
  onOpenMobileSidebar?: () => void
}

export function AppHeader({
  onOpenMobileSidebar,
}: Props) {
  const { user } = useUser()

  const showNotification =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "PIMPINAN"

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* Left Section */}
        <div className="flex items-center gap-3">
          
          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="rounded-xl p-2 transition-colors hover:bg-gray-100 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>

          {/* Mobile Logo */}
          <div className="md:hidden">
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Portal STEI
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {showNotification && (
            <NotificationBell />
          )}

          <UserProfile />
        </div>
      </div>
    </header>
  )
}