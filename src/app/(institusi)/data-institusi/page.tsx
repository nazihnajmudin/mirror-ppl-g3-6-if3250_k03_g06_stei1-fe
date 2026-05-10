"use client"

import * as React from "react"
import { Database, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/errors"
import apiClient from "@/lib/api-client"

const initialTable2bData = [
  { no: 1, jenis_penggunaan: "Biaya Operasional Pendidikan > a. Biaya Dosen", upps_ts_minus2: 0, upps_ts_minus1: 0, upps_ts: 0 },
  { no: 2, jenis_penggunaan: "b. Tenaga Kependidikan", upps_ts_minus2: 0, upps_ts_minus1: 0, upps_ts: 0 },
  { no: 3, jenis_penggunaan: "c. Operasional Pembelajaran", upps_ts_minus2: 0, upps_ts_minus1: 0, upps_ts: 0 },
  { no: 4, jenis_penggunaan: "d. Operasional Tidak Langsung", upps_ts_minus2: 0, upps_ts_minus1: 0, upps_ts: 0 },
  { no: 5, jenis_penggunaan: "e. Operasional Diluar PT", upps_ts_minus2: 0, upps_ts_minus1: 0, upps_ts: 0 },
  { no: 6, jenis_penggunaan: "f. Investasi", upps_ts_minus2: 0, upps_ts_minus1: 0, upps_ts: 0 },
  { no: 7, jenis_penggunaan: "Penelitian", upps_ts_minus2: 0, upps_ts_minus1: 0, upps_ts: 0 },
  { no: 8, jenis_penggunaan: "PkM", upps_ts_minus2: 0, upps_ts_minus1: 0, upps_ts: 0 },
  { no: 9, jenis_penggunaan: "Lainnya", upps_ts_minus2: 0, upps_ts_minus1: 0, upps_ts: 0 },
]

export default function DataInstitusiPage() {
  const { toast } = useToast()
  
  const [periode] = React.useState("2025/2026")
  const [sheetName] = React.useState("2b")
  const [formData, setFormData] = React.useState(initialTable2bData)
  
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadDataInstitusi = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get(`/institusi?periode=${periode}&sheetName=${sheetName}`)
      const fetchedData = response.data?.data
      
      if (fetchedData && fetchedData.length > 0 && fetchedData[0].data) {
        setFormData(fetchedData[0].data)
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err) || "Gagal memuat data pusat institusi."
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [periode, sheetName])

  React.useEffect(() => {
    loadDataInstitusi()
  }, [loadDataInstitusi])

  const handleInputChange = (index: number, field: string, value: string) => {
    const newData = [...formData]
    newData[index] = { ...newData[index], [field]: Number(value) || 0 }
    setFormData(newData)
  }

  const handleSync = async () => {
    setSaving(true)
    setError(null)
    
    try {
      await apiClient.post("/institusi/sync", {
        periode,
        sheetName,
        data: formData
      })
      
      toast({
        title: "Sinkronisasi Berhasil",
        description: "Data keuangan institusi telah berhasil didistribusikan ke LKPS 11 program studi.",
        variant: "default",
      })
    } catch (err: unknown) {
      const message = getErrorMessage(err) || "Gagal menyinkronisasi data ke program studi."
      setError(message)
      toast({
        title: "Sinkronisasi Gagal",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pusat Data Institusi</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data kuantitatif pusat dan sinkronisasikan ke seluruh prodi.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadDataInstitusi} variant="outline" className="rounded-full" disabled={loading || saving}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={loading || saving}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 text-sm flex items-center gap-2 shadow-md transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {saving ? "Menyinkronkan..." : "Simpan & Sinkronisasi"}
          </Button>
        </div>
      </header>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Penggunaan Dana (Tabel 2b LKPS)</CardTitle>
              <CardDescription className="mt-1">Data keuangan tingkat Fakultas/UPPS untuk Periode {periode}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          {error && <div className="px-6 py-4 bg-red-50 text-red-600 text-sm font-medium border-b border-red-100">{error}</div>}
          
          <Table className="min-w-[800px]">
            <TableHeader className="bg-white">
              <TableRow className="hover:bg-transparent border-b border-gray-200">
                <TableHead className="uppercase text-[11px] font-bold text-gray-500 px-6 py-4 w-16">No</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-500 px-6 py-4">Jenis Penggunaan</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-500 px-6 py-4 w-48">UPPS TS-2 (Rp)</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-500 px-6 py-4 w-48">UPPS TS-1 (Rp)</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-500 px-6 py-4 w-48">UPPS TS (Rp)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : (
                formData.map((row, index) => (
                  <TableRow key={row.no} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                    <TableCell className="px-6 py-3 font-medium text-gray-500">{row.no}</TableCell>
                    <TableCell className="px-6 py-3 text-[14px] text-gray-900 font-medium">
                      {row.jenis_penggunaan}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <Input 
                        type="number" 
                        value={row.upps_ts_minus2 === 0 ? '' : row.upps_ts_minus2} 
                        onChange={(e) => handleInputChange(index, 'upps_ts_minus2', e.target.value)}
                        placeholder="0"
                        className="h-9 text-sm focus-visible:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <Input 
                        type="number" 
                        value={row.upps_ts_minus1 === 0 ? '' : row.upps_ts_minus1} 
                        onChange={(e) => handleInputChange(index, 'upps_ts_minus1', e.target.value)}
                        placeholder="0"
                        className="h-9 text-sm focus-visible:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <Input 
                        type="number" 
                        value={row.upps_ts === 0 ? '' : row.upps_ts} 
                        onChange={(e) => handleInputChange(index, 'upps_ts', e.target.value)}
                        placeholder="0"
                        className="h-9 text-sm focus-visible:ring-blue-500"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}