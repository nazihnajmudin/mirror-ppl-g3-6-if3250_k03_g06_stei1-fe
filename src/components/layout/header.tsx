'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
    LayoutDashboard, 
    BookOpen, 
    Database, 
    Activity, 
    Calculator, 
    Download, 
    Users, 
    Settings, 
    LogOut,
    Menu,
    X,
    Bell,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/hooks/useUser";
import { NotificationBell } from "@/components/NotificationBell"

const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    PIMPINAN: "Pimpinan",
    KAPRODI: "Kaprodi",
    TIM_PRODI: "Tim Prodi",
};

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
}

const navigation = [
    { name: 'Beranda', href: '/dashboard', icon: LayoutDashboard},
    { name: 'Dashboard Prodi', href: '/prodi-saya', icon: BookOpen},
    { name: 'LKPS', href: '/dashboard/lkps', icon: Database},
    { name: 'LED', href: '/led', icon: FileText},
    { name: 'Data Kuantitatif Institusi', href: '#', icon: Database},
    { name: 'Monitoring & Evaluasi', href: '#', icon: Activity},
    { name: 'Simulasi Skor Akreditasi', href: '/simulasi-skor', icon: Calculator},
    { name: 'Unduh Laporan/Dokumen', href: '#', icon: Download},
    { name: 'Manajemen Akun', href: '/manajemen-akun', icon: Users},
    { name: 'Pengaturan', href: '#', icon: Settings},
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useUser();

    const displayName = user?.name || user?.email || "Memuat..."
    const displayRole = user ? (roleLabel[user.role] ?? user.role) : "Memuat..."
    const initials = user?.name ? getInitials(user.name) : "—"

    return (
        <>
            {/* Mobile Header with Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {mobileMenuOpen ? (
                        <X className="h-6 w-6 text-gray-700" />
                    ) : (
                        <Menu className="h-6 w-6 text-gray-700" />
                    )}
                </button>
                <h1 className="text-lg font-bold text-gray-900">Portal STEI</h1>
                <div className="w-10" />
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-30 top-16"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Navigation */}
            <nav className={cn(
                "fixed md:hidden left-0 top-16 w-64 h-[calc(100vh-64px)] bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 z-30",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col gap-1 p-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
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
                </div>
                
                <div className="mt-auto p-4 border-t border-gray-200">
                    <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </nav>

            {/* Desktop Header */}
            <div className="hidden md:flex justify-end items-center gap-6 mb-8">
                <NotificationBell />
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[14px] font-bold text-gray-900 leading-tight">{displayName}</span>
                        <span className="text-[13px] text-gray-500">{displayRole}</span>
                    </div>
                    <Avatar className="w-10 h-10 border border-gray-100 shadow-sm">
                        <AvatarImage src="" alt="Profile" />
                        <AvatarFallback className="bg-blue-50 text-blue-600 text-[13px] font-bold">{initials}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </>
    );
}
