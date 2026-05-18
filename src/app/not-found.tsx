import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 px-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <FileQuestion className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
          <h2 className="text-xl font-semibold text-gray-700">Halaman Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
