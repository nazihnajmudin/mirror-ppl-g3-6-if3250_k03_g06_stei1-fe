"use client"

import React from "react"
import { ExternalLink, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { downloadCertificate, isLocalCertificate } from "@/lib/api-prodi"
import { getStatus, formatDate, type ProdiWithAccreditation, type AccreditationStatus } from "../utils"

interface CertificateTableProps {
  data: ProdiWithAccreditation[]
  loading: boolean
  onEdit: (prodi: ProdiWithAccreditation) => void
}

function StatusBadge({ status }: { status: AccreditationStatus }) {
  const map: Record<AccreditationStatus, string> = {
    Aktif: "bg-green-50 text-green-600",
    "Segera Habis": "bg-yellow-50 text-yellow-600",
    Kadaluarsa: "bg-red-50 text-red-600",
    "Belum Diatur": "bg-gray-100 text-gray-600",
  }
  return <Badge className={cn("px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none ring-0 rounded-md", map[status])}>{status}</Badge>
}

export function CertificateTable({ data, loading, onEdit }: CertificateTableProps) {
  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-500">Memuat data...</div>
  }

  return (
    <Table>
      <TableHeader className="bg-gray-50/50">
        <TableRow className="hover:bg-transparent border-b border-gray-100">
          <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Program Studi</TableHead>
          <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Grade</TableHead>
          <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Berlaku Dari</TableHead>
          <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Berlaku S.d.</TableHead>
          <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Status</TableHead>
          <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Sertifikat</TableHead>
          <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((prodi) => {
          const acc = prodi.accreditation
          const status = getStatus(acc?.endDate)
          const hasCert = !!acc?.certificateUrl
          const isLocalCert = isLocalCertificate(acc?.certificateUrl)

          return (
            <TableRow key={prodi.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
              <TableCell className="px-6 py-4">
                <div className="font-bold text-[14px] text-gray-900 leading-tight mb-0.5">{prodi.fullname}</div>
                {prodi.abbreviation && <div className="text-[13px] text-gray-500">{prodi.abbreviation}</div>}
              </TableCell>
              <TableCell className="px-6 py-4">
                <span className="font-bold text-[14px] text-blue-700">{acc?.grade ?? "-"}</span>
              </TableCell>
              <TableCell className="px-6 py-4 text-[14px] text-gray-600 font-medium">{formatDate(acc?.startDate)}</TableCell>
              <TableCell className="px-6 py-4 text-[14px] text-gray-600 font-medium">{formatDate(acc?.endDate)}</TableCell>
              <TableCell className="px-6 py-4"><StatusBadge status={status} /></TableCell>
              <TableCell className="px-6 py-4">
                {hasCert ? (
                  isLocalCert ? (
                    <button
                      onClick={() => downloadCertificate(prodi.id, acc?.certificateOriginalName)}
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {acc?.certificateOriginalName ?? "Unduh"}
                    </button>
                  ) : (
                    <a
                      href={acc!.certificateUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Lihat
                    </a>
                  )
                ) : (
                  <span className="text-sm text-gray-400 font-medium">-</span>
                )}
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(prodi)}
                  className="rounded-lg h-9 px-4 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md transition-all"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
              Belum ada data program studi.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}