"use client"
import React from 'react'
import { BookOpen, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function LKPSProdiListMain({ logic, router }: { logic: any, router: any }) {
  // Safety check: Pastikan logic.prodis adalah array sebelum di-map
  const prodiList = Array.isArray(logic.prodis) ? logic.prodis : [];

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumen LKPS Institusi</h1>
          <p className="text-sm text-gray-500 mt-1">
            {logic.user?.role === 'SUPER_ADMIN' || logic.user?.role === 'PIMPINAN' 
              ? "Pilih Program Studi untuk meninjau dokumen Laporan Kinerja Program Studi."
              : "Pilih Program Studi penugasan Anda untuk mengelola dokumen Laporan Kinerja Program Studi."}
          </p>
        </div>
      </header>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">PROGRAM STUDI</TableHead>
              <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 text-right tracking-wider">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prodiList.map((prodi: any) => (
              <TableRow key={prodi.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm border border-blue-100">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[14px] font-bold text-gray-900 leading-tight">{prodi.fullname}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/lkps/${prodi.id}`)}
                    className="rounded-lg h-9 px-4 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md transition-all gap-2"
                  >
                    <Eye className="w-4 h-4" /> Lihat LKPS
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {prodiList.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                  Belum ada data program studi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}