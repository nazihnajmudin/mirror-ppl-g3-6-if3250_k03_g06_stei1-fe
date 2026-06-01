import { useState, useEffect } from "react"
import apiClient from "@/lib/api-client"
import type { ApiResponse, ProdiOption } from "@/types/api.types"

export function useMyProdi() {
  const [prodis, setProdis] = useState<ProdiOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadProdis = async () => {
      try {
        const response = await apiClient.get<ApiResponse<ProdiOption[]>>("/prodi/my-prodi")
        setProdis(response.data.data || [])
        setError(null)
      } catch (err: any) {
        const message = err?.response?.data?.message || "Gagal memuat daftar prodi"
        setError(message)
        console.error("Error loading prodis:", err)
        console.error("Error status:", err?.response?.status)
        console.error("Error response:", err?.response?.data)
      } finally {
        setLoading(false)
      }
    }

    loadProdis()
  }, [mounted])

  return { prodis, loading, error, mounted }
}