"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { useUser } from "@/hooks/useUser"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  useAuthGuard()
  const { user, loading } = useUser()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    // Redirect based on user role
    if (user.role === "SUPER_ADMIN" || user.role === "PIMPINAN") {
      router.push("/dashboard")
    } else {
      router.push("/prodi-saya")
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-gray-600 mt-4 text-sm md:text-base">Memuat halaman...</p>
      </div>
    </div>
  )
}