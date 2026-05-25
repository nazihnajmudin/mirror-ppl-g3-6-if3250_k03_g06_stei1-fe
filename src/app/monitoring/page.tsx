"use client"

import React from "react";
import Link from "next/link";
import { Activity, FileText, FileSpreadsheet, FolderOpen } from "lucide-react";

export default function MonitoringIndexPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <Activity className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Monitoring & Evaluasi</h1>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">Halaman ringkasan untuk catatan monitoring & evaluasi. Untuk menambahkan catatan, buka dokumen terkait (LED, LKPS, atau Eviden) lalu klik tombol <strong>Monitoring</strong> pada daftar dokumen.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/led" className="rounded-lg border p-4 hover:shadow">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <div>
                <div className="font-bold">Dokumen LED</div>
                <div className="text-xs text-gray-500">Kelola Laporan Evaluasi Diri</div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/lkps" className="rounded-lg border p-4 hover:shadow">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5" />
              <div>
                <div className="font-bold">Dokumen LKPS</div>
                <div className="text-xs text-gray-500">Kelola LKPS dan versi</div>
              </div>
            </div>
          </Link>

          <Link href="/eviden" className="rounded-lg border p-4 hover:shadow">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5" />
              <div>
                <div className="font-bold">Dokumen Eviden</div>
                <div className="text-xs text-gray-500">Kelola bukti pendukung</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
