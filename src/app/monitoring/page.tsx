"use client"

import React, { useEffect, useState } from "react";
import { Loader2, MessageSquare, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";

type MonitoringSummary = {
  id: string;
  documentType: string;
  documentLabel: string;
  indicatorCode: string | null;
  indicatorName: string;
  note: string;
  evaluation: string | null;
  recommendation: string | null;
  status: string;
  createdAt: string;
  prodi: { fullname: string };
  createdBy: { name: string; role: string };
};

export default function MonitoringIndexPage() {
  const [data, setData] = useState<MonitoringSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/monitoring-evaluasi/summary');
        setData(res.data?.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Gagal memuat rekap monitoring");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-0 flex gap-1"><AlertCircle className="w-3 h-3" /> Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0 flex gap-1"><Loader2 className="w-3 h-3" /> In Progress</Badge>;
      case 'RESOLVED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-0 flex gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'LKPS':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">LKPS</Badge>;
      case 'LED':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">LED</Badge>;
      case 'EVIDEN':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">EVIDEN</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoring & Evaluasi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Halaman ringkasan untuk seluruh catatan monitoring dan evaluasi dokumen akreditasi.
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm">Memuat rekap data monitoring...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Belum ada catatan</h3>
              <p className="text-sm mt-1 max-w-md text-center">Belum ada catatan monitoring atau evaluasi yang dibuat untuk program studi yang Anda akses.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[120px] py-4 text-xs font-bold uppercase tracking-wider">Dokumen</TableHead>
                    <TableHead className="w-[200px] py-4 text-xs font-bold uppercase tracking-wider">Program Studi</TableHead>
                    <TableHead className="py-4 text-xs font-bold uppercase tracking-wider">Indikator / Catatan</TableHead>
                    <TableHead className="w-[150px] py-4 text-xs font-bold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="w-[150px] py-4 text-xs font-bold uppercase tracking-wider">Waktu & Reviewer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50">
                      <TableCell className="align-top py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {getDocTypeBadge(item.documentType)}
                          <span className="text-[11px] text-gray-500 font-medium line-clamp-2" title={item.documentLabel}>
                            {item.documentLabel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <span className="text-sm font-medium text-gray-700">{item.prodi.fullname}</span>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                              {item.indicatorCode ? `${item.indicatorCode} - ` : ''}{item.indicatorName}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 bg-blue-50/50 p-3 rounded-md border border-blue-100">
                            <div className="flex gap-2 items-start">
                              <FileText className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <p className="whitespace-pre-wrap leading-relaxed">{item.note}</p>
                            </div>
                          </div>
                          {(item.evaluation || item.recommendation) && (
                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
                              {item.evaluation && (
                                <div className="mb-2">
                                  <strong className="text-gray-700 block mb-1">Evaluasi:</strong>
                                  <p>{item.evaluation}</p>
                                </div>
                              )}
                              {item.recommendation && (
                                <div>
                                  <strong className="text-gray-700 block mb-1">Rekomendasi:</strong>
                                  <p>{item.recommendation}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500">
                            {new Intl.DateTimeFormat("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            }).format(new Date(item.createdAt))}
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            Oleh: {item.createdBy.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {item.createdBy.role.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
