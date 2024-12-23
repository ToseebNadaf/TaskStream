import { useContext } from "react";
import { EditorContext } from "../pages/editor";

const Tag = ({ tag, tagIndex }) => {
  const {
    blog,
    blog: { tags },
    setBlog,
  } = useContext(EditorContext);

  const enableEditing = (e) => {
    e.target.setAttribute("contentEditable", true);
    e.target.focus();
  };

  const handleTagEdit = (e) => {
    const currentTag = e.target.innerText.trim();

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      const updatedTags = [...tags];
      updatedTags[tagIndex] = currentTag;

      setBlog({ ...blog, tags: updatedTags });

      e.target.setAttribute("contentEditable", false);
    }
  };

  const handleTagDelete = () => {
    const updatedTags = tags.filter((t, index) => index !== tagIndex);
    setBlog({ ...blog, tags: updatedTags });
  };

  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
      <p
        className="outline-none cursor-pointer"
        onKeyDown={handleTagEdit}
        onClick={enableEditing}
        tabIndex={0}
      >
        {tag}
      </p>
      <button
        className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
        onClick={handleTagDelete}
        aria-label={`Delete tag ${tag}`}
      >
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default Tag;
