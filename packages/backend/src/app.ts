import * as dotenv from "dotenv";
import express, { Application } from "express";
import router from "./routers/uploadRouters";
import path from "path";
import cors from "cors";
dotenv.config();

const app: Application = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "../src", "views"));

// Middleware to parse incoming JSON requests into JavaScript objects
app.use(express.json());
// Middleware to parse URL-encoded data (like form submissions)
app.use(express.urlencoded({ extended: true }));
// Middleware to enable CORS (Cross-Origin Resource Sharing)

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://file-uploader-nu.vercel.app"]
    : ["http://localhost:5173", "https://file-uploader-nu.vercel.app"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
//Initialize the router directory
app.use("/api", router);
// Directory for static files
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`App listening on port ${PORT}`));
