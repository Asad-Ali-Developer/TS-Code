import z from "zod";

export const SigninSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type SigninFormInputsTypes = z.infer<typeof SigninSchema>;
