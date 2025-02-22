import { Router, Response, Request } from "express";
import multer from "multer";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  ensureAuthenticated,
  createUser,
  loginUser,
  logoutUser,
  createFolder,
  getFolderDetails,
  getFolders,
  deleteFolder,
  getProfile
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
  res.render("log-in", { title: "DriveX Login" });
});
router.get("/sign-up", (req: Request, res: Response) => {
    res.render("sign-up", { title: "DriveX SignUp"});
});
router.get("/profile", ensureAuthenticated, getProfile);

// Folder Routes
router.get("/folders/new-folder", (req: Request, res: Response) => {
  res.render("new-folder");
});7
router.get("/folders", getFolders);
router.get("/folders/:id", getFolderDetails);
router.post("/folders/delete/:id", deleteFolder);
router.post("/folders/new-folder", createFolder);
router.post("/sign-up", createUser);
router.post("/log-in", loginUser);
router.post("/log-out", logoutUser);

//File Routes
router.get("/files/upload", ensureAuthenticated, (req: Request, res: Response) => {
  res.render("upload-form", { title: "Upload Form", user: req.user });
});
router.post("/file/upload", upload.single("file-upload"), uploadSingleFile);
router.post(
  "/files/upload",
  upload.array("files-upload", 5),
  uploadMultipleFiles
);

export default router;