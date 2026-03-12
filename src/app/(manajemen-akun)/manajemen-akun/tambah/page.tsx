"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Save } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus minimal 2 karakter.",
  }),
  email: z.string().email({
    message: "Email tidak valid.",
  }),
  role: z.string({
    required_error: "Silakan pilih peran.",
  }),
  access: z.string({
    required_error: "Silakan pilih hak akses.",
  }),
  prodi: z.string().optional(),
})

export default function TambahPenggunaPage() {
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      access: "",
      prodi: "-",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // Simulate API call
    console.log(values)
    setTimeout(() => {
      setIsLoading(false)
      alert("Pengguna berhasil ditambahkan!")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      {/* Sidebar Placeholder */}
      <div className="w-[240px] fixed h-full bg-white border-r border-gray-200 hidden md:flex items-center justify-center text-gray-400 text-sm font-medium">
        Sidebar Placeholder
      </div>
      
      {/* Main Content */}
      <main className="flex-grow md:ml-[240px] p-8 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Link 
            href="/manajemen-akun" 
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Kembali ke Manajemen Akun
          </Link>

          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna Baru</h1>
            <p className="text-sm text-gray-500 mt-1">Lengkapi informasi di bawah untuk mendaftarkan akun baru ke sistem.</p>
          </header>

          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="px-8 py-6 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900">Informasi Akun</CardTitle>
              <CardDescription className="text-sm text-gray-500">Data ini akan digunakan untuk akses masuk dan identitas di platform.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Nama Lengkap</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: John Doe" className="h-11 bg-gray-50/50 border-gray-200 rounded-lg focus-visible:ring-blue-500" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Email Institusi</FormLabel>
                          <FormControl>
                            <Input placeholder="email@mail.com" className="h-11 bg-gray-50/50 border-gray-200 rounded-lg focus-visible:ring-blue-500" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Peran</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 rounded-lg">
                                <SelectValue placeholder="Pilih peran" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Pimpinan">Pimpinan</SelectItem>
                              <SelectItem value="Kaprodi">Kaprodi</SelectItem>
                              <SelectItem value="Dosen">Dosen</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="access"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Hak Akses</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 rounded-lg">
                                <SelectValue placeholder="Pilih hak akses" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                              <SelectItem value="Semua Prodi">Semua Prodi</SelectItem>
                              <SelectItem value="View Only">View Only</SelectItem>
                              <SelectItem value="Akses Penuh Prodi">Akses Penuh Prodi</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="prodi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-gray-700">Program Studi</FormLabel>
                        <FormControl>
                          <Input placeholder="S1 Teknik Informatika / S1 STI" className="h-11 bg-gray-50/50 border-gray-200 rounded-lg focus-visible:ring-blue-500" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-400 font-medium">Kosongkan (-) jika admin/pimpinan dengan akses semua prodi.</FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex items-center gap-3">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="h-11 px-8 bg-black hover:bg-gray-800 text-white rounded-lg font-bold transition-all active:scale-95 shadow-md flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Simpan Akun
                        </>
                      )}
                    </Button>
                    <Link href="/manajemen-akun">
                      <Button variant="ghost" type="button" className="h-11 px-8 rounded-lg font-bold text-gray-500 hover:text-gray-900 transition-colors">
                        Batalkan
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
