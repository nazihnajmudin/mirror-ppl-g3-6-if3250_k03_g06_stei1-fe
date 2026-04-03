"use client";

import { useState } from "react";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import apiClient from "@/lib/api-client"

const TOKEN_STORAGE_KEY = "access_token";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password harus diisi" }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/login", values);

      const token = response.data?.data?.token || response.data?.accessToken || response.data?.token;
      
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        
        router.push("/dashboard");
        
        router.refresh();
      } else {
        throw new Error("Format response server tidak sesuai (Token Missing).");
      }

    } catch (error: unknown) {
      console.error("Login Error:", error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat login.";

        if (statusCode === 401) {
          form.setError("root", { message: "Email atau password salah." });
        } else if (statusCode === 403) {
          form.setError("root", { message: "Akun Anda tidak memiliki akses ke portal ini." });
        } else {
          form.setError("root", { message: errorMessage });
        }
      } else if (error instanceof Error) {
        form.setError("root", { message: error.message });
      } else {
        form.setError("root", { message: "Terjadi kesalahan ketika login." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasError = Object.keys(form.formState.errors).length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eff0f1] p-4">
      <Card className="w-full max-h-full max-w-[460px] p-6 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-0 bg-white sm:p-7">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center sm:mb-7">
          {/* logo-stei above the "steiitb" text */}
          <div className="mb-2 sm:mb-3">
            <Image src="/images/logo-stei.png" alt="Logo STEI" width={84} height={84} priority className="object-contain sm:h-[96px] sm:w-[96px]" />
          </div>
          <h1 className="mb-1.5 text-2xl font-bold text-gray-900">Portal Akreditasi STEI</h1>
          <p className="text-sm text-gray-500 text-center">Masukkan kredensial Anda untuk mengakses dashboard.</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="someone@email.com"
                      disabled={isLoading}
                      className={`h-10 rounded-lg ${hasError ? "bg-[#FEF2F2] border-[#EF4444] text-[#EF4444] focus-visible:ring-[#EF4444]" : "bg-[#F3F4F6] border-gray-200 focus-visible:ring-gray-300"}`}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      disabled={isLoading}
                      className={`h-10 rounded-lg ${hasError ? "bg-[#FEF2F2] border-[#EF4444] text-[#EF4444] focus-visible:ring-[#EF4444]" : "bg-[#F3F4F6] border-gray-200 focus-visible:ring-gray-300"}`}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Root Error Message */}
            {form.formState.errors.root && (
              <p className="text-[13px] font-medium text-[#EF4444]">{form.formState.errors.root.message}</p>
            )}

            <div className="mt-0.5 mb-4 flex justify-center sm:mb-5">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Lupa Password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full rounded-lg bg-[#2A2525] font-medium text-white hover:bg-[#1f1b1b]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="relative my-4 sm:my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400">atau masuk dengan</span>
          </div>
        </div>

        {/* SSO Button with logo-ganesha */}
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border-gray-200 font-medium text-gray-700 hover:bg-gray-50">
          <Image src="/images/logo-ganesha.jpg" alt="Logo Ganesha" width={20} height={20} className="h-5 w-5 object-contain" />
          SSO ITB
        </Button>
      </Card>
    </div>
  );
}
