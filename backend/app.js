import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ErrorMiddleware from "./middlewares/Error.js";

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

app.use("/api/v1", userRoutes);
app.use("/api/v1", blogRoutes);
app.use("/api/v1", commentRoutes);
app.use("/api/v1", notificationRoutes);

app.use(ErrorMiddleware);

export default app;
