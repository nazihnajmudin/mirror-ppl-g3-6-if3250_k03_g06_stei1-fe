"use client"

import { useAuthGuard } from "@/hooks/useAuthGuard"
import { Sidebar } from "@/components/layout/sidebar"
import { WarningBanner } from "@/components/WarningBanner"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

export default function DashboardProdiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useAuthGuard()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="hidden md:flex md:w-64 md:fixed md:h-screen md:flex-col bg-white border-r border-gray-200 overflow-y-auto">
                <Sidebar/>
            </aside>
            <main className="w-full flex-1 flex flex-col md:ml-64">
                <WarningBanner />
                <div className="md:hidden h-16" />
                <div className="p-4 md:p-8 min-h-screen">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
