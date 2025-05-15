import { Router, Response, Request, application, ErrorRequestHandler } from "express";
import fs from "fs";
import path from "path";
import multer, {MulterError} from "multer";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  getUpdateForm,
  uploadForm,
} from "../controllers/uploadController";
import {
  verifyJWT,
  validateUser,
  createUser,
  getProfile,
  loginUser,
  logoutUser,
  updatePassword,
  deleteProfile,
  updateRole,
} from "../controllers/userControllers";
import {
  createFolder,
  getFolderDetails,
  getFolders,
  newFolderForm,
  deleteFolder,
} from "../controllers/folderControllers";
import {
  updateFile,
  getFile,
  deleteFile,
} from "../controllers/fileControllers";

const router = Router();

const uploadDir = path.resolve(__dirname, "../uploads");
// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir); // Use the pre-created directory
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
    files: 5, // Optional: limit number of files
  }
});

router.get("/", (req: Request, res: Response) => {
  res.render("welcome", { title: "DriveX" });
});
router.get("/log-in", (req: Request, res: Response) => {
  res.render("log-in", { title: "DriveX Login" });
});
router.get("/sign-up", (req: Request, res: Response) => {
  res.render("sign-up", { title: "DriveX SignUp" });
});

router.post("/sign-up", createUser);
router.post("/log-in", loginUser);
router.post("/log-out", logoutUser);

router.use(verifyJWT);

// Profile Routes
router.get("/profile", getProfile);
router.post("/profile/update/new-password", updatePassword);
router.post("/profile/update/role", updateRole);
router.post("/profile/delete", deleteProfile);

// Folder Routes
router.get("/folders/new-folder", newFolderForm);
router.get("/folders", getFolders);
router.get("/folders/:id", getFolderDetails);
router.get("/folders/update/:id", getUpdateForm);
router.post("/folders/delete/:id", deleteFolder);
router.post("/folders/new-folder", createFolder);

//File Routes
router.get("/files/upload", uploadForm);
router.get("/file/update:id", getUpdateForm);
router.get("/file/:id", getFile);
router.post("/file/update:id", updateFile);
router.post("/files/delete/:id", deleteFile);
router.post("/file/upload", upload.single("file"), uploadSingleFile);
router.post(
  "/files/upload",
  upload.array('files', 5),
  uploadMultipleFiles
);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      error: err.code,
      message: err.message,
      field: err.field
    });
    return; // Explicit return to satisfy TypeScript
  }

  if (err instanceof Error) {
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: err.message
    });
    return;
  }

  res.status(500).json({
    error: 'UNKNOWN_ERROR',
    message: 'Something went wrong'
  });
};
router.use(errorHandler);

export default router;