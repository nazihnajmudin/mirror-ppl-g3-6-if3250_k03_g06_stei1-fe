"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Eye,
  Loader2,
  Search
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

export default function LKPSSelectorPage() {
  const [user, setUser] = useState<any>(null);
  const [prodis, setProdis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await apiClient.get('/auth/me');
        const currentUser = userRes.data.data;
        setUser(currentUser);

        // Fetch prodi yang berhak diakses oleh user ini
        const prodiRes = await apiClient.get('/prodi/my-prodi');
        const accessibleProdis = prodiRes.data.data;
        setProdis(accessibleProdis);

        // LOGIKA REDIRECT:
        // Jika bukan Admin/Pimpinan DAN hanya punya 1 prodi akses
        if (
          currentUser.role !== 'SUPER_ADMIN' && 
          currentUser.role !== 'PIMPINAN' && 
          accessibleProdis.length === 1
        ) {
          router.push(`/dashboard/lkps/${accessibleProdis[0].id}`);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const filteredProdis = prodis.filter(p => 
    p.fullname.toLowerCase().includes(search.toLowerCase()) || 
    p.abbreviation?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen LKPS Institusi</h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN' 
            ? "Pilih Program Studi untuk meninjau dokumen LKPS."
            : "Pilih Program Studi penugasan Anda untuk mengelola dokumen LKPS."}
        </p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          placeholder="Cari Program Studi..." 
          className="pl-10 h-10 bg-white border-gray-200 rounded-lg shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4">Program Studi</TableHead>
              <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProdis.map((prodi) => (
              <TableRow key={prodi.id} className="hover:bg-gray-50/40">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-900 rounded-lg text-white shadow-sm">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-gray-900 block">{prodi.fullname}</span>
                      {prodi.abbreviation && (
                        <span className="text-[11px] text-gray-500">{prodi.abbreviation}</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/dashboard/lkps/${prodi.id}`)}
                    className="h-8 text-xs font-bold gap-2"
                  >
                    <Eye className="w-4 h-4" /> Lihat LKPS
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredProdis.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-20 text-gray-500">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900">Program Studi tidak ditemukan</h3>
                  <p className="text-gray-500">Pastikan kata kunci pencarian Anda benar.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
