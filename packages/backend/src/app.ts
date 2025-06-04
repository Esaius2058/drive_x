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
app.use(cors({
    origin: "http://localhost:3000"
}));
//Initialize the router directory
app.use("/api", router);
// Directory for static files
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`App listening on port ${PORT}`));