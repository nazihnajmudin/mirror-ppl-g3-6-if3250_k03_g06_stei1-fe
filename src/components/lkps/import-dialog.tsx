"use client"

import React, { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ImportDialogProps {
  prodiId?: string;
  onImportSuccess: () => void;
  defaultPeriode?: string;
}

export function ImportDialog({ prodiId, onImportSuccess, defaultPeriode }: ImportDialogProps) {
  const currentYear = new Date().getFullYear().toString();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [periode, setPeriode] = useState(defaultPeriode || currentYear);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("name", `Revisi LKPS - ${file.name}`);
    formData.append("periode", periode);
    if (prodiId) {
      formData.append("prodiId", prodiId);
    }
    formData.append("file", file);

    try {
      await apiClient.post("/lkps/confirm", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Berhasil",
        description: `File LKPS periode ${periode} telah berhasil diupload.`,
      });
      
      setOpen(false);
      setFile(null);
      onImportSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Upload",
        description: error.response?.data?.message || "Terjadi kesalahan saat mengupload file.",
      });
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - 5 + i).toString()).reverse();

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setFile(null); }}>
      <DialogTrigger 
        render={
          <Button className="w-full mt-2 bg-[#020617] hover:bg-[#020617]/90 text-white font-bold py-6 rounded-xl shadow-md transition-all">
            Upload Revisi LKPS
          </Button>
        } 
      />
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Upload File LKPS Baru (.xlsx)</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Periode Akreditasi
            </label>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-full bg-white border-gray-200">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group relative">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">
                {file ? file.name : "Klik atau drag file Excel ke sini"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Hanya file .xlsx atau .xls</p>
            </div>
          </div>
          
          <Button 
            disabled={!file || loading} 
            onClick={handleUpload}
            className="w-full py-6 font-bold bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <FileSpreadsheet className="mr-2" />}
            {loading ? "Sedang Mengupload..." : "Upload Sekarang"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
