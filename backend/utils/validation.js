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

export const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .regex(
      passwordRegex,
      "Password should be 6 to 20 characters long with 1 numeric, 1 lowercase, and 1 uppercase letter"
    ),
  newPassword: z
    .string()
    .regex(
      passwordRegex,
      "Password should be 6 to 20 characters long with 1 numeric, 1 lowercase, and 1 uppercase letter"
    ),
});

export const searchUsersSchema = z.object({
  query: z.string().min(1, "Query is required").max(100, "Query too long"),
});

// ---------------------------------BLOG VALIDATION START----------------------------------------------

export const latestBlogsSchema = z.object({
  page: z
    .number()
    .min(1, "Page number must be at least 1")
    .max(100, "Page number cannot exceed 100")
    .int("Page number must be an integer"),
});

export const trendingBlogsSchema = z.object({
  limit: z.number().int().min(1).max(20).default(5),
});

export const searchBlogsSchema = z.object({
  tag: z.string().optional(),
  query: z.string().optional(),
  author: z.string().optional(),
  page: z.number().min(1, "Page number must be greater than 0"),
  limit: z
    .number()
    .min(1, "Limit must be greater than 0")
    .max(100, "Limit must be less than or equal to 100")
    .optional(),
  eliminate_blog: z.string().optional(),
});

export const searchBlogsCountSchema = z.object({
  tag: z.string().optional(),
  author: z.string().optional(),
  query: z.string().optional(),
});
