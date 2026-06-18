import { useEffect, useState } from "react"
import apiClient from "@/lib/api-client"
import { getErrorMessage } from "@/lib/errors"
import type { ApiResponse, ProdiOption } from "@/types/api.types"

export interface ProdiWithDashboard extends ProdiOption {
  dashboard?: {
    accreditation?: { grade?: string; endDate?: string }
    documents?: { lkps?: { progress?: number }; led?: { progress?: number } }
    simulationScore?: number
  }
  status?: "completed" | "in_progress"
  isSafePeriod?: boolean
}

export function useDashboard() {
  const [prodis, setProdis] = useState<ProdiWithDashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProdis = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get<ApiResponse<ProdiOption[]>>("/prodi")
        const prodiList = response.data.data || []
        
        const prodiWithDashboard = await Promise.all(
          prodiList.map(async (prodi) => {
            try {
              const dashboardRes = await apiClient.get(`/prodi/${prodi.id}/dashboard`)
              const dashboardData = dashboardRes.data.data
              const score = dashboardData?.simulationScore || 0
              
              let isSafePeriod = false;
              if (dashboardData?.accreditation?.endDate) {
                const msInYear = 1000 * 60 * 60 * 24 * 365.25;
                const yearsUntilExpiry = (new Date(dashboardData.accreditation.endDate).getTime() - Date.now()) / msInYear;
                if (yearsUntilExpiry > 1.5) {
                  isSafePeriod = true;
                }
              }

              return {
                ...prodi,
                dashboard: dashboardData,
                status: score >= 361 ? ("completed" as const) : ("in_progress" as const),
                isSafePeriod,
              }
            } catch (err) {
              return {
                ...prodi,
                status: "in_progress" as const,
                isSafePeriod: false,
              }
            }
          })
        )
        
        setProdis(prodiWithDashboard)
      } catch (err: unknown) {
        const message = getErrorMessage(err) || "Gagal memuat data program studi"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadProdis()
  }, [])

  return { prodis, loading, error }
}