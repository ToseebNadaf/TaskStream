import User from "../models/User.js";
import { nanoid } from "nanoid";

export const generateUsername = async (email) => {
  let username = email.split("@")[0];

  const isUsernameExists = await User.exists({
    "personal_info.username": username,
  });

  if (isUsernameExists) {
    username += nanoid(5);
  }

  return username;
};
