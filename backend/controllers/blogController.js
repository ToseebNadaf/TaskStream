import { z } from "zod";
import { nanoid } from "nanoid";
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Comment from "../models/Comment.js";
import {
  createBlogSchema,
  deleteBlogSchema,
  getBlogSchema,
  isLikedByUserSchema,
  latestBlogsSchema,
  searchBlogsCountSchema,
  searchBlogsSchema,
  userWrittenBlogsCountSchema,
  userWrittenBlogsSchema,
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

export const createBlog = async (req, res) => {
  const { title, des, banner, tags, content, draft, id } = req.body;
  const authorId = req.user;

  try {
    createBlogSchema.parse({ title, des, banner, tags, content, draft });

    let blog_id =
      id ||
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() + nanoid();

    if (id) {
      await Blog.findOneAndUpdate(
        { blog_id },
        { title, des, banner, content, tags, draft: draft ? draft : false }
      );
      return res.status(200).json({ id: blog_id });
    } else {
      const newBlog = new Blog({
        title,
        des,
        banner,
        content,
        tags,
        author: authorId,
        blog_id,
        draft: Boolean(draft),
      });

      await newBlog.save();

      const incrementVal = draft ? 0 : 1;

      await User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementVal },
          $push: { blogs: newBlog._id },
        }
      );

      return res.status(200).json({ id: blog_id });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getBlog = async (req, res) => {
  try {
    getBlogSchema.parse(req.body);

    let { blog_id, draft, mode } = req.body;
    let incrementVal = mode !== "edit" ? 1 : 0;

    const blog = await Blog.findOneAndUpdate(
      { blog_id },
      { $inc: { "activity.total_reads": incrementVal } },
      { new: true }
    )
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname"
      )
      .select("title des content banner activity publishedAt blog_id tags");

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    await User.findOneAndUpdate(
      { "personal_info.username": blog.author.personal_info.username },
      { $inc: { "account_info.total_reads": incrementVal } }
    );

    if (blog.draft && !draft) {
      return res.status(403).json({ error: "You cannot access draft blogs" });
    }

    return res.status(200).json({ blog });
  } catch (err) {
    return res.status(400).json({
      error: err.errors
        ? err.errors.map((e) => e.message).join(", ")
        : err.message,
    });
  }
};

export const likeBlog = async (req, res) => {
  let user_id = req.user;
  let { _id, islikedByUser } = req.body;

  let incrementVal = !islikedByUser ? 1 : -1;

  try {
    const blog = await Blog.findOne({ _id });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_likes": incrementVal } }
    );

    if (!islikedByUser) {
      const like = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });

      await like.save();
      return res.status(200).json({ liked_by_user: true });
    } else {
      await Notification.findOneAndDelete({
        user: user_id,
        blog: _id,
        type: "like",
      });
      return res.status(200).json({ liked_by_user: false });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const isLikedByUser = async (req, res) => {
  try {
    isLikedByUserSchema.parse(req.body);

    const user_id = req.user;
    const { _id } = req.body;

    const result = await Notification.exists({
      user: user_id,
      type: "like",
      blog: _id,
    });

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getUserWrittenBlogs = async (req, res) => {
  try {
    const validatedData = userWrittenBlogsSchema.parse(req.body);
    const { page, draft, query, deletedDocCount } = validatedData;

    let user_id = req.user;
    let maxLimit = 5;
    let skipDocs = (page - 1) * maxLimit;

    if (deletedDocCount) {
      skipDocs -= deletedDocCount;
    }

    const blogs = await Blog.find({
      author: user_id,
      draft,
      title: new RegExp(query, "i"),
    })
      .skip(skipDocs)
      .limit(maxLimit)
      .sort({ publishedAt: -1 })
      .select("title banner publishedAt blog_id activity des draft -_id");

    return res.status(200).json({ blogs });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const getUserWrittenBlogsCount = async (req, res) => {
  const { user_id } = req.user;
  const { draft, query } = req.body;

  try {
    userWrittenBlogsCountSchema.parse({ draft, query });

    Blog.countDocuments({
      author: user_id,
      draft,
      title: new RegExp(query, "i"),
    })
      .then((count) => {
        return res.status(200).json({ totalDocs: count });
      })
      .catch((err) => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
      });
  } catch (error) {
    return res.status(400).json({
      error: "Invalid request data",
    });
  }
};

export const deleteBlog = async (req, res) => {
  const user_id = req.user;

  try {
    deleteBlogSchema.parse(req.body);
  } catch (error) {
    return res.status(400).json({
      error: "Invalid request data",
      details: error.errors,
    });
  }

  const { blog_id } = req.body;

  try {
    const blog = await Blog.findOneAndDelete({ blog_id });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    await Notification.deleteMany({ blog: blog._id });
    console.log("Notifications deleted");

    await Comment.deleteMany({ blog_id: blog._id });
    console.log("Comments deleted");

    await User.findOneAndUpdate(
      { _id: user_id },
      {
        $pull: { blog: blog._id },
        $inc: { "account_info.total_posts": blog.draft ? 0 : -1 },
      }
    );
    console.log("Blog deleted from user's account");

    return res.status(200).json({ status: "done" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};
