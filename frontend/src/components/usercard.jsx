import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  const {
    personal_info: { fullname, username, profile_img },
  } = user;

  return (
    <Link
      to={`/user/${username}`}
      className="flex gap-4 items-center p-4 mb-4 bg-white shadow-sm hover:shadow-md rounded-lg transition-shadow duration-300"
    >
      <img
        src={profile_img}
        alt={`${fullname}'s profile`}
        className="w-14 h-14 rounded-full object-cover border border-gray-200"
      />

      <div>
        <h1 className="font-semibold text-lg capitalize text-gray-800 truncate">
          {fullname}
        </h1>
        <p className="text-sm text-gray-500">@{username}</p>
      </div>
    </Link>
  );
};

export default UserCard;
