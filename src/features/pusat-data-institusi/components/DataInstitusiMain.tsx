"use client"

import React from "react"
import { Plus, Trash2, Loader2, RefreshCw, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { INSTITUSI_SHEETS, type InstitusiSheetConfig } from "@/config/institusi-sheets.config"

export function DataInstitusiMain({
  periode, prodis, selectedProdiId, setSelectedProdiId, selectedSheetKey, setSelectedSheetKey,
  loadingProdi, loadingSheet, saving, error, currentSheet, currentRows,
  loadSheet, updateRowValue, addRow, removeRow, handleSync
}: any) {

  const renderField = (sheet: InstitusiSheetConfig, rowIndex: number, column: InstitusiSheetConfig["columns"][number], row: Record<string, any>) => {
    const value = row[column.key]

    if (column.key === "no") {
      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold text-gray-700 h-11 flex items-center">
          {value}
        </div>
      )
    }

    if (column.type === "boolean") {
      return (
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 min-h-[44px] cursor-pointer hover:bg-gray-50 transition-colors h-11">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => updateRowValue(sheet.key, rowIndex, column.key, Boolean(checked))}
          />
          <span className="text-sm font-medium text-gray-700 break-normal whitespace-normal leading-snug">{column.label}</span>
        </label>
      )
    }

    if (column.type === "select") {
      return (
        <Select value={String(value ?? "")} onValueChange={(nextValue) => updateRowValue(sheet.key, rowIndex, column.key, nextValue ?? "")}>
          <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-200 rounded-lg min-w-0">
            <SelectValue placeholder={`Pilih ${column.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {column.options?.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (column.type === "textarea") {
      return (
        <Textarea
          className="w-full min-h-[120px] resize-y bg-gray-50/50 border-gray-200 rounded-lg p-3 text-sm"
          value={value ?? ""}
          onChange={(event) => updateRowValue(sheet.key, rowIndex, column.key, event.target.value)}
          placeholder={column.label}
        />
      )
    }

    const inputType = column.type === "date" ? "date" : column.type === "url" ? "url" : column.type === "number" ? "number" : "text"

    return (
      <Input
        className="w-full h-11 min-w-0 bg-gray-50/50 border-gray-200 rounded-lg px-3 text-sm"
        type={inputType}
        value={value === 0 || value ? value : ""}
        onChange={(event) => updateRowValue(sheet.key, rowIndex, column.key, event.target.value)}
        placeholder={column.label}
      />
    )
  }

  return (
    <>
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
          <CardTitle className="text-lg font-bold text-gray-900">Target Sinkronisasi</CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">Pilih program studi dan sheet LKPS yang akan diisi.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-2.5 min-w-0">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Program Studi</label>
              <Select value={selectedProdiId} onValueChange={(value) => setSelectedProdiId(value ?? "")} disabled={loadingProdi}>
                <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-200 rounded-lg min-w-0">
                  <SelectValue placeholder={loadingProdi ? "Memuat prodi..." : "Pilih program studi"} />
                </SelectTrigger>
                <SelectContent>
                  {prodis.map((prodi: any) => (
                    <SelectItem key={prodi.id} value={prodi.id}>
                      {prodi.fullname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5 min-w-0">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Periode</label>
              <Input value={periode} disabled className="h-11 bg-gray-100 border-gray-200 rounded-lg w-full font-bold text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Editor Sheet LKPS Institusi</CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1 break-normal whitespace-normal">
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
                    "rounded-full px-4 font-bold text-xs h-9 transition-colors",
                    selectedSheetKey === sheet.key ? "bg-black text-white hover:bg-gray-800" : "text-gray-600 border-gray-200 hover:bg-gray-100"
                  )}
                >
                  {sheet.title}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 bg-gray-50/30">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </div>
          )}

          {!selectedProdiId ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm font-medium text-gray-500">
              Pilih program studi terlebih dahulu untuk mulai mengisi sheet LKPS.
            </div>
          ) : loadingSheet && !currentRows.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Memuat sheet {currentSheet.title}...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{currentSheet.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {currentSheet.rowType === "fixed"
                      ? "Baris sudah ditentukan oleh konfigurasi LKPS."
                      : "Tambahkan baris sesuai kebutuhan lalu sinkronkan ke LKPS."}
                  </p>
                </div>
                {currentSheet.rowType === "free" && (
                  <Button type="button" variant="outline" onClick={addRow} className="gap-2 h-9 rounded-lg font-bold text-xs border-gray-300 bg-white">
                    <Plus className="w-4 h-4" />
                    Tambah Baris
                  </Button>
                )}
              </div>

              <div className="space-y-5">
                {currentRows.map((row: any, rowIndex: number) => {
                  const rowTitle = currentSheet.rowType === "fixed"
                    ? currentSheet.fixedRows?.[rowIndex] || row.jenis_penggunaan || `Baris ${rowIndex + 1}`
                    : row.program_studi || row.nama || `${currentSheet.title} ${rowIndex + 1}`

                  return (
                    <Card key={`${selectedSheetKey}-${row.no}-${rowIndex}`} className="w-full min-w-0 overflow-hidden border-gray-200 shadow-sm rounded-xl">
                      <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="text-sm font-bold text-gray-900 break-normal whitespace-normal leading-snug">
                              {row.no}. {rowTitle}
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs text-gray-500 break-normal whitespace-normal leading-snug">
                              Isi semua field yang relevan untuk sheet {currentSheet.sheetName}.
                            </CardDescription>
                          </div>
                          {currentSheet.rowType === "free" && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(rowIndex)} className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold text-xs rounded-lg h-8 px-3">
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                              Hapus
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {currentSheet.columns.map((column: any) => {
                            if (column.key === "no") {
                              return (
                                <div key={column.key} className="space-y-2.5 min-w-0">
                                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider break-normal whitespace-normal leading-snug">{column.label}</label>
                                  {renderField(currentSheet, rowIndex, column, row)}
                                </div>
                              )
                            }

                            if (currentSheet.rowType === "fixed" && column.key === "jenis_penggunaan") {
                              return (
                                <div key={column.key} className="space-y-2.5 min-w-0 xl:col-span-2">
                                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider break-normal whitespace-normal leading-snug">{column.label}</label>
                                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-900 break-normal whitespace-normal leading-snug h-11 flex items-center">
                                    {row.jenis_penggunaan}
                                  </div>
                                </div>
                              )
                            }

                            return (
                              <div key={column.key} className="space-y-2.5 min-w-0">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider break-normal whitespace-normal leading-snug">
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

              {/* Action Bawah */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <Button onClick={() => void loadSheet(selectedSheetKey, true)} variant="outline" className="rounded-full font-bold text-sm h-11 px-6 bg-white" disabled={loadingSheet || saving}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingSheet ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleSync}
                  disabled={loadingSheet || saving || !selectedProdiId}
                  className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2.5 h-11 text-sm font-bold flex items-center gap-2 shadow-md transition-colors"
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