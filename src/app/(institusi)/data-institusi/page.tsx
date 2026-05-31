"use client"

import * as React from "react"
import { Database, RefreshCw, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/errors"
import apiClient from "@/lib/api-client"
import { getAllProdi } from "@/lib/api-prodi"
import type { Prodi } from "@/types/api.types"
import {
  INSTITUSI_SHEETS,
  INSTITUSI_SHEET_MAP,
  getDefaultRowsForSheet,
  normalizeSheetRows,
  createBlankFreeRow,
  type InstitusiSheetConfig,
} from "@/config/institusi-sheets.config"
import { cn } from "@/lib/utils"

type SheetRows = Array<Record<string, any>>

export default function DataInstitusiPage() {
  const { toast } = useToast()

  const [periode] = React.useState("2025/2026")
  const [prodis, setProdis] = React.useState<Prodi[]>([])
  const [selectedProdiId, setSelectedProdiId] = React.useState<string>("")
  const [selectedSheetKey, setSelectedSheetKey] = React.useState<string>(INSTITUSI_SHEETS[0].key)
  const [sheetDataByKey, setSheetDataByKey] = React.useState<Record<string, SheetRows>>({})

  const [loadingProdi, setLoadingProdi] = React.useState(true)
  const [loadingSheet, setLoadingSheet] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const currentSheet = INSTITUSI_SHEET_MAP[selectedSheetKey] || INSTITUSI_SHEETS[0]
  const currentRows = sheetDataByKey[selectedSheetKey] ?? getDefaultRowsForSheet(currentSheet)

  const loadProdi = React.useCallback(async () => {
    setLoadingProdi(true)
    try {
      const list = await getAllProdi()
      setProdis(list)
      setSelectedProdiId((current) => current || list[0]?.id || "")
    } catch (err: unknown) {
      const message = getErrorMessage(err) || "Gagal memuat daftar program studi."
      setError(message)
    } finally {
      setLoadingProdi(false)
    }
  }, [])

  const loadSheet = React.useCallback(
    async (sheetKey: string, force = false) => {
      if (!selectedProdiId) return

      if (!force && sheetDataByKey[sheetKey]) {
        return
      }

      setLoadingSheet(true)
      setError(null)

      try {
        const response = await apiClient.get(
          `/institusi?periode=${periode}&sheetName=${sheetKey}&prodiId=${selectedProdiId}`
        )
        const fetchedData = response.data?.data
        const sheetConfig = INSTITUSI_SHEET_MAP[sheetKey]

        if (fetchedData && fetchedData.length > 0 && fetchedData[0].data) {
          setSheetDataByKey((prev) => ({
            ...prev,
            [sheetKey]: normalizeSheetRows(sheetConfig, fetchedData[0].data),
          }))
        } else {
          setSheetDataByKey((prev) => ({
            ...prev,
            [sheetKey]: getDefaultRowsForSheet(sheetConfig),
          }))
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err) || "Gagal memuat data pusat institusi."
        setError(message)
      } finally {
        setLoadingSheet(false)
      }
    },
    [periode, selectedProdiId, sheetDataByKey]
  )

  React.useEffect(() => {
    void loadProdi()
  }, [loadProdi])

  React.useEffect(() => {
    if (!selectedProdiId) return
    setSheetDataByKey({})
  }, [selectedProdiId])

  React.useEffect(() => {
    if (!selectedProdiId) return
    void loadSheet(selectedSheetKey)
  }, [selectedProdiId, selectedSheetKey, loadSheet])

  const updateRowValue = (
    sheetKey: string,
    rowIndex: number,
    field: string,
    value: string | number | boolean
  ) => {
    setSheetDataByKey((prev) => {
      const sheet = INSTITUSI_SHEET_MAP[sheetKey]
      const rows = prev[sheetKey] ?? getDefaultRowsForSheet(sheet)
      const nextRows = rows.map((row, index) => {
        if (index !== rowIndex) return row

        if (field === "no") return row

        const column = sheet.columns.find((col) => col.key === field)
        if (!column) return row

        let nextValue: any = value
        if (column.type === "number") {
          nextValue = value === "" ? "" : Number(value)
        }

        return {
          ...row,
          [field]: nextValue,
        }
      })

      return {
        ...prev,
        [sheetKey]: nextRows,
      }
    })
  }

  const addRow = () => {
    if (currentSheet.rowType !== "free") return

    setSheetDataByKey((prev) => {
      const rows = prev[selectedSheetKey] ?? getDefaultRowsForSheet(currentSheet)
      return {
        ...prev,
        [selectedSheetKey]: [...rows, createBlankFreeRow(currentSheet, rows.length + 1)],
      }
    })
  }

  const removeRow = (rowIndex: number) => {
    if (currentSheet.rowType !== "free") return

    setSheetDataByKey((prev) => {
      const rows = prev[selectedSheetKey] ?? getDefaultRowsForSheet(currentSheet)
      const nextRows = rows.filter((_, index) => index !== rowIndex).map((row, index) => ({
        ...row,
        no: index + 1,
      }))

      return {
        ...prev,
        [selectedSheetKey]: nextRows.length > 0 ? nextRows : [createBlankFreeRow(currentSheet, 1)],
      }
    })
  }

  const handleSync = async () => {
    setSaving(true)
    setError(null)

    try {
      if (!selectedProdiId) {
        throw new Error("Program studi wajib dipilih sebelum sinkronisasi.")
      }

      const normalizedRows = normalizeSheetRows(currentSheet, currentRows)

      await apiClient.post("/institusi/sync", {
        periode,
        sheetName: selectedSheetKey,
        prodiId: selectedProdiId,
        data: normalizedRows,
      })

      setSheetDataByKey((prev) => ({
        ...prev,
        [selectedSheetKey]: normalizedRows,
      }))

      toast({
        title: "Sinkronisasi Berhasil",
        description: `Data ${currentSheet.title.toLowerCase()} berhasil disinkronkan ke LKPS prodi ${prodis.find((p) => p.id === selectedProdiId)?.fullname || "terpilih"}.`,
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

  const renderField = (sheet: InstitusiSheetConfig, rowIndex: number, column: InstitusiSheetConfig["columns"][number], row: Record<string, any>) => {
    const value = row[column.key]

    if (column.key === "no") {
      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700">
          {value}
        </div>
      )
    }

    if (column.type === "boolean") {
      return (
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 min-h-[48px]">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => updateRowValue(sheet.key, rowIndex, column.key, Boolean(checked))}
          />
          <span className="text-sm text-gray-700 break-normal whitespace-normal leading-snug">{column.label}</span>
        </label>
      )
    }

    if (column.type === "select") {
      return (
        <Select
          value={String(value ?? "")}
          onValueChange={(nextValue) => updateRowValue(sheet.key, rowIndex, column.key, nextValue ?? "")}
        >
          <SelectTrigger className="w-full bg-white min-w-0">
            <SelectValue placeholder={`Pilih ${column.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {column.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (column.type === "textarea") {
      return (
        <Textarea
          className="w-full min-h-[120px] resize-y"
          value={value ?? ""}
          onChange={(event) => updateRowValue(sheet.key, rowIndex, column.key, event.target.value)}
          placeholder={column.label}
        />
      )
    }

    const inputType = column.type === "date" ? "date" : column.type === "url" ? "url" : column.type === "number" ? "number" : "text"

    return (
      <Input
        className="w-full min-w-0"
        type={inputType}
        value={value === 0 || value ? value : ""}
        onChange={(event) => updateRowValue(sheet.key, rowIndex, column.key, event.target.value)}
        placeholder={column.label}
      />
    )
  }

  const currentSheetRows = currentRows

  return (
    <>
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pusat Data Institusi</h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola data per program studi berdasarkan konfigurasi LKPS dan sinkronkan langsung ke sheet LKPS aktif.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => void loadSheet(selectedSheetKey, true)} variant="outline" className="rounded-full" disabled={loadingProdi || loadingSheet || saving}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingSheet ? "animate-spin" : ""}`} />
              Refresh Sheet
            </Button>
            <Button
              onClick={handleSync}
              disabled={loadingProdi || loadingSheet || saving || !selectedProdiId}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 text-sm flex items-center gap-2 shadow-md transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {saving ? "Menyinkronkan..." : "Simpan & Sinkronisasi"}
            </Button>
          </div>
        </div>
      </header>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-lg font-bold text-gray-900">Target Sinkronisasi</CardTitle>
          <CardDescription className="mt-1">Pilih program studi dan sheet LKPS yang akan diisi.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-2 min-w-0">
              <label className="text-xs font-bold uppercase text-gray-500">Program Studi</label>
              <Select value={selectedProdiId} onValueChange={(value) => setSelectedProdiId(value ?? "")} disabled={loadingProdi}>
                <SelectTrigger className="w-full bg-white min-w-0">
                  <SelectValue placeholder={loadingProdi ? "Memuat prodi..." : "Pilih program studi"} />
                </SelectTrigger>
                <SelectContent>
                  {prodis.map((prodi) => (
                    <SelectItem key={prodi.id} value={prodi.id}>
                      {prodi.fullname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 min-w-0">
              <label className="text-xs font-bold uppercase text-gray-500">Periode</label>
              <Input value={periode} disabled className="bg-gray-50 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Editor Sheet LKPS Institusi</CardTitle>
              <CardDescription className="mt-1 break-normal whitespace-normal">
                {currentSheet.description}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {INSTITUSI_SHEETS.map((sheet) => (
                <Button
                  key={sheet.key}
                  type="button"
                  variant={selectedSheetKey === sheet.key ? "default" : "outline"}
                  onClick={() => setSelectedSheetKey(sheet.key)}
                  className={cn(
                    "rounded-full px-4",
                    selectedSheetKey === sheet.key && "bg-gray-900 text-white"
                  )}
                >
                  {sheet.title}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!selectedProdiId ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Pilih program studi terlebih dahulu untuk mulai mengisi sheet LKPS.
            </div>
          ) : loadingSheet && !sheetDataByKey[selectedSheetKey] ? (
            <div className="flex h-40 items-center justify-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
              Memuat sheet {currentSheet.title}...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{currentSheet.title}</h3>
                  <p className="text-sm text-gray-500">
                    {currentSheet.rowType === "fixed"
                      ? "Baris sudah ditentukan oleh konfigurasi LKPS."
                      : "Tambahkan baris sesuai kebutuhan lalu sinkronkan ke LKPS."}
                  </p>
                </div>
                {currentSheet.rowType === "free" && (
                  <Button type="button" variant="outline" onClick={addRow} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Tambah Baris
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {currentSheetRows.map((row, rowIndex) => {
                  const rowTitle = currentSheet.rowType === "fixed"
                    ? currentSheet.fixedRows?.[rowIndex] || row.jenis_penggunaan || `Baris ${rowIndex + 1}`
                    : row.program_studi || row.nama || `${currentSheet.title} ${rowIndex + 1}`

                  return (
                    <Card key={`${selectedSheetKey}-${row.no}-${rowIndex}`} className="w-full min-w-0 overflow-hidden border-gray-200 shadow-sm">
                      <CardHeader className="border-b border-gray-100 bg-gray-50/70 px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="text-sm font-bold text-gray-900 break-normal whitespace-normal leading-snug">
                              {row.no}. {rowTitle}
                            </CardTitle>
                            <CardDescription className="mt-1 break-normal whitespace-normal leading-snug">
                              Isi semua field yang relevan untuk sheet {currentSheet.sheetName}.
                            </CardDescription>
                          </div>
                          {currentSheet.rowType === "free" && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(rowIndex)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </Button>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {currentSheet.columns.map((column) => {
                            if (column.key === "no") {
                              return (
                                <div key={column.key} className="space-y-2 min-w-0">
                                  <label className="text-xs font-bold uppercase text-gray-500 break-normal whitespace-normal leading-snug">{column.label}</label>
                                  {renderField(currentSheet, rowIndex, column, row)}
                                </div>
                              )
                            }

                            if (currentSheet.rowType === "fixed" && column.key === "jenis_penggunaan") {
                              return (
                                <div key={column.key} className="space-y-2 min-w-0 xl:col-span-2">
                                  <label className="text-xs font-bold uppercase text-gray-500 break-normal whitespace-normal leading-snug">{column.label}</label>
                                  <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 break-normal whitespace-normal leading-snug min-h-[44px] flex items-center">
                                    {row.jenis_penggunaan}
                                  </div>
                                </div>
                              )
                            }

                            return (
                              <div key={column.key} className="space-y-2 min-w-0">
                                <label className="text-xs font-bold uppercase text-gray-500 break-normal whitespace-normal leading-snug">
                                  {column.label}
                                </label>
                                {renderField(currentSheet, rowIndex, column, row)}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button onClick={() => void loadSheet(selectedSheetKey, true)} variant="outline" disabled={loadingSheet || saving}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingSheet ? "animate-spin" : ""}`} />
                  Refresh Sheet
                </Button>
                <Button
                  onClick={handleSync}
                  disabled={loadingSheet || saving || !selectedProdiId}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm flex items-center gap-2 shadow-md transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  {saving ? "Menyinkronkan..." : "Simpan & Sinkronisasi"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}