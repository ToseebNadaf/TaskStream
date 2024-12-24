import { useContext } from "react";
import { BlogContext } from "../pages/blog";
import CommentField from "./comment-field";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card";
import NoDataMessage from "./nodata";

export const fetchComments = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}) => {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_SERVER_DOMAIN}/get-blog-comments`,
      { blog_id, skip }
    );

    const updatedData = data.map((comment) => ({
      ...comment,
      childrenLevel: 0,
    }));

    setParentCommentCountFun((prev) => prev + updatedData.length);

    return {
      results: comment_array ? [...comment_array, ...updatedData] : updatedData,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return comment_array ? { results: comment_array } : { results: [] };
  }
};

const CommentsContainer = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      comments: { results: commentsArr },
      activity: { total_parent_comments },
    },
    commentsWrapper,
    setCommentsWrapper,
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
    setBlog,
  } = useContext(BlogContext);

  const loadMoreComments = async () => {
    const newCommentsArr = await fetchComments({
      skip: totalParentCommentsLoaded,
      blog_id: _id,
      setParentCommentCountFun: setTotalParentCommentsLoaded,
      comment_array: commentsArr,
    });

    setBlog((prevBlog) => ({
      ...prevBlog,
      comments: newCommentsArr,
    }));
  };

  return (
    <div
      className={
        "max-sm:w-full fixed " +
        (commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]") +
        " duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden"
      }
    >
      <div className="relative">
        <h1 className="text-xl font-medium">Comments</h1>
        <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">
          {title}
        </p>

        <button
          onClick={() => setCommentsWrapper((preVal) => !preVal)}
          className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
        >
          <i className="fi fi-br-cross text-2xl mt-1"></i>
        </button>
      </div>

      <hr className="border-grey my-8 w-[120%] -ml-10" />

      <CommentField action="comment" />

      {commentsArr && commentsArr.length ? (
        commentsArr.map((comment, i) => {
          return (
            <AnimationWrapper key={i}>
              <CommentCard
                index={i}
                leftVal={comment.childrenLevel * 4}
                commentData={comment}
              />
            </AnimationWrapper>
          );
        })
      ) : (
        <NoDataMessage message="No Comments" />
      )}

      {total_parent_comments > totalParentCommentsLoaded ? (
        <button
          onClick={loadMoreComments}
          className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
        >
          Load More
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default CommentsContainer;
