'use client'

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
    LayoutDashboard, 
    Database, 
    BookOpen, 
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
    Building2
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
    const [expanded, setExpanded] = useState<'institusi' | 'prodi' | null>(null);

    // Auto-expand based on current pathname
    useEffect(() => {
        if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/lkps')) {
            setExpanded('institusi');
        } else if (pathname.startsWith('/prodi-saya') || pathname.startsWith('/dashboard/lkps') || pathname.startsWith('/led') || pathname.startsWith('/profil-prodi') || pathname.startsWith('/penugasan')) {
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

    const toggleSection = (section: 'institusi' | 'prodi') => {
        setExpanded(expanded === section ? null : section);
    };

    // Style constants
    const activeParentClass = "bg-gray-900 text-white shadow-md";
    const inactiveParentClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    const submenuBaseClass = "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ml-4 mb-1";
    const activeSubmenuClass = "bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold";
    const inactiveSubmenuClass = "text-gray-500 hover:bg-gray-50 hover:text-gray-900";

    const isSuperOrPimpinan = user?.role === 'SUPER_ADMIN' || user?.role === 'PIMPINAN';

    return (
        <div className="flex h-screen w-full flex-col border-r bg-white px-4 py-6 shadow-sm overflow-hidden">
            <div className="mb-10 px-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Portal STEI</h1>
            </div>
            
            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* GRUP 1: INSTITUSI (BERANDA) */}
                <div className="space-y-1">
                    <button
                        onClick={() => toggleSection('institusi')}
                        className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300",
                            expanded === 'institusi' ? activeParentClass : inactiveParentClass
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5" />
                            <span>Menu Institusi</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", expanded === 'institusi' && "rotate-180")} />
                    </button>

                    <div className={cn(
                        "overflow-hidden transition-all duration-500 ease-in-out",
                        expanded === 'institusi' ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                    )}>
                        <Link href="/dashboard" className={cn(submenuBaseClass, pathname === '/dashboard' ? activeSubmenuClass : inactiveSubmenuClass)}>
                            <LayoutDashboard className="h-4 w-4" />
                            Beranda Utama
                        </Link>
                        <Link href="#" className={cn(submenuBaseClass, inactiveSubmenuClass)}>
                            <Database className="h-4 w-4" />
                            Data Kuantitatif
                        </Link>
                        <Link href="#" className={cn(submenuBaseClass, inactiveSubmenuClass)}>
                            <Activity className="h-4 w-4" />
                            Monitoring Global
                        </Link>
                        <Link href="#" className={cn(submenuBaseClass, inactiveSubmenuClass)}>
                            <Calculator className="h-4 w-4" />
                            Skor Akreditasi
                        </Link>
                    </div>
                </div>

                {/* GRUP 2: PROGRAM STUDI (DASHBOARD PRODI) */}
                <div className="space-y-1 mt-2">
                    <button
                        onClick={() => toggleSection('prodi')}
                        className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300",
                            expanded === 'prodi' ? activeParentClass : inactiveParentClass
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5" />
                            <span>Menu Operasional</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", expanded === 'prodi' && "rotate-180")} />
                    </button>

                    <div className={cn(
                        "overflow-hidden transition-all duration-500 ease-in-out",
                        expanded === 'prodi' ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
                    )}>
                        <Link href="/prodi-saya" className={cn(submenuBaseClass, pathname === '/prodi-saya' ? activeSubmenuClass : inactiveSubmenuClass)}>
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard Prodi
                        </Link>
                        <Link href="/profil-prodi" className={cn(submenuBaseClass, pathname === '/profil-prodi' ? activeSubmenuClass : inactiveSubmenuClass)}>
                            <User className="h-4 w-4" />
                            Profil Prodi
                        </Link>
                        <Link href="/dashboard/lkps" className={cn(submenuBaseClass, pathname.startsWith('/dashboard/lkps') ? activeSubmenuClass : inactiveSubmenuClass)}>
                            <Database className="h-4 w-4" />
                            Data LKPS
                        </Link>
                        <Link href="/led" className={cn(submenuBaseClass, pathname === '/led' ? activeSubmenuClass : inactiveSubmenuClass)}>
                            <FileText className="h-4 w-4" />
                            Dokumen LED
                        </Link>
                        <Link href="/penugasan" className={cn(submenuBaseClass, pathname === '/penugasan' ? activeSubmenuClass : inactiveSubmenuClass)}>
                            <ClipboardList className="h-4 w-4" />
                            Penugasan Tim
                        </Link>
                    </div>
                </div>

                {/* MENU GLOBAL (TIDAK MASUK ACCORDION) */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-1">
                    {isSuperOrPimpinan && (
                        <Link
                            href="/manajemen-akun"
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                                pathname.startsWith('/manajemen-akun') ? activeParentClass : inactiveParentClass
                            )}
                        >
                            <Users className="h-5 w-5" />
                            Manajemen Akun
                        </Link>
                    )}
                    <Link
                        href="#"
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                            inactiveParentClass
                        )}
                    >
                        <Settings className="h-5 w-5" />
                        Pengaturan
                    </Link>
                </div>
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-100">
                <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                >
                    {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                    {isLoggingOut ? "Keluar..." : "Log Out"}
                </button>
            </div>
        </div>
    );
}
