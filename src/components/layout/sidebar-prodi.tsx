'use client'

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    User,
    FileSpreadsheet,
    FileText,
    FolderOpen,
    ClipboardList,
    Calculator,
    Activity,
    Download,
    Settings,
    LogOut,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";

const navigation = [
    { name: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profil Program Studi', href: '/profil-prodi', icon: User },
    { name: 'Data LKPS', href: '#', icon: FileSpreadsheet },
    { name: 'Dokumen LED', href: '#', icon: FileText },
    { name: 'Dokumen Eviden', href: '#', icon: FolderOpen },
    { name: 'Penugasan Tim Prodi', href: '/penugasan', icon: ClipboardList },
    { name: 'Simulasi Skor Prodi', href: '#', icon: Calculator },
    { name: 'Monitoring & Evaluasi', href: '#', icon: Activity },
    { name: 'Unduh Laporan/Dokumen', href: '#', icon: Download },
    { name: 'Pengaturan', href: '#', icon: Settings },
];

export function SidebarProdi() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await apiClient.post("/auth/logout");
            localStorage.removeItem("token");
            router.push("/login");
        } catch (err: unknown) {
            const message = getErrorMessage(err) || "Gagal logout";
            console.error("Logout error:", message);
            localStorage.removeItem("token");
            router.push("/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-gray-50/40 px-4 py-6">
            <div className="mb-8 px-4">
                <h1 className="text-xl font-bold text-gray-900">Portal STEI</h1>
            </div>
            
            <nav className="flex flex-1 flex-col gap-1">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

            return (
            <Link
                key={item.name}
                href={item.href}
                className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
            >
                <Icon className="h-4 w-4" />
                {item.name}
            </Link>
            );
        })}
        </nav>

        <div className="mt-auto pt-4 border-t">
            <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-100 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isLoggingOut ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                     <LogOut className="h-4 w-4" />
                )}
                {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
        </div>
    </div>
    );
}
