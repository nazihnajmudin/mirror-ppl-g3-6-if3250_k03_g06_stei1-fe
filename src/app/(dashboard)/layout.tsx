"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { LayoutShell } from "@/components/layout/layout-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useAuthGuard()

  const [mounted, setMounted] =
    useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <LayoutShell>
      {children}
    </LayoutShell>
  )
}