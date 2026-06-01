"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/features/auth/components/LoginForm"; 

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eff0f1] p-4">
      <Card className="w-full max-h-full max-w-[460px] p-6 rounded-[20px] shadow-sm bg-white sm:p-7">
        
        {/* Header Logo & Judul */}
        <div className="mb-6 flex flex-col items-center sm:mb-7">
          <div className="mb-2 sm:mb-3">
            <Image src="/images/logo-stei.png" alt="Logo STEI" width={84} height={84} priority className="object-contain" />
          </div>
          <h1 className="mb-1.5 text-2xl font-bold text-gray-900">Portal Akreditasi STEI</h1>
          <p className="text-sm text-gray-500 text-center">Masukkan kredensial Anda untuk mengakses dashboard.</p>
        </div>

        <LoginForm />

        {/* Divider & SSO ITB */}
        <div className="relative my-4 sm:my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400">atau masuk dengan</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          type="button"
          onClick={() => window.location.href = '/api/auth/sso'}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border-gray-200 font-medium text-gray-700 hover:bg-gray-50">
          <Image src="/images/logo-ganesha.jpg" alt="Logo Ganesha" width={20} height={20} className="h-5 w-5 object-contain" />
          SSO ITB
        </Button>

      </Card>
    </div>
  );
}