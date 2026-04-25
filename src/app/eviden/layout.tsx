"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProdi } from "@/components/layout/sidebar-prodi";
import { Header } from "@/components/layout/header";
import { HeaderKaprodi } from "@/components/layout/header-kaprodi";
import { useUser } from "@/hooks/useUser";

export default function EvidenLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();

    if (loading) return <div className="flex min-h-screen items-center justify-center">Memuat...</div>;

    const isProdiUser = user?.role === 'KAPRODI' || user?.role === 'TIM_PRODI';

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="w-[240px] fixed h-full bg-white border-r border-gray-200 hidden md:flex">
                {isProdiUser ? <SidebarProdi /> : <Sidebar />}
            </div>
            <main className="flex-grow md:ml-[240px] p-8 min-h-screen">
                {isProdiUser ? <HeaderKaprodi /> : <Header />}
                {children}
            </main>
        </div>
    );
}