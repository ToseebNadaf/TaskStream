import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation";
import { useEffect, useState } from "react";
import Loader from "../components/loader";
import BlogPostCard from "../components/blog-post";
import MinimalBlogPost from "../components/nobanner-blog-post";
import { activeTabRef } from "../components/inpage-navigation";
import NoDataMessage from "../components/nodata";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more";
import { Toaster, toast } from "react-hot-toast";

const Home = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");

  const categories = [
    "programming",
    "education",
    "health",
    "news",
    "entertainment",
    "food",
    "business",
    "social media",
    "travel",
  ];

  const fetchBlogs = async (url, params, updateStateFn) => {
    try {
      const { data } = await axios.post(url, params);
      const formattedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page: params.page,
        countRoute: params.countRoute,
        data_to_send: params.data_to_send,
      });
      updateStateFn(formattedData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs. Please try again later.");
    }
  };

  const fetchLatestBlogs = ({ page = 1 }) => {
    fetchBlogs(
      `${import.meta.env.VITE_SERVER_DOMAIN}/latest-blogs`,
      { page, countRoute: "/all-latest-blogs-count" },
      setBlogs
    );
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    fetchBlogs(
      `${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`,
      {
        tag: pageState,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { tag: pageState },
      },
      setBlogs
    );
  };

  const fetchTrendingBlogs = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/trending-blogs`
      );
      setTrendingBlogs(data.blogs);
    } catch (error) {
      console.error("Error fetching trending blogs:", error);
      toast.error("Failed to load trending blogs. Please try again later.");
    }
  };

  const handleCategoryClick = (e) => {
    const category = e.target.innerText.toLowerCase();
    setBlogs(null);
    setPageState((prevState) => (prevState === category ? "home" : category));
  };

  useEffect(() => {
    if (activeTabRef.current) activeTabRef.current.click();

    if (pageState === "home") {
      fetchLatestBlogs(1);
    } else {
      fetchBlogsByCategory(1);
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
      <Toaster />
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
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
              <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={
                  pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory
                }
              />
            </>

            {trendingBlogs == null ? (
              <Loader />
            ) : trendingBlogs.length ? (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message="No trending blogs" />
            )}
          </InPageNavigation>
        </div>

        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">Recommended topics</h1>

              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => {
                  return (
                    <button
                      onClick={handleCategoryClick}
                      className={
                        "tag " +
                        (pageState == category ? " bg-black text-white " : " ")
                      }
                      key={i}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Top picks <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>

              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No trending blogs" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default Home;
