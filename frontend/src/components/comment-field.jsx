import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setReplying,
}) => {
  const {
    blog,
    blog: {
      _id,
      author: { _id: blogAuthorId },
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const {
    userAuth: { access_token, username, fullname, profile_img },
  } = useContext(UserContext);

  const [comment, setComment] = useState("");

  const handleComment = async () => {
    if (!access_token) {
      return toast.error("Sign in first to leave a comment");
    }

    if (!comment.trim()) {
      return toast.error("Write something to leave a comment");
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`,
        {
          _id,
          blog_author: blogAuthorId,
          comment,
          replying_to: replyingTo,
        },
        {
          headers: { Authorization: access_token },
        }
      );

      // Clear input after comment submission
      setComment("");

      // Prepare new comment object
      const newComment = {
        ...data,
        commented_by: {
          personal_info: { username, profile_img, fullname },
        },
      };

      let updatedCommentsArr = [...commentsArr];

      // If replying to a comment
      if (replyingTo) {
        newComment.childrenLevel = commentsArr[index].childrenLevel + 1;
        newComment.parentIndex = index;

        // Update parent comment's children and add new reply
        commentsArr[index].children.push(newComment._id);
        commentsArr[index].isReplyLoaded = true;

        // Insert the reply just below the parent comment
        updatedCommentsArr.splice(index + 1, 0, newComment);

        setReplying(false);
      } else {
        // Add new parent-level comment
        newComment.childrenLevel = 0;
        updatedCommentsArr = [newComment, ...commentsArr];
      }

      // Update blog state
      const parentCommentIncrement = replyingTo ? 0 : 1;

      setBlog((prevBlog) => ({
        ...prevBlog,
        comments: {
          ...prevBlog.comments,
          results: updatedCommentsArr,
        },
        activity: {
          ...prevBlog.activity,
          total_comments: total_comments + 1,
          total_parent_comments: total_parent_comments + parentCommentIncrement,
        },
      }));

      setTotalParentCommentsLoaded((prev) => prev + parentCommentIncrement);
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        {action}
      </button>
    </>
  );
};

export default CommentField;
