import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid" }),
    password: z.string().min(1, { message: "Password harus diisi" }),
});

export type LoginInput = z.infer<typeof loginSchema>;