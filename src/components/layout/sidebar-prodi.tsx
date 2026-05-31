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
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const TOKEN_KEY = "access_token";
const LEGACY_TOKEN_KEY = "accessToken";

export function SidebarProdi() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    const navigation = [
        { name: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Dashboard Prodi', href: '/prodi-saya', icon: LayoutDashboard },
        { name: 'Profil Program Studi', href: '/profil-prodi', icon: User },
        { name: 'Data LKPS', href: '/dashboard/lkps', icon: FileSpreadsheet },
        { name: 'Dokumen LED', href: '/led', icon: FileText }, 
        { name: 'Dokumen Eviden', href: '/eviden', icon: FolderOpen },
        { name: 'Penugasan Tim Prodi', href: '/penugasan', icon: ClipboardList },
        { name: 'Simulasi Skor Prodi', href: user?.prodiId ? `/simulasi-skor-prodi/${user.prodiId}` : '#', icon: Calculator },
        { name: 'Monitoring & Evaluasi', href: '/monitoring', icon: Activity },
        { name: 'Unduh Laporan/Dokumen', href: '#', icon: Download },
        { name: 'Manajemen Akun', href: '/manajemen-akun', icon: Users, roleRequired: ['SUPER_ADMIN', 'PIMPINAN'] },
        { name: 'Pengaturan', href: '/settings', icon: Settings, roleRequired: ['SUPER_ADMIN'] },
        { name: 'Template Dokumen', href: '/template-dokumen', icon: FileText },
    ];

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (err: unknown) {
            const message = getErrorMessage(err) || "Gagal logout";
            console.error("Logout error:", message);
        } finally {
            setIsLoggingOut(false);
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
            e.preventDefault();
            setPendingHref(href);
            setConfirmOpen(true);
        }
    };

    const handleConfirmLeave = () => {
        sessionStorage.removeItem('unsavedChanges');
        setConfirmOpen(false);
        if (pendingHref) router.push(pendingHref);
        setPendingHref(null);
    };

    const handleCancelLeave = () => {
        setConfirmOpen(false);
        setPendingHref(null);
    };

    return (
        <>
        <ConfirmDialog
            open={confirmOpen}
            title="Tinggalkan halaman?"
            description="Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?"
            confirmLabel="Tinggalkan"
            cancelLabel="Batal"
            onConfirm={handleConfirmLeave}
            onCancel={handleCancelLeave}
        />
        <div className="flex h-screen w-64 flex-col border-r bg-white px-4 py-6 shadow-sm overflow-y-auto">
            <Link href="/dashboard" className="mb-8 px-4 flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Portal STEI</h1>
            </Link>

            <nav className="flex flex-1 flex-col gap-1">
                {filteredNavigation.map((item) => {
                    const Icon = item.icon;
                    const hrefPath = item.href.split('?')[0];
                    let isActive = hrefPath !== '#' && (pathname === hrefPath || pathname.startsWith(hrefPath + '/'));

                    if (hrefPath === "/dashboard/lkps" && (pathname.startsWith("/lkps") || pathname.startsWith("/dashboard/lkps"))) {
                        isActive = true;
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={(e) => handleNavigation(e, item.href)}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 mb-1",
                                isActive
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    );
                })}
        </nav>

        <div className="mt-auto pt-4 space-y-1">
            <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
            >
                {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                {isLoggingOut ? "Keluar..." : "Log Out"}
            </button>
        </div>
    </div>
        </>
    );
}
