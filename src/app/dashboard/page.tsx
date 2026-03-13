"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// --- DUMMY DATA ---
const graphData = [
    { name: "Tenaga Listrik", score: 280, color: "bg-[#ff6b6b]" },
    { name: "Elektro", score: 400, color: "bg-[#ffd93d]" },
    { name: "STI", score: 430, color: "bg-[#20c997]" },
    { name: "IF", score: 430, color: "bg-[#20c997]" },
    { name: "Telekomunikasi", score: 260, color: "bg-[#ff6b6b]" },
];

const dataSelesai = [
    { id: 1, nama: "Sistem dan Teknologi Informasi", akreditasi: "Unggul", berlaku: "30 Desember 2027", skor: 400 },
    { id: 2, nama: "Teknik Informatika", akreditasi: "Unggul", berlaku: "28 November 2027", skor: 400 },
];

const dataProgress = [
    { id: 3, nama: "Teknik Elektro", akreditasi: "Sangat Baik", berlaku: "20 Desember 2025", lkps: 95, led: 80, skor: 370 },
    { id: 4, nama: "Teknik Tenaga Listrik", akreditasi: "Baik", berlaku: "17 Agustus 2025", lkps: 35, led: 50, skor: 150 },
    { id: 5, nama: "Teknik Telekomunikasi", akreditasi: "Baik", berlaku: "10 Juli 2024", lkps: 30, led: 30, skor: 120 },
];

