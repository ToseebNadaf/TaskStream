import express from "express";
import {
  changePassword,
  getProfile,
  getUploadUrl,
  googleAuth,
  searchUsers,
  signin,
  signup,
  updateProfile,
  updateProfileImg,
} from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/get-upload-url").get(verifyJWT, getUploadUrl);
router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/google-auth").post(googleAuth);
router.post("/change-password", verifyJWT, changePassword);
router.post("/search-users", searchUsers);
router.route("/get-profile").post(getProfile);
router.post("/update-profile-img", verifyJWT, updateProfileImg);
router.post("/update-profile", verifyJWT, updateProfile);

export default router;
