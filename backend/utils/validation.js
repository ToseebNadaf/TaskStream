import { z } from "zod";

export const signupSchema = z.object({
  fullname: z.string().min(3, "Fullname must be at least 3 characters long"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/,
      "Password must be 6-20 characters long and include at least 1 numeric, 1 lowercase, and 1 uppercase letter"
    ),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
