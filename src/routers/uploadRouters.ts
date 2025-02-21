import { Router, Response, Request } from "express";
import multer from "multer";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  ensureAuthenticated,
  createUser
} from "../controllers/uploadController";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const fileName = req.body.filename || file.originalname;
    cb(null, `${Date.now()}-${fileName}`);
  },
});

const upload = multer({ storage });

router.get("/", (req: Request, res: Response) => {
  res.render("welcome", { title: "DriveX" });
});
router.get("/log-in", (req: Request, res: Response) => {
  res.render("log-in", { title: "Login Form" });
});
router.get("/sign-up", (req: Request, res: Response) => {
    res.render("sign-up", { title: "DriveX SignUp"});
});
router.get("/profile", ensureAuthenticated, (req: Request, res: Response) => {
  res.render("profile", { title: "Profile" });
});
router.get("/upload", ensureAuthenticated, (req: Request, res: Response) => {
  res.render("upload-form", { title: "Upload Form" });
});
router.post("/sign-up", createUser);
router.post("/upload", upload.single("file-upload"), uploadSingleFile);
router.post(
  "/upload-multiple",
  upload.array("files-upload"),
  uploadMultipleFiles
);

export default router;