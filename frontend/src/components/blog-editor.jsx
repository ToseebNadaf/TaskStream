import { Link, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import EditorJS from "@editorjs/editorjs";
import axios from "axios";
import logo from "../images/logo.png";
import Banner from "../images/blog_banner.png";
import { uploadImage } from "../common/aws";
import AnimationWrapper from "../common/page-animation";
import { EditorContext } from "../pages/editor";
import { UserContext } from "../App";
import { tools } from "./tools";
import { z } from "zod";

const BlogEditor = () => {
  const DEFAULT_BANNER = Banner;

  const {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const { blog_id } = useParams();
  const navigate = useNavigate();

  const blogSchema = z.object({
    title: z.string().min(1, "Title cannot be empty."),
    banner: z
      .string()
      .url("Invalid banner URL.")
      .min(1, "Upload a blog banner."),
    content: z.object({
      blocks: z.array(z.any()).min(1, "Write something in your blog."),
    }),
  });

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "Let's write an awesome story",
        })
      );
    }
  }, [textEditor, content, setTextEditor]);

  const handleBannerUpload = (e) => {
    const image = e.target.files[0];
    if (image) {
      const loadingToast = toast.loading("Uploading...");

      uploadImage(image, access_token)
        .then((url) => {
          toast.dismiss(loadingToast);
          toast.success("Uploaded");
          setBlog({ ...blog, banner: url });
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          toast.error(err);
        });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    const input = e.target;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
    setBlog({ ...blog, title: input.value });
  };

  const handleError = (e) => {
    e.target.src = DEFAULT_BANNER;
  };

  const handlePublishEvent = () => {
    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          const validation = blogSchema.safeParse({
            title,
            banner,
            content: data,
          });

          if (!validation.success) {
            validation.error.errors.forEach((err) => toast.error(err.message));
            return;
          }

          setBlog({ ...blog, content: data });
          setEditorState("publish");
        })
        .catch((err) => console.error(err));
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Write a blog title before saving it as a Draft");
    }

    const loadingToast = toast.loading("Saving Draft...");
    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        const blogObj = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
        };

        axios
          .post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`,
            { ...blogObj, id: blog_id },
            {
              headers: {
                Authorization: `${access_token}`,
              },
            }
          )
          .then(() => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("Saved");
            setTimeout(() => navigate("/dashboard/blogs?tab=draft"), 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.error(response.data.error);
          });
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none h-20">
          <img src={logo} alt="Logo" className="w-full mt-1" />
        </Link>
        <p className="max-md:hidden text-black blog-title line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>

      <Toaster />

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={banner}
                  alt="Blog Banner"
                  className="z-20"
                  onError={handleError}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full max-h-20 h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white overflow-y-auto"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
