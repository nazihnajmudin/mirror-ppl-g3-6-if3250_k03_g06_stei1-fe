import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
    <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar statis di kiri */}
        <Sidebar />
        
        {/* Area konten utama */}
        <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto px-8 py-6">
            <Header />
            {children}
        </main>
        </div>
    </div>
    );
}