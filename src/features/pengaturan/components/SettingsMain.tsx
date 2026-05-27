"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, RefreshCw, AlertCircle, ShieldCheck } from "lucide-react"
import { getDisplayName, getDescription } from "../utils"

export function SettingsMain({ logic }: { logic: any }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Kelola konfigurasi early warning dan notifikasi sistem</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Mode Admin</span>
        </div>
      </header>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
          <CardTitle className="text-lg font-bold">Konfigurasi Early Warning</CardTitle>
          <CardDescription className="text-sm">Tentukan nilai ambang batas (threshold) untuk pemicu otomatis.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-6 space-y-6">
          {logic.thresholds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 font-medium">Belum ada konfigurasi. Hubungi developer.</p>
            </div>
          ) : (
            logic.thresholds.map((t: any) => (
              <div key={t.id} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="md:col-span-2">
                  <Label className="text-sm font-bold text-gray-900">{getDisplayName(t.name)}</Label>
                  <p className="text-xs text-gray-500 mt-1">{getDescription(t.name)}</p>
                </div>
                <div className="md:col-span-1">
                  <Input 
                    type="number" 
                    defaultValue={t.value}
                    onBlur={(e) => {
                      if (parseInt(e.target.value) !== t.value) {
                        logic.handleUpdateThreshold(t.name, e.target.value)
                      }
                    }}
                    className="h-11 bg-gray-50/50 border-gray-200 rounded-lg font-bold"
                  />
                </div>
                <div className="flex justify-end">
                  {logic.saving === t.name ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <Save className="w-4 h-4 text-gray-300" />
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-orange-100 bg-orange-50/30 shadow-none">
        <CardHeader className="px-6 py-5 border-b border-orange-100">
          <CardTitle className="text-lg font-bold text-orange-900">Operasi Manual</CardTitle>
          <CardDescription className="text-orange-700/70 text-sm">
            Jalankan pemeriksaan sistem secara manual tanpa menunggu jadwal otomatis harian.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Button 
            onClick={logic.handleTriggerEarlyWarning} 
            disabled={logic.triggering}
            variant="outline"
            className="border-orange-200 hover:bg-orange-100 text-orange-700 rounded-lg h-10 px-5 font-bold"
          >
            {logic.triggering ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Jalankan Early Warning Sekarang
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}