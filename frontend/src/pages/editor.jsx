import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor";
import PublishForm from "../components/publish-form";
import Loader from "../components/loader";
import axios from "axios";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

const Editor = () => {
  const { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [loading, setLoading] = useState(true);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blog_id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/get-blog",
          {
            blog_id,
            draft: true,
            mode: "edit",
          }
        );

        setBlog(response.data.blog);
      } catch (err) {
        console.error("Error fetching blog:", err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blog_id]);

  if (access_token === null) {
    return <Navigate to="/signin" />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {editorState === "editor" ? <BlogEditor /> : <PublishForm />}
    </EditorContext.Provider>
  );
};

export default Editor;
