import { useState, useCallback, useEffect } from "react"
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
} from "@/config/institusi-sheets.config"

type SheetRows = Array<Record<string, any>>

export function useDataInstitusi() {
  const { toast } = useToast()

  const [periode] = useState("2025/2026")
  const [prodis, setProdis] = useState<Prodi[]>([])
  const [selectedProdiId, setSelectedProdiId] = useState<string>("")
  const [selectedSheetKey, setSelectedSheetKey] = useState<string>(INSTITUSI_SHEETS[0].key)
  const [sheetDataByKey, setSheetDataByKey] = useState<Record<string, SheetRows>>({})

  const [loadingProdi, setLoadingProdi] = useState(true)
  const [loadingSheet, setLoadingSheet] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentSheet = INSTITUSI_SHEET_MAP[selectedSheetKey] || INSTITUSI_SHEETS[0]
  const currentRows = sheetDataByKey[selectedSheetKey] ?? getDefaultRowsForSheet(currentSheet)

  const loadProdi = useCallback(async () => {
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

  const loadSheet = useCallback(
    async (sheetKey: string, force = false) => {
      if (!selectedProdiId) return

      if (!force && sheetDataByKey[sheetKey]) return

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

  useEffect(() => {
    void loadProdi()
  }, [loadProdi])

  useEffect(() => {
    if (!selectedProdiId) return
    setSheetDataByKey({})
  }, [selectedProdiId])

  useEffect(() => {
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

        return { ...row, [field]: nextValue }
      })

      return { ...prev, [sheetKey]: nextRows }
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
      if (!selectedProdiId) throw new Error("Program studi wajib dipilih sebelum sinkronisasi.")

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
        description: `Data ${currentSheet.title.toLowerCase()} berhasil disinkronkan ke LKPS.`,
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

  return {
    periode, prodis, selectedProdiId, setSelectedProdiId, selectedSheetKey, setSelectedSheetKey,
    loadingProdi, loadingSheet, saving, error, currentSheet, currentRows,
    loadSheet, updateRowValue, addRow, removeRow, handleSync
  }
}