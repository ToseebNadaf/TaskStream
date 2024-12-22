import express from "express";
import {
  createBlog,
  getAllLatestBlogsCount,
  getBlog,
  getLatestBlogs,
  getTrendingBlogs,
  isLikedByUser,
  likeBlog,
  searchBlogs,
  searchBlogsCount,
} from "../controllers/blogController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { validateBlog, validateRequest } from "../middlewares/validateBlog.js";

const router = express.Router();

router.route("/latest-blogs").post(getLatestBlogs);
router.post("/all-latest-blogs-count", getAllLatestBlogsCount);
router.get("/trending-blogs", getTrendingBlogs);
router.post("/search-blogs", searchBlogs);
router.post("/search-blogs-count", searchBlogsCount);
router.post("/create-blog", verifyJWT, validateBlog, createBlog);
router.post("/get-blog", getBlog);
router.post("/like-blog", verifyJWT, validateRequest, likeBlog);
router.post("/isliked-by-user", verifyJWT, isLikedByUser);

export default router;
