"use client"

import React from "react"
import Link from "next/link"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountTable } from "@/features/manajemen-akun/components/AccountTable"
import { useAccounts } from "@/features/manajemen-akun/hooks/useAccounts"

export default function ManajemenAkunPage() {
  const { users, loading, error, loadUsers } = useAccounts()

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Akun</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola akun pengguna sesuai data backend.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadUsers} variant="outline" className="rounded-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/manajemen-akun/tambah">
            <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2.5 text-sm flex items-center gap-2 shadow-md">
              <Plus className="w-4 h-4" />
              Tambah Pengguna
            </Button>
          </Link>
        </div>
      </header>

      <AccountTable users={users} loading={loading} error={error} />
    </>
  )
}