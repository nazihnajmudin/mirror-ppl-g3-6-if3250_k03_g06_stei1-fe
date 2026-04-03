"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ArrowRight,
  Loader2,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen LKPS</h1>
        <p className="text-gray-500 mt-2 text-lg">
          {user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN' 
            ? "Pilih Program Studi untuk meninjau dokumen LKPS."
            : "Pilih Program Studi penugasan Anda untuk mengelola dokumen LKPS."}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input 
          placeholder="Cari Program Studi..." 
          className="pl-12 h-14 bg-white border-gray-200 rounded-2xl shadow-sm text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProdis.map((prodi) => (
          <Card 
            key={prodi.id} 
            className="group hover:shadow-xl transition-all duration-300 border-gray-200 overflow-hidden cursor-pointer rounded-2xl"
            onClick={() => router.push(`/dashboard/lkps/${prodi.id}`)}
          >
            <CardHeader className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 p-6">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <Badge className="bg-blue-50 text-blue-700 border-none font-bold px-3 py-1 rounded-full">{prodi.degree || "S1"}</Badge>
              </div>
              <CardTitle className="mt-4 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {prodi.fullname}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Akses LKPS</span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProdis.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Program Studi tidak ditemukan</h3>
          <p className="text-gray-500">Anda tidak memiliki akses ke Program Studi manapun.</p>
        </div>
      )}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", className)}>
      {children}
    </span>
  );
}
