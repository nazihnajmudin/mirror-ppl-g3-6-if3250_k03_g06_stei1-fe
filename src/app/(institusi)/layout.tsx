import { Sidebar } from "@/components/layout/sidebar";
import React from "react";

export default function InstitusiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden md:flex md:w-64 md:fixed md:h-screen md:flex-col bg-white border-r border-gray-200 overflow-y-auto">
        <Sidebar />
      </aside>
      <main className="w-full flex-1 flex flex-col md:ml-64">
        <div className="p-4 md:p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}