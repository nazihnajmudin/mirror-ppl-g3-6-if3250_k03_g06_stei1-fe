"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getErrorMessage } from "@/lib/errors"
import apiClient from "@/lib/api-client"
import type { ApiResponse, ProdiOption, User } from "@/types/api.types"
import { requiresProdiRole } from "../utils"

const formSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter."),
    role: z.enum(["SUPER_ADMIN", "PIMPINAN", "KAPRODI", "TIM_PRODI"]),
    prodiId: z.string().optional().nullable(),
  })
  .refine((data) => !(requiresProdiRole(data.role) && !data.prodiId), {
    path: ["prodiId"],
    message: "Prodi wajib dipilih untuk Kaprodi atau Tim Prodi.",
  })

export function AccountEditForm({ id }: { id: string }) {
  const router = useRouter()

  const [isLoading, setIsLoading] = React.useState(false)
  const [isBootstrapping, setIsBootstrapping] = React.useState(true)
  const [targetUser, setTargetUser] = React.useState<User | null>(null)
  const [prodis, setProdis] = React.useState<ProdiOption[]>([])
  const [loadError, setLoadError] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "PIMPINAN",
      prodiId: null,
    },
  })

  const selectedRole = form.watch("role")

  const bootstrap = React.useCallback(async () => {
    setIsBootstrapping(true)
    setLoadError(null)

    try {
      const [userRes, prodiRes] = await Promise.all([
        apiClient.get<ApiResponse<User>>(`/accounts/${id}`),
        apiClient.get<ApiResponse<ProdiOption[]>>("/accounts/prodi-options"),
      ])

      const user = userRes.data.data
      if (!user) throw new Error("Data akun tidak ditemukan")

      setTargetUser(user)
      setProdis(prodiRes.data.data ?? [])

      form.reset({
        name: user.name,
        role: user.role,
        prodiId: user.prodiId,
      })
    } catch (err: unknown) {
      const apiMessage = (err as any)?.response?.data?.message
      if (apiMessage === "Pengguna tidak ditemukan") {
        setLoadError("Data akun tidak ditemukan atau endpoint prodi-options belum aktif. Pastikan backend sudah restart dengan perubahan terbaru.")
      } else {
        setLoadError(apiMessage || "Gagal memuat data akun")
      }
    } finally {
      setIsBootstrapping(false)
    }
  }, [form, id])

  React.useEffect(() => {
    bootstrap()
  }, [bootstrap])

  React.useEffect(() => {
    if (!requiresProdiRole(selectedRole)) {
      form.setValue("prodiId", null)
    }
  }, [selectedRole, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    form.clearErrors("root")

    try {
      await apiClient.put(`/accounts/${id}`, {
        name: values.name,
        role: values.role,
        prodiId: requiresProdiRole(values.role) ? values.prodiId : null,
      })
      router.push("/manajemen-akun")
    } catch (err: unknown) {
      form.setError("root", { message: getErrorMessage(err) || "Gagal menyimpan perubahan akun." })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleActive = async () => {
    if (!targetUser) return

    setIsLoading(true)
    form.clearErrors("root")

    try {
      if (targetUser.isActive) {
        await apiClient.patch(`/accounts/${id}/deactivate`)
      } else {
        await apiClient.patch(`/accounts/${id}/activate`)
      }
      await bootstrap()
    } catch (err: unknown) {
      form.setError("root", { message: getErrorMessage(err) || "Gagal mengubah status akun." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="px-8 py-6 border-b border-gray-100">
        <CardTitle className="text-lg font-bold text-gray-900">Detail Akun</CardTitle>
        <CardDescription className="text-sm text-gray-500">Email tidak diubah melalui halaman ini.</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        {isBootstrapping && <p className="text-sm text-gray-500">Memuat data akun...</p>}
        {!isBootstrapping && loadError && <p className="text-sm text-red-600">{loadError}</p>}

        {!isBootstrapping && !loadError && targetUser && (
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
                        <Input className="h-11 bg-gray-50/50 border-gray-200 rounded-lg" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel className="text-sm font-bold text-gray-700">Email</FormLabel>
                  <Input value={targetUser.email} disabled className="h-11 bg-gray-100 border-gray-200 rounded-lg" />
                </FormItem>
              </div>

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
                      disabled={!requiresProdiRole(selectedRole)}
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
                  </FormItem>
                )
                }}
              />

              {form.formState.errors.root && <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>}

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isLoading} className="h-11 px-8 bg-black hover:bg-gray-800 text-white rounded-lg font-bold flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={toggleActive}
                  className="h-11 px-6 rounded-lg font-bold"
                >
                  {targetUser.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                </Button>

                <Link href="/manajemen-akun">
                  <Button variant="ghost" type="button" className="h-11 px-8 rounded-lg font-bold text-gray-500 hover:text-gray-900">
                    Batalkan
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}