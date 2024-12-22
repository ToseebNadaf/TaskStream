import { z } from "zod";
import Blog from "../models/User.js";
import {
  latestBlogsSchema,
  searchBlogsCountSchema,
  searchBlogsSchema,
} from "../utils/validation.js";

export const getLatestBlogs = async (req, res) => {
  try {
    const { page } = latestBlogsSchema.parse(req.body);

    const maxLimit = 5;

    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: err.errors.map((e) => e.message).join(", ") });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const getAllLatestBlogsCount = async (req, res) => {
  try {
    const totalDocs = await Blog.countDocuments({ draft: false });
    return res.status(200).json({ totalDocs });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the blog count." });
  }
};

export const getTrendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({
        "activity.total_read": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt -_id")
      .limit(5);

    return res.status(200).json({ blogs });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

export const searchBlogs = async (req, res) => {
  try {
    const { tag, query, author, page, limit, eliminate_blog } =
      searchBlogsSchema.parse(req.body);

    let findQuery = {};

    if (tag) {
      findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };
    } else if (author) {
      findQuery = { author, draft: false };
    }

    const maxLimit = limit || 2;

    const blogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const searchBlogsCount = async (req, res) => {
  try {
    const { tag, author, query } = searchBlogsCountSchema.parse(req.body);

    let findQuery;

    if (tag) {
      findQuery = { tags: tag, draft: false };
    } else if (query) {
      findQuery = { draft: false, title: new RegExp(query, "i") };
    } else if (author) {
      findQuery = { author, draft: false };
    }

    Blog.countDocuments(findQuery)
      .then((count) => {
        return res.status(200).json({ totalDocs: count });
      })
      .catch((err) => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
      });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
