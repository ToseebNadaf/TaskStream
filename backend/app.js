import express from "express";
import { config } from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ErrorMiddleware from "./middlewares/Error.js";

config({
  path: "./config/config.env",
});

const app = express();

app.use("/api/v1", userRoutes);
app.use("/api/v1", blogRoutes);
app.use("/api/v1", commentRoutes);
app.use("/api/v1", notificationRoutes);

app.use(ErrorMiddleware);

export default app;
