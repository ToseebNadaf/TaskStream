import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";
import Comment from "../models/Comment.js";
import { addCommentSchema } from "../utils/validation.js";

export const addComment = async (req, res) => {
  const user_id = req.user;
  const { _id, comment, blog_author, replying_to, notification_id } = req.body;

  try {
    addCommentSchema.parse(req.body);

    const commentObj = {
      blog_id: _id,
      blog_author,
      comment,
      commented_by: user_id,
    };

    if (replying_to) {
      commentObj.parent = replying_to;
      commentObj.isReply = true;
    }

    const commentFile = await new Comment(commentObj).save();
    const { comment: newComment, commentedAt, children } = commentFile;

    await Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    );

    const notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    if (replying_to) {
      notificationObj.replied_on_comment = replying_to;

      const replyingToCommentDoc = await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      );
      notificationObj.notification_for = replyingToCommentDoc.commented_by;

      if (notification_id) {
        await Notification.findOneAndUpdate(
          { _id: notification_id },
          { reply: commentFile._id }
        );
      }
    }

    await new Notification(notificationObj).save();

    return res.status(200).json({
      comment: newComment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

export const getBlogComments = async (req, res) => {
  const { blog_id, skip } = req.body;

  try {
    const maxLimit = 5;

    const comments = await Comment.find({ blog_id, isReply: false })
      .populate(
        "commented_by",
        "personal_info.username personal_info.fullname personal_info.profile_img"
      )
      .skip(skip)
      .limit(maxLimit)
      .sort({ commentedAt: -1 });

    return res.status(200).json(comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

export const getRepliesController = async (req, res) => {
  const { _id, skip } = req.body;
  const maxLimit = 5;

  try {
    const comment = await Comment.findOne({ _id })
      .populate({
        path: "children",
        options: {
          limit: maxLimit,
          skip: skip,
          sort: { commentedAt: -1 },
        },
        populate: {
          path: "commented_by",
          select:
            "personal_info.profile_img personal_info.fullname personal_info.username",
        },
        select: "-blog_id -updatedAt",
      })
      .select("children");

    return res.status(200).json({ replies: comment?.children || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteComments = (_id) => {
  Comment.findOneAndDelete({ _id })
    .then((comment) => {
      if (comment.parent) {
        Comment.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: _id } }
        ).catch((err) => console.log(err.message));
      }

      Notification.findOneAndDelete({ comment: _id }).catch((err) =>
        console.log(err.message)
      );

      Notification.findOneAndUpdate(
        { reply: _id },
        { $unset: { reply: 1 } }
      ).catch((err) => console.log(err.message));

      Blog.findOneAndUpdate(
        { _id: comment.blog_id },
        {
          $pull: { comments: _id },
          $inc: { "activity.total_comments": -1 },
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        }
      ).then((blog) => {
        if (comment.children.length) {
          comment.children.forEach((replyId) => {
            deleteComments(replyId);
          });
        }
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

export const deleteComment = async (req, res) => {
  const _id = req.body;
  const user_id = req.user;

  try {
    const comment = await Comment.findOne({ _id });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (
      user_id === comment.commented_by.toString() ||
      user_id === comment.blog_author.toString()
    ) {
      deleteComments(_id);
      return res.status(200).json({ status: "Comment deleted successfully" });
    } else {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this comment" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
