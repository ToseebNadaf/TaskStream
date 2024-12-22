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

export const getProfileSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export const updateProfileImgSchema = z.object({
  url: z.string().url("Invalid image URL").nonempty("Image URL is required"),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username should be at least 3 letters long" }),
  bio: z
    .string()
    .max(150, { message: "Bio should not be more than 150 characters" }),
  social_links: z
    .object({
      twitter: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      facebook: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .optional(),
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

export const createBlogSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  des: z
    .string()
    .max(200, { message: "Description should be under 200 characters" })
    .optional(),
  banner: z.string().min(1, { message: "Banner is required" }).optional(),
  tags: z
    .array(z.string())
    .max(10, { message: "Maximum 10 tags allowed" })
    .optional(),
  content: z
    .object({
      blocks: z
        .array(
          z.object({
            text: z.string().optional(),
            type: z.string().optional(),
          })
        )
        .min(1, { message: "Blog content should not be empty" }),
    })
    .optional(),
  draft: z.boolean().optional(),
});

export const getBlogSchema = z.object({
  blog_id: z.string().nonempty("Blog ID is required"),
  draft: z.boolean().optional(),
  mode: z.enum(["view", "edit"]).optional(),
});

export const likeBlogSchema = z.object({
  _id: z.string().min(1, { message: "Blog ID is required" }),
  islikedByUser: z.boolean(),
});

export const isLikedByUserSchema = z.object({
  _id: z.string().min(1, "Blog ID is required"),
});

export const userWrittenBlogsSchema = z.object({
  page: z.number().min(1, "Page number should be at least 1").int(),
  draft: z.boolean(),
  query: z.string().optional(),
  deletedDocCount: z.number().optional(),
});

export const userWrittenBlogsCountSchema = z.object({
  draft: z.boolean().optional(),
  query: z.string().optional(),
});

export const deleteBlogSchema = z.object({
  blog_id: z.string().nonempty("Blog ID is required"),
});

// ---------------------------------COMMENT VALIDATION START----------------------------------------------

export const addCommentSchema = z.object({
  _id: z.string().min(1, "Blog ID is required"),
  comment: z.string().min(1, "Write something to leave a comment"),
  blog_author: z.string().min(1, "Blog author is required"),
  replying_to: z.string().optional(),
  notification_id: z.string().optional(),
});

export const getBlogCommentsSchema = z.object({
  blog_id: z.string().nonempty("Blog ID is required"),
  skip: z.number().int().nonnegative("Skip must be a non-negative integer"),
});

export const getRepliesSchema = z.object({
  _id: z.string().nonempty("Comment ID is required."),
  skip: z.number().min(0, "Skip value must be zero or greater."),
});

export const deleteCommentSchema = z.object({
  _id: z.string().nonempty("Comment ID is required"),
});

// ---------------------------------NOTIFICATION VALIDATION START----------------------------------------------

export const newNotificationValidation = z.object({
  user_id: z.string().nonempty(),
});

export const notificationValidation = z.object({
  page: z.number().min(1, "Page must be at least 1"),
  filter: z
    .enum(["all", "comment", "like", "reply"], "Invalid filter type")
    .default("all"),
  deletedDocCount: z.number().optional().default(0),
});

export const notificationFilterSchema = z.object({
  filter: z.string().optional(),
});
