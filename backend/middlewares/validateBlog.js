import { createBlogSchema, likeBlogSchema } from "../utils/validation.js";

export const validateBlog = (req, res, next) => {
  try {
    createBlogSchema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({
      error: err.errors.map((e) => e.message).join(", "),
    });
  }
};

export const validateRequest = (req, res, next) => {
  try {
    likeBlogSchema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({
      error: err.errors.map((e) => e.message).join(", "),
    });
  }
};