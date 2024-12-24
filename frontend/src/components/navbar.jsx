import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation";
import axios from "axios";

const Navbar = () => {
  const [isSearchBoxVisible, setIsSearchBoxVisible] = useState(false);
  const [isUserNavPanelVisible, setIsUserNavPanelVisible] = useState(false);

  const navigate = useNavigate();

  const {
    userAuth,
    userAuth: { access_token, profile_img, new_notification_available },
    setUserAuth,
  } = useContext(UserContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!access_token) return;

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/new-notification`,
          {
            headers: { Authorization: access_token },
          }
        );
        setUserAuth((prevState) => ({ ...prevState, ...data }));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [access_token, setUserAuth]);

  const toggleUserNavPanel = useCallback(() => {
    setIsUserNavPanelVisible((prev) => !prev);
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.trim();
    if (event.key === "Enter" && query) {
      navigate(`/search/${query}`);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setIsUserNavPanelVisible(false), 200);
  };

  return (
    <>
      <nav className="navbar z-50">
        <Link to="/" className="flex-none h-20">
          <img src={logo} className="w-full mt-1" />
        </Link>

        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
            (isSearchBoxVisible ? "show" : "hide")
          }
        >
          <input
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
            onKeyDown={handleSearch}
          />

          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => setIsSearchBoxVisible((currentVal) => !currentVal)}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>

          <Link to="/editor" className="hidden md:flex gap-2 link">
            <i className="fi fi-rr-file-edit"></i>
            <p className="text-xl">Write</p>
          </Link>

          {access_token ? (
            <>
              <Link to="/dashboard/notifications">
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                  <i className="fi fi-rr-bell text-2xl block mt-2"></i>
                  {new_notification_available ? (
                    <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span>
                  ) : (
                    ""
                  )}
                </button>
              </Link>

              <div
                className="relative"
                onClick={toggleUserNavPanel}
                onBlur={handleBlur}
              >
                <button className="w-12 h-12 mt-1">
                  <img
                    src={profile_img}
                    className="w-full h-full object-cover rounded-full"
                  />
                </button>

                {isUserNavPanelVisible ? <UserNavigationPanel /> : ""}
              </div>
            </>
          ) : (
            <>
              <Link className="btn-dark py-2" to="/signin">
                Sign In
              </Link>
              <Link className="btn-light py-2 hidden md:block" to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
