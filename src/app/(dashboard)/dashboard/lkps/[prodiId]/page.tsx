"use client"

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImportDialog } from "@/components/lkps/import-dialog";
import { useLKPS } from "@/hooks/use-lkps";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";

export default function LKPSProdiPage({ params }: { params: Promise<{ prodiId: string }> }) {
  const resolvedParams = React.use(params);
  const prodiId = resolvedParams.prodiId;
  
  const [user, setUser] = useState<any>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  const { versions, loading, refresh } = useLKPS(prodiId);

  useEffect(() => {
    if (versions.length > 0 && !activeVersionId) {
      setActiveVersionId(versions[0].id);
    }
  }, [versions, activeVersionId]);

  const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0];

  const handleExport = async () => {
    if (!activeVersionId) return;
    
    toast({
      title: "Menyiapkan Unduhan",
      description: "Excel sedang digenerate...",
    });

    try {
      const response = await apiClient.get(`/lkps/export/${activeVersionId}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from header or fallback
      const contentDisposition = response.headers['content-disposition'];
      let filename = activeVersion?.originalFilename || `LKPS_${activeVersion?.prodi?.abbreviation || 'Export'}.xlsx`;
      
      if (contentDisposition) {
        // Handle both filename= and filename*=
        const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Unduhan Berhasil",
        description: "File LKPS telah berhasil diunduh.",
      });
    } catch (err) {
      console.error("Download Error:", err);
      toast({
        variant: "destructive",
        title: "Unduhan Gagal",
        description: "Terjadi kesalahan saat mengekspor file.",
      });
    }
  };

  const isViewOnly = user?.role === 'PIMPINAN';

  if (loading && versions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-500">← Kembali</Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {versions[0]?.prodi?.fullname || "Laporan Kinerja Program Studi"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manajemen Laporan Kinerja Program Studi (LKPS)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-6">
          {!isViewOnly && (
            <Card className="border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-gray-100 bg-white">
                <CardTitle className="text-[15px] font-bold text-gray-700">Upload Dokumen Baru</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ImportDialog prodiId={prodiId} onImportSuccess={refresh} />
              </CardContent>
            </Card>
          )}

          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-gray-100 bg-white">
              <CardTitle className="text-[15px] font-bold text-gray-700">Riwayat Revisi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col max-h-[400px] overflow-y-auto">
                {versions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">Belum ada revisi.</div>
                ) : (
                  versions.map((v, idx) => (
                    <div 
                      key={v.id}
                      onClick={() => setActiveVersionId(v.id)}
                      className={cn(
                        "px-6 py-5 cursor-pointer transition-all border-l-4",
                        activeVersionId === v.id 
                          ? "bg-green-50/50 border-green-500" 
                          : "bg-white border-transparent hover:bg-gray-50/50"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[14px] font-bold",
                              activeVersionId === v.id ? "text-gray-900" : "text-gray-700"
                            )}>
                              Versi {versions.length - idx}
                            </span>
                            {idx === 0 && (
                              <Badge className="bg-green-100 text-green-700 text-[10px] py-0 border-none">Terbaru</Badge>
                            )}
                          </div>
                          <p className="text-[12px] text-gray-500 font-medium">
                            {new Date(v.createdAt).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 flex flex-col">
          <Card className="border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900">
                    {activeVersion?.originalFilename || activeVersion?.name || "Pilih Versi"}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] text-gray-500 font-medium">Dokumen Binary LKPS</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={!activeVersionId}
                className="gap-2.5 text-[12px] font-bold border-gray-200 hover:bg-gray-50 rounded-lg px-4 h-10 transition-all"
              >
                <Download className="w-4 h-4" />
                Unduh (.xlsx)
              </Button>
            </div>
            
            <CardContent className="p-0 flex-grow bg-gray-50/40 relative min-h-[500px]">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pratinjau Dinonaktifkan</h3>
                <p className="text-gray-500 max-w-md text-sm">
                  Untuk menjaga integritas data dan performa, pratinjau tabel dinonaktifkan. 
                  Silakan klik tombol <b>Unduh</b> untuk melihat isi lengkap file Excel.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
