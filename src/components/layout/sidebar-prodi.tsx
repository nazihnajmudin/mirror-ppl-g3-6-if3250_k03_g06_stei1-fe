'use client'

import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

    return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50/40 px-4 py-6">
        <div className="mb-8 px-4">
        <h1 className="text-xl font-bold text-gray-900">Portal STEI</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

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
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
        </button>
        </div>
    </div>
    );
}
