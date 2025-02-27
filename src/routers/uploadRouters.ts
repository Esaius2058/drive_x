import { Router, Response, Request } from "express";
import fs from "fs";
import path from "path";
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
  getProfile,
  deleteFile,
  getUpdateForm,
  updateFile,
  getFile
} from "../controllers/uploadController";

const router = Router();

const uploadDir = path.join(__dirname, "../uploads");
// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
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
});
router.get("/folders", getFolders);
router.get("/folders/:id", getFolderDetails);
router.get("/folders/update/:id", getUpdateForm);
router.post("/folders/delete/:id", deleteFolder);
router.post("/folders/new-folder", createFolder);
router.post("/sign-up", createUser);
router.post("/log-in", loginUser);
router.post("/log-out", logoutUser);

//File Routes
router.get("/files/upload", ensureAuthenticated, (req: Request, res: Response) => {
  res.render("upload-form", { title: "Upload Form", user: req.user });
});
router.get("/file/update:id", getUpdateForm);
router.get("/file/:id", getFile);
router.post("/file/update:id", updateFile);
router.post("/files/delete/:id", deleteFile);
router.post("/file/upload", upload.single("file-upload"), uploadSingleFile);
router.post(
  "/files/upload",
  upload.array("files-upload", 5),
  uploadMultipleFiles
);

export default router;