export default function InstitusiDashboard() {
    const [activeTab, setActiveTab] = useState<"Selesai" | "Progress">("Selesai");

    return (
    <div className="space-y-6">
        {/* --- HEADER TITLE --- */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Beranda Institusi</h1>
            <p className="text-sm text-gray-500 mt-1">Ringkasan progress kesiapan akreditasi program studi.</p>
        </div>
        </header>

        {/* --- WIDGET SUMMARY --- */}
        <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center pb-4">
                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Program Studi</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-gray-900">5</div>
                <p className="text-sm text-gray-500 mt-2 font-medium">STEI ITB</p>
            </CardContent>
        </Card>
        
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center pb-4">
                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Prodi yang Siap</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-gray-900">3</div>
                <p className="text-sm text-gray-500 mt-2 font-medium">Progress &gt; 80%</p>
            </CardContent>
        </Card>

        <Card className="rounded-xl border border-red-100 bg-white shadow-sm overflow-hidden">
            <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center pb-4">
                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Prodi Perlu Perhatian</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-red-600">2</div>
                <p className="text-sm text-gray-500 mt-2 font-medium">Progress &lt; 50%</p>
            </CardContent>
        </Card>
        </div>

        {/* --- GRAFIK PERBANDINGAN --- */}
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center">
            <CardTitle className="text-lg font-bold text-gray-900">Grafik Perbandingan Skor Simulasi Akreditasi</CardTitle>
            <div className="flex justify-center gap-5 mt-4 text-[13px] text-gray-600 font-medium">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ff6b6b] shadow-sm"></span> Kritis</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#20c997] shadow-sm"></span> Baik</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ffd93d] shadow-sm"></span> Waspada</span>
            </div>
        </CardHeader>
        <CardContent className="px-6 py-8">
            <div className="relative h-[300px] w-full mt-2">
                {[0, 100, 200, 300, 400, 500].map((val) => (
                    <div key={val} className="absolute w-full flex items-center" style={{ bottom: `${(val / 500) * 100}%` }}>
                        <span className="text-[11px] font-bold text-gray-400 w-10 text-right mr-4">{val}</span>
                        <div className="flex-1 border-t border-dashed border-gray-200"></div>
                    </div>
                ))}
                
                <div className="absolute inset-0 ml-14 flex justify-around items-end pb-[1px]">
                    {graphData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center w-16 h-full justify-end group">
                        <div 
                        className={cn("w-14 rounded-t-md transition-all duration-700 shadow-sm group-hover:opacity-80", d.color)} 
                        style={{ height: `${(d.score / 500) * 100}%` }}
                        />
                        <span className="absolute -bottom-7 text-[11px] font-bold text-gray-500 whitespace-nowrap">{d.name}</span>
                    </div>
                    ))}
                </div>
            </div>
            <div className="h-10"></div>
        </CardContent>
        </Card>

        {/* --- TABEL STATUS KESIAPAN --- */}
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-gray-900">Status Kesiapan Program Studi</CardTitle>
            
            <div className="flex gap-1 bg-gray-100 p-1.5 rounded-full shadow-inner">
                <button
                    onClick={() => setActiveTab("Selesai")}
                    className={cn(
                    "px-5 py-1.5 text-xs font-bold rounded-full transition-all shadow-sm",
                    activeTab === "Selesai" ? "bg-[#20c997] text-white" : "bg-transparent text-gray-500 hover:text-gray-700 shadow-none"
                    )}
                >
                    Selesai
                </button>
                <button
                    onClick={() => setActiveTab("Progress")}
                    className={cn(
                        "px-5 py-1.5 text-xs font-bold rounded-full transition-all shadow-sm",
                        activeTab === "Progress" ? "bg-[#ff6b6b] text-white" : "bg-transparent text-gray-500 hover:text-gray-700 shadow-none"
                    )}
                >
                    Progress
                </button>
            </div>
        </CardHeader>
        
        <CardContent className="p-0">
            <Table>
            <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider w-[300px]">PROGRAM STUDI</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">AKREDITASI</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">BERLAKU S.D.</TableHead>
                
                {activeTab === "Progress" && (
                    <>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">PROGRESS LKPS</TableHead>
                    <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">PROGRESS LED</TableHead>
                    </>
                )}
                
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider text-right">SKOR</TableHead>
                </TableRow>
            </TableHeader>
            
            <TableBody>
                {/* RENDER TAB SELESAI */}
                {activeTab === "Selesai" && dataSelesai.map((prodi) => (
                    <TableRow key={prodi.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-900 rounded-lg text-white shadow-sm"><BookOpen className="w-4 h-4" /></div>
                                <span className="text-[14px] font-bold text-gray-900 leading-tight">{prodi.nama}</span>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-gray-100 rounded-md shadow-inner flex-shrink-0 border border-gray-200/50">
                                    <Image src="/icon/dashboard-akreditasi.svg" alt="Ikon Akreditasi" width={22} height={22} />
                                </div>
                                <span className="text-[13px] font-semibold text-gray-700">{prodi.akreditasi}</span>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <Image src="/icon/dashboard-masa-berlaku.svg" alt="Ikon Masa Berlaku" width={16} height={16} className="flex-shrink-0 opacity-70" />
                                <span className="text-[13px] text-gray-600 font-medium">{prodi.berlaku}</span>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                            <span className="text-[15px] font-bold text-gray-900">{prodi.skor}</span>
                        </TableCell>
                    </TableRow>
                ))}

                {/* RENDER TAB PROGRESS */}
                {activeTab === "Progress" && dataProgress.map((prodi) => (
                <TableRow key={prodi.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                    <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-900 rounded-lg text-white shadow-sm"><BookOpen className="w-4 h-4" /></div>
                            <span className="text-[14px] font-bold text-gray-900 leading-tight">{prodi.nama}</span>
                        </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-gray-100 rounded-md shadow-inner flex-shrink-0 border border-gray-200/50">
                            <Image src="/icon/dashboard-akreditasi.svg" alt="Ikon Akreditasi" width={22} height={22} />
                        </div>
                        <span className="text-[13px] font-semibold text-gray-700">{prodi.akreditasi}</span>
                    </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <Image src="/icon/dashboard-masa-berlaku.svg" alt="Ikon Masa Berlaku" width={16} height={16} className="flex-shrink-0 opacity-70" />
                            <span className="text-[13px] text-gray-600 font-medium">{prodi.berlaku}</span>
                        </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <Image src="/icon/dashboard-progress.svg" alt="Ikon Progress" width={16} height={16} className="flex-shrink-0 opacity-80" />
                            <span className="text-[12px] font-bold text-gray-700 w-8">{prodi.lkps}%</span>
                            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${prodi.lkps}%` }} />
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <Image src="/icon/dashboard-progress.svg" alt="Ikon Progress" width={16} height={16} className="flex-shrink-0 opacity-80" />
                            <span className="text-[12px] font-bold text-gray-700 w-8">{prodi.led}%</span>
                            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${prodi.led}%` }} />
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                        <span className="text-[15px] font-bold text-gray-900">{prodi.skor}</span>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    </div>
    );
}