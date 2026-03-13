"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Header } from "@/components/layout/header"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface UserData {
  id: string
  name: string
  email: string
  role: string
  access: string
  status: "Online" | "Offline"
  prodi: string
  initials: string
}

const mockUsers: UserData[] = [
  {
    id: "1",
    name: "John Michael",
    email: "john@mail.com",
    role: "Admin",
    access: "Semua Prodi",
    status: "Online",
    prodi: "-",
    initials: "JM",
  },
  {
    id: "2",
    name: "Emma Roberts",
    email: "emma@mail.com",
    role: "Pimpinan",
    access: "View Only",
    status: "Offline",
    prodi: "-",
    initials: "ER",
  },
  {
    id: "3",
    name: "Laurent Perrier",
    email: "laurent@mail.com",
    role: "Kaprodi",
    access: "Akses Penuh Prodi",
    status: "Offline",
    prodi: "S1 Teknik Informatika",
    initials: "LP",
  },
  {
    id: "4",
    name: "Michael Levi",
    email: "micheal@mail.com",
    role: "Kaprodi",
    access: "Akses Penuh Prodi",
    status: "Online",
    prodi: "S1 STI",
    initials: "ML",
  },
]

export default function ManajemenAkunPage() {
  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      {/* Sidebar Placeholder: To be implemented by friend */}
      <div className="w-[240px] fixed h-full bg-white border-r border-gray-200 hidden md:flex items-center justify-center text-gray-400 text-sm font-medium">
        Sidebar Placeholder
      </div>
      
      {/* Main Content */}
      <main className="flex-grow md:ml-[240px] p-8 min-h-screen">
        <Header />
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Akun</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola hak akses dan akun pengguna sistem.</p>
          </div>
          <Link href="/manajemen-akun/tambah">
            <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2.5 text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md">
              <Plus className="w-4 h-4" />
              Tambah Pengguna
            </Button>
          </Link>
        </header>

        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white">
            <CardTitle className="text-lg font-bold text-gray-900">Daftar Pengguna</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">PENGGUNA</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">PERAN & AKSES</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">STATUS</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider">PROGRAM STUDI</TableHead>
                  <TableHead className="uppercase text-[11px] font-bold text-gray-400 px-6 py-4 tracking-wider text-right">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-gray-100 shadow-sm">
                          <AvatarFallback className="bg-blue-50 text-blue-600 text-[13px] font-bold">
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-gray-900 leading-tight mb-0.5">
                            {user.name}
                          </span>
                          <span className="text-[13px] text-gray-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-gray-900 leading-tight mb-0.5">
                          {user.role}
                        </span>
                        <span className="text-[13px] text-gray-500">
                          {user.access}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge 
                        variant="secondary"
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold shadow-none border-none ring-0 ${
                          user.status === "Online" 
                            ? "bg-green-50 text-green-600" 
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[14px] text-gray-600 font-medium">
                      {user.prodi}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg h-9 px-4 text-xs font-bold border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 shadow-sm"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
