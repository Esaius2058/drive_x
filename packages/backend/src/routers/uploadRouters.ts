import { Router, Response, Request } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  getUpdateForm,
  uploadForm
} from "../controllers/uploadController";
import {
  verifyJWT,
  validateUser,
  createUser,
  getProfile,
  loginUser,
  logoutUser,
} from "../controllers/userControllers";
import {
  createFolder,
  getFolderDetails,
  getFolders,
  newFolderForm,
  deleteFolder
} from "../controllers/folderControllers";
import {
  updateFile,
  getFile,
  deleteFile
} from "../controllers/fileControllers";

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
  res.render("sign-up", { title: "DriveX SignUp" });
});
router.get("/profile", verifyJWT, getProfile);

// Folder Routes
router.get("/folders/new-folder", newFolderForm);
router.get("/folders", getFolders);
router.get("/folders/:id", getFolderDetails);
router.get("/folders/update/:id", getUpdateForm);
router.post("/folders/delete/:id", deleteFolder);
router.post("/folders/new-folder", createFolder);
router.post("/sign-up", validateUser, createUser);
router.post("/log-in", validateUser, loginUser);
router.post("/log-out", logoutUser);

//File Routes
router.get("/files/upload", verifyJWT, uploadForm);
router.get("/file/update:id", verifyJWT, getUpdateForm);
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