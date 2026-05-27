"use client"

import { ReactNode, useState } from "react"

import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"
import { MobileSidebar } from "./mobile-sidebar"

import { WarningBanner } from "@/components/WarningBanner"

interface Props {
  children: ReactNode
}

export function LayoutShell({
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] =
    useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:z-40 md:flex md:w-64 md:flex-col border-r border-gray-200 bg-white">
        <AppSidebar />
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileOpen}
        setOpen={setMobileOpen}
      />

      {/* Main Layout */}
      <div className="flex min-h-screen flex-col md:ml-64">

        {/* Header */}
        <AppHeader
          onOpenMobileSidebar={() =>
            setMobileOpen(true)
          }
        />

        {/* Banner */}
        <div className="border-b border-gray-200 bg-gray-50">
          <WarningBanner />
        </div>

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}