"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

export default function DashboardIndex() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    
    if (user?.role === "PIMPINAN" || user?.role === "SUPER_ADMIN") {
      router.push("/dashboard-institusi")
    } else {
      router.push("/dashboard-prodi")
    }
  }, [user, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  )
}