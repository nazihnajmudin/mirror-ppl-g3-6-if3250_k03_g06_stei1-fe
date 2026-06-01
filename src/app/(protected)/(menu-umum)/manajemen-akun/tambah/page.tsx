"use client"

import React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { AccountCreateForm } from "@/features/manajemen-akun/components/AccountCreateForm"

export default function TambahPenggunaPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/manajemen-akun" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors group">
        <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
        Kembali ke Manajemen Akun
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Data akun mengikuti schema backend.</p>
      </header>

      <AccountCreateForm />
    </div>
  )
}