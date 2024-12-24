import express from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import {
  addComment,
  getBlogComments,
  getRepliesController,
} from "../controllers/commentController.js";
import {
  validateGetBlogComments,
  validateRepliesRequest,
} from "../middlewares/validateBlog.js";

const router = express.Router();

router.post("/add-comment", verifyJWT, addComment);
router.post("/get-blog-comments", validateGetBlogComments, getBlogComments);
router.post("/get-replies", validateRepliesRequest, getRepliesController);

export default router;
