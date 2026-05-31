import { useState, useEffect } from "react"
import apiClient from "@/lib/api-client"
import { getErrorMessage } from "@/lib/errors"
import { ProdiOption } from "@/types/api.types"

interface ProdiWithSimulation extends ProdiOption {
  dashboard?: { simulationScore?: number }
  status?: "unggul" | "baik_sekali" | "baik" | "needs_attention"
}

export function useSimulasiList(user: any, userLoading: boolean) {
  const [prodis, setProdis] = useState<ProdiWithSimulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userLoading || user?.role === 'KAPRODI') return

    const loadProdis = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get("/prodi")
        const prodiList = response.data.data || []

        const prodiWithSimulation = await Promise.all(
          prodiList.map(async (prodi: any) => {
            try {
              const dashboardRes = await apiClient.get(`/prodi/${prodi.id}/dashboard`)
              const score = dashboardRes.data.data?.simulationScore || 0
              return {
                ...prodi,
                dashboard: dashboardRes.data.data,
                status: score >= 361 ? "unggul" : score >= 301 ? "baik_sekali" : score >= 200 ? "baik" : "needs_attention",
              }
            } catch {
              return { ...prodi, status: "needs_attention" }
            }
          })
        )
        setProdis(prodiWithSimulation)
      } catch (err: unknown) {
        setError(getErrorMessage(err) || "Gagal memuat data simulasi skor")
      } finally {
        setLoading(false)
      }
    }
    loadProdis()
  }, [userLoading, user?.role])

  return { prodis, loading, error }
}