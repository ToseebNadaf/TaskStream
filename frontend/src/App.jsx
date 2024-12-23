import React, { createContext, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { lookInSession } from "./common/session";
import Navbar from "./components/navbar";
import UserAuthForm from "./pages/userAuthForm";
import Editor from "./pages/editor";
import Home from "./pages/home";
import Search from "./pages/search";
import PageNotFound from "./pages/pageNotFound";
import Profile from "./pages/profile";
import Blog from "./pages/blog";
import SideNavbar from "./components/sidenavbar";
import EditProfile from "./pages/edit-profile";
import ChangePassword from "./pages/change-password";

export const UserContext = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:blog_id" element={<Editor />} />
        <Route path="/" element={<Navbar />}>
          <Route index element={<Home />} />
          <Route path="settings" element={<SideNavbar />}>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="search/:query" element={<Search />} />
          <Route path="user/:id" element={<Profile />} />
          <Route path="blog/:blog_id" element={<Blog />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
