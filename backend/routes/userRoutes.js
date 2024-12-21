import express from "express";
import { googleAuth, signin, signup } from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/google-auth").post(googleAuth);

router.get("/get-upload-url", verifyJWT, async (req, res) => {
  try {
    const url = await generateUploadURL();
    res.status(200).json({ uploadURL: url });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
