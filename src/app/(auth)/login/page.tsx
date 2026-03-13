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
        localStorage.setItem("accessToken", token);
        
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
      <Card className="w-full max-w-[480px] p-8 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-0 bg-white">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          {/* logo-stei above the "steiitb" text */}
          <div className="mb-4">
            <Image src="/images/logo-stei.png" alt="Logo STEI" width={120} height={120} priority className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portal Akreditasi STEI</h1>
          <p className="text-sm text-gray-500 text-center">Masukkan kredensial Anda untuk mengakses dashboard.</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                      className={`h-11 rounded-lg ${hasError ? "bg-[#FEF2F2] border-[#EF4444] text-[#EF4444] focus-visible:ring-[#EF4444]" : "bg-[#F3F4F6] border-gray-200 focus-visible:ring-gray-300"}`}
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
                      className={`h-11 rounded-lg ${hasError ? "bg-[#FEF2F2] border-[#EF4444] text-[#EF4444] focus-visible:ring-[#EF4444]" : "bg-[#F3F4F6] border-gray-200 focus-visible:ring-gray-300"}`}
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

            <div className="flex justify-center mt-2 mb-6">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Lupa Password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#2A2525] hover:bg-[#1f1b1b] text-white rounded-lg font-medium">
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
        <div className="relative my-6">
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
          className="w-full h-11 border-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
          <Image src="/images/logo-ganesha.jpg" alt="Logo Ganesha" width={20} height={20} className="object-contain" />
          SSO ITB
        </Button>
      </Card>
    </div>
  );
}
