"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import LKPSFormBuilder from "@/components/lkps/form-builder";

interface SheetData {
  sheetName: string;
  sheetTitle: string;
  criteriaId: string;
  criteriaCode: string;
  criteriaName: string;
  isCompleted: boolean;
}

interface SheetConfig {
  sheetName: string;
  sheetTitle: string;
  columns: any[];
  rowType: 'free' | 'fixed';
  fixedRows?: string[];
}

export default function LKPSFormPage({ 
  params 
}: { 
  params: Promise<{ prodiId: string }> 
}) {
  const resolvedParams = React.use(params);
  const prodiId = resolvedParams.prodiId;
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(null);
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const currentSheet = sheets[currentSheetIndex];

  // Load document sheets
  useEffect(() => {
    if (!documentId) return;

    const loadSheets = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/lkps/document/${documentId}/sheets`);
        setSheets(res.data.data.sheets);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Gagal memuat daftar sheet",
          variant: "destructive"
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadSheets();
  }, [documentId, toast]);

  // Load sheet config and data when current sheet changes
  useEffect(() => {
    if (!currentSheet) return;

    const loadSheetData = async () => {
      try {
        setLoading(true);
        
        // Get sheet config
        const configRes = await apiClient.get(`/lkps/config/${currentSheet.sheetName}`);
        console.log('Config API Response:', configRes.data.data);
        setSheetConfig(configRes.data.data);
        
        // Get sheet data
        const dataRes = await apiClient.get(
          `/lkps/sheet/${currentSheet.criteriaId}/${currentSheet.sheetName}`
        );
        setSheetData(dataRes.data.data.data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Gagal memuat data sheet",
          variant: "destructive"
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadSheetData();
  }, [currentSheet, toast]);

  // Auto-save handler
  const handleAutoSave = useCallback(async (newData: any[]) => {
    if (!currentSheet) return;

    try {
      await apiClient.put(
        `/lkps/sheet/${currentSheet.criteriaId}/${currentSheet.sheetName}/autosave`,
        { data: newData }
      );
      
      const now = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setLastSaved(now);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [currentSheet]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sheetData.length > 0) {
        handleAutoSave(sheetData);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [sheetData, handleAutoSave]);

  // Save draft
  const handleSaveDraft = async () => {
    if (!documentId) return;

    try {
      setSaving(true);
      await apiClient.post(`/lkps/document/${documentId}/save-draft`);
      
      toast({
        title: "Success",
        description: "Dokumen berhasil disimpan sebagai draft"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menyimpan draft",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Finalize document
  const handleFinalize = async () => {
    if (!documentId) return;

    try {
      setSaving(true);
      await apiClient.post(`/lkps/document/${documentId}/finalize`);
      
      toast({
        title: "Success",
        description: "Dokumen LKPS berhasil difinalisasi"
      });

      setTimeout(() => {
        router.push(`/dashboard/lkps/${prodiId}`);
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menfinalisasi dokumen",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Mark sheet as completed
  const handleMarkCompleted = async () => {
    if (!currentSheet) return;

    try {
      await apiClient.post(
        `/lkps/sheet/${currentSheet.criteriaId}/${currentSheet.sheetName}/complete`
      );

      // Update local state
      setSheets(sheets.map((s, i) => 
        i === currentSheetIndex ? { ...s, isCompleted: true } : s
      ));

      toast({
        title: "Success",
        description: "Sheet berhasil ditandai selesai"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menandai sheet selesai",
        variant: "destructive"
      });
    }
  };

  // Navigation
  const goToPreviousSheet = () => {
    if (currentSheetIndex > 0) {
      setCurrentSheetIndex(currentSheetIndex - 1);
    }
  };

  const goToNextSheet = () => {
    if (currentSheetIndex < sheets.length - 1) {
      setCurrentSheetIndex(currentSheetIndex + 1);
    }
  };

  if (loading && sheets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <div className="p-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Tidak ada sheet ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = sheets.filter(s => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / sheets.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {currentSheet?.criteriaName}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentSheet?.sheetTitle}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Menyimpan..." : "Simpan Draft"}
            </Button>

            <Button
              size="sm"
              onClick={handleFinalize}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {saving ? "Memproses..." : "Finalisasi"}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress Pengisian</span>
              <span className="text-sm text-gray-600">
                {completedCount} / {sheets.length} sheets
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{progressPercent}% selesai</p>
          </div>
        </CardContent>
      </Card>

      {/* Sheet List / Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daftar Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sheets.map((sheet, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSheetIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      idx === currentSheetIndex
                        ? 'bg-blue-100 text-blue-900 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{sheet.sheetName}</span>
                      {sheet.isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{currentSheet?.sheetTitle}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Kriteria {currentSheet?.criteriaCode}: {currentSheet?.criteriaName}
                  </p>
                </div>
                {currentSheet?.isCompleted && (
                  <Badge className="bg-green-100 text-green-800">
                    Selesai
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : sheetConfig ? (
                <div className="space-y-6">
                  <LKPSFormBuilder
                    config={sheetConfig}
                    data={sheetData}
                    onChange={setSheetData}
                  />

                  {/* Last Saved Indicator */}
                  {lastSaved && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t">
                      <CheckCircle2 className="w-3 h-3" />
                      Last saved: {lastSaved}
                    </div>
                  )}

                  {/* Mark Completed Button */}
                  <div className="pt-4 border-t">
                    <Button
                      variant={currentSheet?.isCompleted ? "outline" : "default"}
                      onClick={handleMarkCompleted}
                      disabled={currentSheet?.isCompleted}
                      className="w-full"
                    >
                      {currentSheet?.isCompleted 
                        ? "✓ Sheet Selesai" 
                        : "Tandai Selesai"}
                    </Button>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={goToPreviousSheet}
                      disabled={currentSheetIndex === 0}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Sheet Sebelumnya
                    </Button>

                    <Button
                      variant="outline"
                      onClick={goToNextSheet}
                      disabled={currentSheetIndex === sheets.length - 1}
                      className="flex-1"
                    >
                      Sheet Berikutnya
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>Gagal memuat konfigurasi sheet</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
