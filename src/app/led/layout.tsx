import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function LedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
    <div className="flex min-h-screen bg-gray-50">
        <div className="w-[240px] fixed h-full bg-white border-r border-gray-200 hidden md:flex items-center justify-center text-gray-400 text-sm font-medium">
          <Sidebar/>
        </div>

        <main className="flex-grow md:ml-[240px] p-8 min-h-screen">
            <Header />
            {children}
        </main>
    </div>
    );
}