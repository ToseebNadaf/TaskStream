import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllLatestBlogsCount,
  getBlog,
  getLatestBlogs,
  getTrendingBlogs,
  getUserWrittenBlogs,
  getUserWrittenBlogsCount,
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
router.post("/user-written-blogs", verifyJWT, getUserWrittenBlogs);
router.post("/user-written-blogs-count", verifyJWT, getUserWrittenBlogsCount);
router.post("/delete-blog", verifyJWT, deleteBlog);

export default router;
