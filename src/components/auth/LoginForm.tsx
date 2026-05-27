"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";

import { loginSchema, type LoginInput } from "@/validators/auth.validator";
import { useLogin } from "@/features/auth/hooks/useLogin";

export function LoginForm() {
  const { login, isLoading } = useLogin();
  
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    await login(values, form.setError);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4">
        
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => ( 
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="someone@email.com"
                  disabled={isLoading}
                  className={`h-10 rounded-lg ${
                    fieldState.error 
                      ? "bg-[#FEF2F2] border-[#EF4444] text-[#EF4444] focus-visible:ring-[#EF4444]" 
                      : "bg-[#F3F4F6] border-gray-200 focus-visible:ring-gray-300"
                  }`}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[13px] font-medium text-[#EF4444]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  disabled={isLoading}
                  className={`h-10 rounded-lg ${
                    fieldState.error 
                      ? "bg-[#FEF2F2] border-[#EF4444] text-[#EF4444] focus-visible:ring-[#EF4444]" 
                      : "bg-[#F3F4F6] border-gray-200 focus-visible:ring-gray-300"
                  }`}
                  {...field}
                />  
              </FormControl>
              <FormMessage className="text-[13px] font-medium text-[#EF4444]" />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-[13px] font-medium text-[#EF4444]">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="mt-0.5 mb-4 flex justify-center sm:mb-5">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Lupa Password?
          </a>
        </div>
        
        <Button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full rounded-lg bg-[#2A2525] font-medium text-white hover:bg-[#1f1b1b]"
        >
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
  );
}