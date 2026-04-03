"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, Save, AlertCircle } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/layout/sidebar"
import apiClient from "@/lib/api-client"
import type { ApiResponse, ProdiOption, UserRole } from "@/types/api.types"

const requiresProdiRole = (role: UserRole): boolean => role === "KAPRODI" || role === "TIM_PRODI"

const formSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter."),
    email: z.string().email("Email tidak valid."),
    password: z.string().min(8, "Password minimal 8 karakter."),
    role: z.enum(["SUPER_ADMIN", "PIMPINAN", "KAPRODI", "TIM_PRODI"]),
    prodiId: z.string().optional().nullable(),
  })
  .refine((data) => !(requiresProdiRole(data.role) && !data.prodiId), {
    path: ["prodiId"],
    message: "Prodi wajib dipilih untuk Kaprodi atau Tim Prodi.",
  })

export default function TambahPenggunaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [prodis, setProdis] = React.useState<ProdiOption[]>([])
  const [loadProdiError, setLoadProdiError] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "PIMPINAN",
      prodiId: null,
    },
  })

  const selectedRole = form.watch("role")

  React.useEffect(() => {
    const loadProdi = async () => {
      try {
        const response = await apiClient.get<ApiResponse<ProdiOption[]>>("/accounts/prodi-options")
        setProdis(response.data.data ?? [])
      } catch (err: any) {
        const apiMessage = err?.response?.data?.message
        if (apiMessage === "Pengguna tidak ditemukan") {
          setLoadProdiError("Endpoint prodi-options belum aktif. Restart backend dulu agar dropdown prodi bisa digunakan.")
        } else {
          setLoadProdiError(apiMessage || "Gagal memuat data prodi")
        }
      }
    }

    loadProdi()
  }, [])

  React.useEffect(() => {
    if (!requiresProdiRole(selectedRole)) {
      form.setValue("prodiId", null)
    }
  }, [selectedRole, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    form.clearErrors("root")

    try {
      await apiClient.post("/accounts", {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        prodiId: requiresProdiRole(values.role) ? values.prodiId : null,
      })

      router.push("/manajemen-akun")
    } catch (err: any) {
      const message = err?.response?.data?.message || "Gagal menambahkan akun."
      const details = err?.response?.data?.details || []
      
      let errorMsg = message
      if (details && details.length > 0) {
        errorMsg = `${message}: ${details.map((d: any) => `${d.field} - ${d.message}`).join(", ")}`
      }
      
      form.setError("root", { message: errorMsg })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      <div className="w-[240px] fixed h-full bg-white border-r border-gray-200 hidden md:flex items-center justify-center text-gray-400 text-sm font-medium">
        <Sidebar />
      </div>

      <main className="flex-grow md:ml-[240px] p-8 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Link href="/manajemen-akun" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors group">
            <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Kembali ke Manajemen Akun
          </Link>

          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna Baru</h1>
            <p className="text-sm text-gray-500 mt-1">Data akun mengikuti schema backend.</p>
          </header>

          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="px-8 py-6 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900">Informasi Akun</CardTitle>
              <CardDescription className="text-sm text-gray-500">Isi nama, email, role, password, dan prodi jika diperlukan.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Error Alert */}
                  {form.formState.errors.root && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900">{form.formState.errors.root.message}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Nama Lengkap</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: John Doe" className="h-11 bg-gray-50/50 border-gray-200 rounded-lg" {...field} />
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
                          <FormLabel className="text-sm font-bold text-gray-700">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@mail.com" className="h-11 bg-gray-50/50 border-gray-200 rounded-lg" {...field} />
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
                            <SelectContent>
                              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                              <SelectItem value="PIMPINAN">Pimpinan</SelectItem>
                              <SelectItem value="KAPRODI">Kaprodi</SelectItem>
                              <SelectItem value="TIM_PRODI">Tim Prodi</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Minimal 8 karakter" className="h-11 bg-gray-50/50 border-gray-200 rounded-lg" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="prodiId"
                    render={({ field }) => {
                      const selectedProdi = prodis.find((prodi) => prodi.id === field.value)
                      const selectedLabel = selectedProdi
                        ? `${selectedProdi.degree ? `${selectedProdi.degree} ` : ""}${selectedProdi.fullname}`
                        : undefined

                      return (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-gray-700">Program Studi</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                          value={field.value ?? "none"}
                          disabled={!!loadProdiError}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 rounded-lg">
                              <SelectValue placeholder="Pilih program studi">{selectedLabel}</SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Tidak ada</SelectItem>
                            {prodis.map((prodi) => (
                              <SelectItem key={prodi.id} value={prodi.id}>
                                {prodi.degree ? `${prodi.degree} ` : ""}
                                {prodi.fullname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                        {!requiresProdiRole(selectedRole) && !loadProdiError && (
                          <p className="text-xs text-gray-500">Opsional untuk role ini.</p>
                        )}
                        {loadProdiError && <p className="text-xs text-red-600">{loadProdiError}</p>}
                      </FormItem>
                    )
                    }}
                  />

                  {form.formState.errors.root && <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>}

                  <div className="pt-4 flex items-center gap-3">
                    <Button type="submit" disabled={isLoading} className="h-11 px-8 bg-black hover:bg-gray-800 text-white rounded-lg font-bold flex items-center gap-2">
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
                      <Button variant="ghost" type="button" className="h-11 px-8 rounded-lg font-bold text-gray-500 hover:text-gray-900">
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
