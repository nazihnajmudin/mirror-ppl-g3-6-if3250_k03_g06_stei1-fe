import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { getAllProdi, getAccreditation } from "@/lib/api-prodi"
import type { ProdiWithAccreditation } from "../utils"

export function useCertificates() {
  const { toast } = useToast()
  const [data, setData] = useState<ProdiWithAccreditation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const prodis = await getAllProdi()
      const withAccreditation = await Promise.all(
        prodis.map(async (p) => {
          try {
            const accreditation = await getAccreditation(p.id)
            return { ...p, accreditation }
          } catch {
            return { ...p, accreditation: null }
          }
        })
      )
      setData(withAccreditation)
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal memuat data", description: err.message })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, fetchData }
}