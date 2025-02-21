import * as dotenv from "dotenv";
import express, { Application } from "express";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import passport from "passport";
import router from "./routers/uploadRouters";
import path from "path";
dotenv.config();

const app: Application = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "../src", "views"));

// Middleware to parse incoming JSON requests into JavaScript objects
app.use(express.json());
// Middleware to parse URL-encoded data (like form submissions)
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, //ms
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true, //A flag indicating to use the session ID as the Prisma Record ID
      dbRecordIdFunction: undefined, //A function to generate the Prisma Record ID for a given session ID
    }),
  })
);
//Middleware that initializes Passport.
app.use(passport.initialize());
//Middleware that integrates Passport with Express sessions.
app.use(passport.session());
//Initialize the router directory
app.use("/", router);
// Directory for static files
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
