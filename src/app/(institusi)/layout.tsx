import { Sidebar } from "@/components/layout/sidebar";
import React from "react";

export default function InstitusiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar - Fix di sisi kiri */}
      <aside className="w-72 fixed inset-y-0 z-20">
        <Sidebar />
      </aside>
      
      {/* Konten Utama - Beri margin kiri sebesar lebar sidebar */}
      <main className="flex-1 ml-72 p-8">
        {children}
      </main>
    </div>
  );
}