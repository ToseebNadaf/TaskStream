import express from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import {
  checkNewNotification,
  getAllNotificationsCount,
  getNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/new-notification", verifyJWT, checkNewNotification);
router.post("/notifications", verifyJWT, getNotifications);
router.post("/all-notifications-count", verifyJWT, getAllNotificationsCount);

export default router;
