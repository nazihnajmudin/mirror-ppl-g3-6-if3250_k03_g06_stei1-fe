import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"

export function useLKPSProdiList() {
  const [user, setUser] = useState<any>(null)
  const [prodis, setProdis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, p] = await Promise.all([apiClient.get('/auth/me'), apiClient.get('/prodi/my-prodi')])
        setUser(u.data.data)
        const prodiData = p.data.data || []
        setProdis(prodiData)

        if (u.data.data.role !== 'SUPER_ADMIN' && u.data.data.role !== 'PIMPINAN' && prodiData.length === 1) {
          router.push(`/lkps/${prodiData[0].id}`)
        }
      } catch (err) { console.error("Error") } finally { setLoading(false) }
    }
    fetchData()
  }, [router])

  const filteredProdis = prodis.filter((p: any) => 
    p.fullname.toLowerCase().includes(search.toLowerCase()) || 
    p.abbreviation?.toLowerCase().includes(search.toLowerCase())
  )

  return { user, loading, search, setSearch, prodis: filteredProdis }
}