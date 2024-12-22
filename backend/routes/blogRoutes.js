import express from "express";
import {
  getAllLatestBlogsCount,
  getLatestBlogs,
  getTrendingBlogs,
  searchBlogs,
  searchBlogsCount,
} from "../controllers/blogController.js";

const router = express.Router();

router.route("/latest-blogs").post(getLatestBlogs);
router.post("/all-latest-blogs-count", getAllLatestBlogsCount);
router.get("/trending-blogs", getTrendingBlogs);
router.post("/search-blogs", searchBlogs);
router.post("/search-blogs-count", searchBlogsCount);

export default router;
