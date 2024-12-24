import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation";
import { useEffect, useState } from "react";
import Loader from "../components/loader";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post";
import NoDataMessage from "../components/nodata";
import LoadMoreDataBtn from "../components/load-more";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard";

const Search = () => {
  const { query } = useParams();

  const [blogs, setBlogs] = useState(null);
  const [users, setUsers] = useState(null);

  const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
        { query, page }
      );

      const formatedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { query },
        create_new_arr,
      });

      setBlogs(formatedData);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/search-users",
        { query }
      );

      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const UserCardWrapper = () => {
    if (users === null) {
      return <Loader />;
    }

    if (users.length === 0) {
      return <NoDataMessage message="No user found" />;
    }

    return users.map((user, i) => (
      <AnimationWrapper
        key={user._id || i}
        transition={{ duration: 1, delay: i * 0.08 }}
      >
        <UserCard user={user} />
      </AnimationWrapper>
    ));
  };

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search results for "${query}"`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
          <>
            {blogs == null ? (
              <Loader />
            ) : blogs.results.length ? (
              blogs.results.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <BlogPostCard
                      content={blog}
                      author={blog.author.personal_info}
                    />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message="No blogs published" />
            )}
            <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
          </>

          <UserCardWrapper />
        </InPageNavigation>
      </div>

      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="font-medium text-xl mb-8">
          User related to search <i className="fi fi-rr-user mt-1"></i>
        </h1>

        <UserCardWrapper />
      </div>
    </section>
  );
};

export default Search;
