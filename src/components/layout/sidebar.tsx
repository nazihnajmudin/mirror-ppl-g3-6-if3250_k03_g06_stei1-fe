'use client'

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Database,
    Activity,
    Calculator,
    Download,
    Users,
    Settings,
    LogOut,
    Loader2,
    FileText,
    ChevronDown,
    User,
    FolderOpen,
    ClipboardList,
    FileSpreadsheet,
    Shield,
    Layout,
    Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { useUser } from "@/hooks/useUser";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useUser();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    // Accordion state
    const [expanded, setExpanded] = useState<'umum' | 'prodi' | null>(null);

    // Auto-expand accordions based on current path
    useEffect(() => {
        const umumPaths = ['/manajemen-akun', '/dashboard/manajemen-sertifikat'];
        const prodiPaths = ['/profil-prodi', '/penugasan'];
        
        if (umumPaths.some(p => pathname.startsWith(p))) {
            setExpanded('umum');
        } else if (prodiPaths.some(p => pathname.startsWith(p))) {
            setExpanded('prodi');
        }
    }, [pathname]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await apiClient.post("/auth/logout");
            localStorage.removeItem("access_token");
            localStorage.removeItem("accessToken");
            router.push("/login");
        } catch (err: unknown) {
            const message = getErrorMessage(err) || "Gagal logout";
            console.error("Logout error:", message);
            localStorage.removeItem("access_token");
            localStorage.removeItem("accessToken");
            router.push("/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const toggleSection = (section: 'umum' | 'prodi') => {
        setExpanded(expanded === section ? null : section);
    };

    const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        const hasUnsavedChanges = sessionStorage.getItem('unsavedChanges') === 'true';
        if (hasUnsavedChanges) {
            const confirmLeave = window.confirm("Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?");
            if (!confirmLeave) {
                e.preventDefault(); // Batalkan navigasi
            } else {
                sessionStorage.removeItem('unsavedChanges'); // Bersihkan flag jika user setuju pergi
            }
        }
    };

    const isSuperOrPimpinan = user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN';

    // Style constants
    const globalItemClass = "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 mb-1";
    const activeGlobalClass = "bg-gray-900 text-white shadow-md";
    const inactiveGlobalClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

    const parentToggleClass = "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 mb-1";
    const activeParentClass = "bg-blue-600 text-white shadow-md";
    const inactiveParentClass = "text-gray-700 bg-gray-50 hover:bg-gray-100";
    
    const submenuBaseClass = "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ml-4 mb-1";
    const activeSubmenuClass = "bg-blue-100/50 text-blue-700 border-l-4 border-blue-600 font-bold";
    const inactiveSubmenuClass = "text-gray-500 hover:bg-gray-50 hover:text-gray-900";

    return (
        <div className="flex h-screen w-full flex-col border-r bg-white px-4 py-6 shadow-sm overflow-hidden">
            {/* BRANDING */}
            <Link href="/dashboard" className="mb-8 px-4 flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Portal STEI</h1>
            </Link>
            
            <nav className="flex flex-1 flex-col overflow-y-auto pr-2 custom-scrollbar">
                
                {/* 1. SHARED ITEMS (MUTUAL) - TOP LEVEL */}
                <div className="space-y-1">
                    {isSuperOrPimpinan && (
                        <Link href="/dashboard" className={cn(globalItemClass, (pathname === '/dashboard' || pathname === '/') ? activeGlobalClass : inactiveGlobalClass)}>
                            <LayoutDashboard className="h-4 w-4" />
                            Beranda
                        </Link>
                    )}
                    <Link href="/prodi-saya" className={cn(globalItemClass, (pathname === '/prodi-saya' || pathname.startsWith('/dashboard-prodi')) ? activeGlobalClass : inactiveGlobalClass)}>
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard Prodi
                    </Link>
                    <Link href="/dashboard/lkps" className={cn(globalItemClass, pathname.startsWith('/dashboard/lkps') ? activeGlobalClass : inactiveGlobalClass)}>
                        <FileSpreadsheet className="h-4 w-4" />
                        LKPS
                    </Link>
                    <Link href="/led" className={cn(globalItemClass, pathname === '/led' ? activeGlobalClass : inactiveGlobalClass)}>
                        <FileText className="h-4 w-4" />
                        LED
                    </Link>
                    <Link href="/template-dokumen" className={cn(globalItemClass, pathname.startsWith('/template-dokumen') ? activeGlobalClass : inactiveGlobalClass)}>
                        <FileText className="h-4 w-4" />
                        Template Dokumen
                    </Link>
                    <Link href="#" className={cn(globalItemClass, inactiveGlobalClass)}>
                        <Activity className="h-4 w-4" />
                        Monitoring & Evaluasi
                    </Link>
                    <Link href="#" className={cn(globalItemClass, inactiveGlobalClass)}>
                        <Download className="h-4 w-4" />
                        Unduh Laporan/Dokumen
                    </Link>
                </div>

                <div className="my-4 border-t border-gray-100" />

                {/* 2. MENU UMUM (UNIQUE TO ADMIN/PIMPINAN) */}
                {isSuperOrPimpinan && (
                    <div className="mb-2">
                        <button
                            onClick={() => toggleSection('umum')}
                            className={cn(parentToggleClass, expanded === 'umum' ? activeParentClass : inactiveParentClass)}
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4" />
                                <span>Menu Umum</span>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", expanded === 'umum' && "rotate-180")} />
                        </button>
                        <div className={cn("overflow-hidden transition-all duration-300", expanded === 'umum' ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0")}>
                            <Link href="#" className={cn(submenuBaseClass, inactiveSubmenuClass)}>
                                <Calculator className="h-4 w-4" />
                                Simulasi Skor Akreditasi
                            </Link>
                            <Link href="/manajemen-akun" className={cn(submenuBaseClass, pathname.startsWith('/manajemen-akun') ? activeSubmenuClass : inactiveSubmenuClass)}>
                                <Users className="h-4 w-4" />
                                Manajemen Akun
                            </Link>
                            <Link href="/dashboard/manajemen-sertifikat" className={cn(submenuBaseClass, pathname.startsWith('/dashboard/manajemen-sertifikat') ? activeSubmenuClass : inactiveSubmenuClass)}>
                                <Award className="h-4 w-4" />
                                Manajemen Sertifikat
                            </Link>
                            <Link href="/data-institusi" className={cn(submenuBaseClass, pathname.startsWith('/data-institusi') ? activeSubmenuClass : inactiveSubmenuClass)}>
                                <Database className="h-4 w-4" />
                                Pusat Data Institusi
                            </Link>
                        </div>
                    </div>
                )}

                {/* 3. MENU PRODI (UNIQUE TO PRODI OPERATIONS) */}
                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('prodi')}
                        className={cn(parentToggleClass, expanded === 'prodi' ? activeParentClass : inactiveParentClass)}
                    >
                        <div className="flex items-center gap-3">
                            <Layout className="h-4 w-4" />
                            <span>Menu Prodi</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", expanded === 'prodi' && "rotate-180")} />
                    </button>
                    <div className={cn("overflow-hidden transition-all duration-300", expanded === 'prodi' ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0")}>
                        <Link href="/profil-prodi" className={cn(submenuBaseClass, pathname === '/profil-prodi' ? activeSubmenuClass : inactiveSubmenuClass)}>
                            <User className="h-4 w-4" />
                            Profil Program Studi
                        </Link>
                        <Link href="/eviden" className={cn(submenuBaseClass, inactiveSubmenuClass)}>
                            <FolderOpen className="h-4 w-4" />
                            Dokumen Eviden
                        </Link>
                        <Link href="/penugasan" className={cn(submenuBaseClass, pathname === '/penugasan' ? activeSubmenuClass : inactiveSubmenuClass)}>
                            <ClipboardList className="h-4 w-4" />
                            Penugasan Tim Prodi
                        </Link>
                        <Link href="#" className={cn(submenuBaseClass, inactiveSubmenuClass)}>
                            <Calculator className="h-4 w-4" />
                            Simulasi Skor Prodi
                        </Link>
                    </div>
                </div>

                {/* 4. SHARED BOTTOM ITEMS */}
                <div className="mt-auto pt-4 space-y-1">
                    <Link href="#" className={cn(globalItemClass, inactiveGlobalClass)}>
                        <Settings className="h-4 w-4" />
                        Pengaturan
                    </Link>
                    <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                        {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                        {isLoggingOut ? "Keluar..." : "Log Out"}
                    </button>
                </div>
            </nav>
        </div>
    );
}
