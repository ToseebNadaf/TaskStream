import app from "./app.js";
import connectDatabase from "./config/database.js";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountKey = JSON.parse(
  fs.readFileSync(
    path.resolve("./writeflow-2892a-firebase-adminsdk-lwq04-ac461da43f.json")
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

connectDatabase();

app.listen(process.env.PORT, () => {
  console.log(`Server is working on: ${process.env.PORT}`);
});
