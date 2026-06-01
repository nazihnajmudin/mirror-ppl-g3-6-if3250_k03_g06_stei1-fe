"use client"

import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { User } from "@/types/api.types"
import { getInitials, roleLabel } from "../utils"

interface AccountTableProps {
  users: User[]
  loading: boolean
  error: string | null
}

export function AccountTable({ users, loading, error }: AccountTableProps) {
  return (
    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
        <CardTitle className="text-lg font-bold text-gray-900">Daftar Pengguna</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading && <p className="px-6 py-6 text-sm text-gray-500">Memuat data akun...</p>}

        {!loading && error && <p className="px-6 py-6 text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Pengguna</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Role</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Status</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">Program Studi</TableHead>
                <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-gray-100 shadow-sm">
                        <AvatarFallback className="bg-blue-50 text-blue-600 text-[13px] font-bold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-gray-900 leading-tight mb-0.5">{user.name}</span>
                        <span className="text-[13px] text-gray-500">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-[14px] font-bold text-gray-900">
                    {roleLabel[user.role]}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant="secondary"
                      className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none ring-0 ${
                        user.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-[14px] text-gray-600 font-medium">
                    {user.prodi?.fullname ?? "-"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {/* ✅ Tautan diperbarui ke rute grup [id] */}
                    <Link href={`/manajemen-akun/${user.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg h-9 px-4 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md transition-all"
                      >
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

              {!users.length && (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Belum ada data akun.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}