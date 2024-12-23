import Notification from "../models/Notification.js";
import {
  newNotificationValidation,
  notificationFilterSchema,
  notificationValidation,
} from "../utils/validation.js";

export const checkNewNotification = (req, res) => {
  const user_id  = req.user;

  try {
    newNotificationValidation.parse({ user_id });

    Notification.exists({
      notification_for: user_id,
      seen: false,
      user: { $ne: user_id },
    })
      .then((result) => {
        if (result) {
          return res.status(200).json({ new_notification_available: true });
        } else {
          return res.status(200).json({ new_notification_available: false });
        }
      })
      .catch((err) => {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
      });
  } catch (err) {
    return res.status(400).json({
      error: "Invalid request data",
    });
  }
};

export const getNotifications = async (req, res) => {
  const  user_id  = req.user;
  const { page, filter, deletedDocCount } = req.body;

  try {
    notificationValidation.parse({ page, filter, deletedDocCount });
  } catch (err) {
    return res.status(400).json({ error: err.errors });
  }

  let maxLimit = 10;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };
  let skipDocs = (page - 1) * maxLimit;

  if (filter !== "all") {
    findQuery.type = filter;
  }

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  try {
    const notifications = await Notification.find(findQuery)
      .skip(skipDocs)
      .limit(maxLimit)
      .populate("blog", "title blog_id")
      .populate(
        "user",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .populate("comment", "comment")
      .populate("replied_on_comment", "comment")
      .populate("reply", "comment")
      .sort({ createdAt: -1 })
      .select("createdAt type seen reply");

    await Notification.updateMany(findQuery, { seen: true })
      .skip(skipDocs)
      .limit(maxLimit);

    return res.status(200).json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

export const getAllNotificationsCount = async (req, res) => {
  const { filter } = req.body;
  const  user_id  = req.user;

  try {
    notificationFilterSchema.parse({ filter });

    let findQuery = { notification_for: user_id, user: { $ne: user_id } };

    if (filter !== "all") {
      findQuery.type = filter;
    }

    const count = await Notification.countDocuments(findQuery);
    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.error("Zod Validation Error:", err.errors);
    return res.status(400).json({ error: "Invalid request data" });
  }
};
