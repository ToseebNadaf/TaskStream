import express from "express";
import {
  changePassword,
  getUploadUrl,
  googleAuth,
  searchUsers,
  signin,
  signup,
} from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/get-upload-url").get(verifyJWT, getUploadUrl);
router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/google-auth").post(googleAuth);
router.post("/change-password", verifyJWT, changePassword);
router.post("/search-users", searchUsers);

export default router;
