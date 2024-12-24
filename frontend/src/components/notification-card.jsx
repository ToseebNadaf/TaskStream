import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import NotificationCommentField from "./notification-comment-field";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";

const NotificationCard = ({ data, index, notificationState }) => {
  const [isReplying, setReplying] = useState(false);

  const {
    seen,
    type,
    reply,
    createdAt,
    comment,
    replied_on_comment,
    user,
    user: {
      personal_info: { fullname, username, profile_img },
    },
    blog: { _id, blog_id, title },
    _id: notification_id,
  } = data;

  const {
    userAuth: {
      username: author_username,
      profile_img: author_profile_img,
      access_token,
    },
  } = useContext(UserContext);

  const {
    notifications,
    notifications: { results },
    setNotifications,
  } = notificationState;

  const handleReplyClick = () => {
    setReplying((prev) => !prev);
  };

  const handleMarkAsSeen = () => {
    if (!seen) {
      const updatedResults = [...results];
      updatedResults[index].seen = true;
      setNotifications({ ...notifications, results: updatedResults });
      toast.info("Notification marked as seen");
    }
  };

  return (
    <>
      <Toaster />
      <div
        className={
          "p-6 border-b border-grey border-l-black " +
          (!seen ? "border-l-2" : "")
        }
        onClick={handleMarkAsSeen}
      >
        <div className="flex gap-5 mb-3">
          <img src={profile_img} className="w-14 h-14 flex-none rounded-full" />
          <div className="w-full">
            <h1 className="font-medium text-xl text-dark-grey">
              <span className="lg:inline-block hidden capitalize">
                {fullname}
              </span>
              <Link
                to={`/user/${username}`}
                className="mx-1 text-black underline"
              >
                @{username}
              </Link>
              <span className="font-normal">
                {type == "like"
                  ? "Liked your blog"
                  : type == "comment"
                  ? "Commented on"
                  : "Replied on"}
              </span>
            </h1>

            {type == "reply" ? (
              <div className="p-4 mt-4 rounded-md bg-grey">
                <p>{replied_on_comment.comment}</p>
              </div>
            ) : (
              <Link
                to={`/blog/${blog_id}`}
                className="font-medium text-dark-grey hover:underline line-clamp-1"
              >{`"${title}"`}</Link>
            )}
          </div>
        </div>

        {type != "like" ? (
          <p className="ml-14 pl-5 font-gelasio text-xl my-5">
            {comment.comment}
          </p>
        ) : (
          ""
        )}

        <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">
          <p>{getDay(createdAt)}</p>
          {type != "like" ? (
            <>
              {!reply ? (
                <button
                  className="underline hover:text-black"
                  onClick={handleReplyClick}
                >
                  Reply
                </button>
              ) : (
                ""
              )}
            </>
          ) : (
            ""
          )}
        </div>

        {isReplying ? (
          <div className="mt-8">
            <NotificationCommentField
              _id={_id}
              blog_author={user}
              index={index}
              replyingTo={comment._id}
              setReplying={setReplying}
              notification_id={notification_id}
              notificationData={notificationState}
            />
          </div>
        ) : (
          ""
        )}

        {reply ? (
          <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
            <div className="flex gap-3 mb-3">
              <img src={author_profile_img} className="w-8 h-8 rounded-full" />

              <div>
                <h1 className="font-medium text-xl text-dark-grey">
                  <Link
                    to={`/user/${author_username}`}
                    className="mx-1 text-black underline"
                  >
                    @{author_username}
                  </Link>

                  <span className="font-normal">replied to</span>

                  <Link
                    to={`/user/${username}`}
                    className="mx-1 text-black underline"
                  >
                    @{username}
                  </Link>
                </h1>
              </div>
            </div>

            <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default NotificationCard;
