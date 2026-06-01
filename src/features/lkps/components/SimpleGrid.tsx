'use client'
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

export default function SimpleGrid({ data, config, onDataChange }: any) {
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data]; if (!newData[rowIndex]) newData[rowIndex] = [];
    newData[rowIndex][colIndex] = value; onDataChange(newData);
  }
  const colCount = config.columnLabels?.length || config.columns?.length || 10;
  
  const renderHeaders = () => {
    if (config.nestedHeaders && config.nestedHeaders.length > 0) {
      return config.nestedHeaders.map((row: any[], i: number) => (
        <TableRow key={`h-row-${i}`} className="bg-gray-50/50">
          {row.map((cell: any, j: number) => {
            const label = typeof cell === 'object' ? cell.label : cell
            const colspan = typeof cell === 'object' ? cell.colspan : 1
            const rowspan = typeof cell === 'object' ? cell.rowspan : 1
            return (
              <TableHead key={`h-cell-${i}-${j}`} colSpan={colspan} rowSpan={rowspan} className="border border-gray-200 text-center uppercase tracking-wider text-[11px] font-bold text-gray-500 py-3 px-2">
                {label}
              </TableHead>
            )
          })}
        </TableRow>
      ))
    }
    const labels = config.columnLabels && config.columnLabels.length > 0 ? config.columnLabels : Array.from({ length: config.columns?.length || 10 }).map((_, i) => `Kolom ${i + 1}`)
    return (
      <TableRow className="bg-gray-50/50">
        {labels.map((label: string, i: number) => (
          <TableHead key={i} className="border border-gray-200 uppercase tracking-wider text-[11px] font-bold text-gray-500 py-3 px-3">{label}</TableHead>
        ))}
      </TableRow>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-auto max-h-[600px] custom-scrollbar">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">{renderHeaders()}</TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow><TableCell colSpan={colCount} className="text-center py-12 text-sm font-medium text-gray-400">Tidak ada data. Klik "Tambah Baris" untuk memulai.</TableCell></TableRow>
          ) : (
            data.map((row: any[], rowIndex: number) => (
              <TableRow key={rowIndex} className="hover:bg-gray-50/30 transition-colors">
                <TableCell className="bg-gray-50/50 border border-gray-200 text-center font-bold text-gray-500 text-xs w-12 sticky left-0 z-10">{rowIndex + 1}</TableCell>
                {Array.from({ length: colCount }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="p-0 border border-gray-100 min-w-[150px]">
                    <Input value={row[colIndex] || ''} onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)} className="border-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded-none h-11 text-sm px-3 shadow-none bg-transparent font-medium" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}