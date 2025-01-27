import { z } from "zod";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateUploadURL } from "../utils/s3Utils.js";
import { getAuth } from "firebase-admin/auth";
import {
  changePasswordSchema,
  getProfileSchema,
  searchUsersSchema,
  signupSchema,
  updateProfileImgSchema,
  updateProfileSchema,
} from "../utils/validation.js";
import { generateUsername } from "../utils/userUtils.js";
import { formatDatatoSend } from "../utils/authUtils.js";
import { signinSchema } from "../utils/validation.js";

export const getUploadUrl = async (req, res) => {
  try {
    const url = await generateUploadURL();
    res.status(200).json({ uploadURL: url });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
};

export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = signupSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUsername(email);

    const user = new User({
      personal_info: { fullname, email, password: hashedPassword, username },
    });

    const savedUser = await user.save();

    return res.status(201).json(formatDatatoSend(savedUser));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: err.errors.map((e) => e.message).join(", ") });
    }

    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }

    return res.status(500).json({ error: err.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = signinSchema.parse(req.body);

    const user = await User.findOne({ "personal_info.email": email });

    if (!user) {
      return res.status(403).json({ error: "Email not found" });
    }

    if (user.google_auth) {
      return res.status(403).json({
        error: "Account was created using Google. Try logging in with Google.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.personal_info.password
    );

    if (!passwordMatch) {
      return res.status(403).json({ error: "Incorrect password" });
    }

    return res.status(200).json(formatDatatoSend(user));
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }
};

export const googleAuth = async (req, res) => {
  const { access_token } = req.body;

  try {
    const decodedUser = await getAuth().verifyIdToken(access_token);
    let { email, name, picture } = decodedUser;

    picture = picture.replace("s96-c", "s384-c");

    let user = await User.findOne({ "personal_info.email": email })
      .select(
        "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
      )
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });

    if (user) {
      if (!user.google_auth) {
        return res.status(403).json({
          error:
            "This email was signed up without google. Please log in with password to access the account",
        });
      }
    } else {
      let username = await generateUsername(email);

      user = new User({
        personal_info: {
          fullname: name,
          email,
          username,
        },
        google_auth: true,
      });

      await user.save().catch((err) => {
        return res.status(500).json({ error: err.message });
      });
    }

    return res.status(200).json(formatDatatoSend(user));
  } catch (err) {
    return res.status(500).json({
      error:
        "Failed to authenticate you with google. Try with some other google account",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body
    );

    const user = await User.findOne({ _id: req.user });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.google_auth) {
      return res.status(403).json({
        error:
          "You can't change account password because you signed in through Google.",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.personal_info.password
    );
    if (!isMatch) {
      return res.status(403).json({ error: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { _id: req.user },
      { "personal_info.password": hashedPassword }
    );

    return res.status(200).json({ status: "Password changed successfully" });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: error.errors.map((e) => e.message).join(", "),
      });
    }
    console.error(error.message);
    return res.status(500).json({
      error: "An error occurred while changing the password. Please try again.",
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = searchUsersSchema.parse(req.body);

    User.find({ "personal_info.username": new RegExp(query, "i") })
      .limit(50)
      .select(
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      )
      .then((users) => {
        return res.status(200).json({ users });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: err.errors.map((e) => e.message).join(", ") });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { username } = getProfileSchema.parse(req.body);

    const user = await User.findOne({
      "personal_info.username": username,
    }).select("-personal_info.password -google_auth -updatedAt -blogs");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: err.errors.map((e) => e.message).join(", ") });
    }

    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateProfileImg = async (req, res) => {
  try {
    const parsedData = updateProfileImgSchema.parse(req.body);

    const { url } = parsedData;

    await User.findOneAndUpdate(
      { _id: req.user },
      { "personal_info.profile_img": url }
    );

    return res.status(200).json({ profile_img: url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const { username, bio, social_links } = req.body;

  try {
    updateProfileSchema.parse({ username, bio, social_links });
  } catch (err) {
    return res.status(403).json({ error: err.errors[0].message });
  }

  let socialLinksArr = Object.keys(social_links || {});

  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

        if (
          !hostname.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] != "website"
        ) {
          return res.status(403).json({
            error: `${socialLinksArr[i]} link is invalid. Please enter a valid link`,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({
      error: "You must provide full social links with http(s) included",
    });
  }

  let updateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };

  try {
    await User.findOneAndUpdate({ _id: req.user }, updateObj, {
      runValidators: true,
    });
    return res.status(200).json({ username });
  } catch (err) {
    if (err.code == 11000) {
      return res.status(500).json({ error: "Username is already taken" });
    }
    return res.status(500).json({ error: err.message });
  }
};
