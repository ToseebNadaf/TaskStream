import { useContext, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";
import { z } from "zod";

const commentSchema = z
  .string()
  .min(1, "Comment cannot be empty")
  .max(500, "Comment is too long");

const NotificationCommentField = ({
  _id,
  blog_author,
  index,
  replyingTo,
  setReplying,
  notification_id,
  notificationData,
}) => {
  const [comment, setComment] = useState("");

  const { _id: user_id } = blog_author;
  const {
    userAuth: { access_token },
  } = useContext(UserContext);
  const {
    notifications,
    notifications: { results },
    setNotifications,
  } = notificationData;

  const handleComment = async () => {
    try {
      commentSchema.parse(comment);

      if (!comment) {
        return toast.error("Write something to leave a comment");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`,
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to: replyingTo,
          notification_id,
        },
        {
          headers: {
            Authorization: `${access_token}`,
          },
        }
      );

      setReplying(false);
      const updatedResults = [...results];
      updatedResults[index] = {
        ...updatedResults[index],
        reply: { comment, _id: response.data._id },
      };
      setNotifications({ ...notifications, results: updatedResults });

      toast.success("Comment added successfully!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error(error);
        toast.error("Failed to add comment. Please try again.");
      }
    }
  };

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a reply..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        Reply
      </button>
    </>
  );
};

export default NotificationCommentField;
