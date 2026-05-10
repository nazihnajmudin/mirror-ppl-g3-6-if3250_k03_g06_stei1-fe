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
    Loader2,
    Database,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { useUser } from "@/hooks/useUser";

const TOKEN_KEY = "access_token";
const LEGACY_TOKEN_KEY = "accessToken";

export function SidebarProdi() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useUser();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const navigation = [
        { name: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Dashboard Prodi', href: '/prodi-saya', icon: LayoutDashboard },
        { name: 'Profil Program Studi', href: '/profil-prodi', icon: User },
        { name: 'Data LKPS', href: '/dashboard/lkps', icon: FileSpreadsheet },
        { name: 'Dokumen LED', href: '/led', icon: FileText }, 
        { name: 'Dokumen Eviden', href: '/eviden', icon: FolderOpen },
        { name: 'Penugasan Tim Prodi', href: '/penugasan', icon: ClipboardList },
        { name: 'Simulasi Skor Prodi', href: user?.prodiId ? `/simulasi-skor-prodi/${user.prodiId}` : '#', icon: Calculator },
        { name: 'Monitoring & Evaluasi', href: '#', icon: Activity },
        { name: 'Unduh Laporan/Dokumen', href: '#', icon: Download },
        { name: 'Manajemen Akun', href: '/manajemen-akun', icon: Users, roleRequired: ['SUPER_ADMIN', 'PIMPINAN'] },
        { name: 'Pengaturan', href: '/settings', icon: Settings, roleRequired: ['SUPER_ADMIN'] },
        { name: 'Template Dokumen', href: '/template-dokumen', icon: FileText },
    ];

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await apiClient.post("/auth/logout");
        } catch (err: unknown) {
            const message = getErrorMessage(err) || "Gagal logout";
            console.error("Logout error:", message);
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(LEGACY_TOKEN_KEY);
            setIsLoggingOut(false);
            router.push("/login");
        }
    };

    // Filter navigation based on user role
    const filteredNavigation = navigation.filter(item => {
        if (!item.roleRequired) return true;
        if (!user) return false;
        return (item.roleRequired as string[]).includes(user.role);
    });

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

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-gray-50/40 px-4 py-6 overflow-y-auto">
            <div className="mb-8 px-4">
                <h1 className="text-xl font-bold text-gray-900">Portal STEI</h1>
            </div>
            
            <nav className="flex flex-1 flex-col gap-1">
                {filteredNavigation.map((item) => {
                    const Icon = item.icon;
                    const hrefPath = item.href.split('?')[0];
                    const isActive = hrefPath !== '#' && (pathname === hrefPath || pathname.startsWith(hrefPath + '/'));

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
