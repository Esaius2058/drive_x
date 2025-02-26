import { Request, Response, NextFunction, json } from "express";
import passport, { handleDeleteFile } from "../services/userService";
import {
  handleCreateUser,
  handleUpdatePassword,
  handleUpdateName,
  handleCreateFolder,
  handleGetFolders,
  handleGetFolderDetails,
  handleDeleteFolder,
  handleUploadSingleFile,
  handleUploadMultipleFiles,
  handleUpdateFile,
} from "../services/userService";
import bcrypt from "bcryptjs";
import path from "path";
import { request } from "http";
import { error } from "console";

interface LoginRequestBody {
  email: string;
  password: string;
}

export const getProfile = async (req: Request, res: Response) => {
  const userId = Number(req.user?.id);
  const folders = await handleGetFolders(userId);
  res.render("profile", { title: `${req.user?.name}`, folders });
};

export const uploadSingleFile = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  try {
    const filePath = path.join("uploads", req.file.filename);
    const { folderId, userId, filename } = req.body;

    await handleUploadSingleFile(
      filename,
      Number(folderId),
      req.file.size,
      Number(userId),
      path.extname(req.file.originalname),
      filePath
    );

    res.status(201).json({ message: "File uploaded successfully", filePath });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Error uploading file" });
  }
};

export const uploadMultipleFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.files || req.files.length === 0) {
    res.status(400).json({ message: "No files uploaded" });
  }

  try {
    const { folderId, userId } = req.body;
    const files = req.files as Express.Multer.File[];

    await handleUploadMultipleFiles(
      files,
      Number(folderId),
      Number(userId)
    );

    res
      .status(201)
      .json({ message: "Files uploaded successfully", files: req.files });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Error uploading files" });
  }
};

export const uploadMultipleFields = (req: Request, res: Response) => {
  if (!req.files) return res.status(400).json({ message: "No files uploaded" });
  return res.status(200).json({ files: req.files });
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const fullname = req.body.firstname + " " + req.body.lastname;
  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    const newUser = await handleCreateUser(fullname, email, hashedPassword);
    res.status(201).json({
      message: `Welcome ${req.body.firstname}`,
      user: newUser,
    });
  } catch (err: any) {
    console.error("Internal server error: ", err);
    res.status(500).json("Internal server error");
  }
};

export const loginUser = (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
) => {
  return passport.authenticate(
    "local",
    (err: unknown, user: any, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.redirect("/log-in");
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        console.log("User logged in: ", req.user);
        return getProfile(req, res);
      });
    }
  )(req, res, next);
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    req.session.destroy(() => {
      res.redirect("/"); //redirect to dashboard after logout
    });
  });
};

export const ensureAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/log-in");
};

export const updateEmail = async (req: Request, res: Response) => {
  const newEmail = req.body.email;
  try {
    const updatedUser = await handleUpdateName(req.user?.name, newEmail);
    updatedUser
      ? res.status(200).json({
          message: `Updated successful`,
          update: updatedUser.name,
        })
      : res.status(400).json("User update failed or user not found.");
  } catch (err: any) {
    console.error("Internal server error: ", err);
    res.status(500).json({ error: err.message });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const email = req.user?.email;
  const newPassword = req.body.newpassword;
  const oldPassword = req.body.oldpassword;
  const oldHashed = req.user?.passwordHash
    ? req.user?.passwordHash.toString()
    : "";

  try {
    if (await bcrypt.compare(oldPassword, oldHashed)) {
      await handleUpdatePassword(email, newPassword);
      return res
        .status(200)
        .json({ message: `Updated ${req.user?.name}'s password.` });
    }
  } catch (err: any) {
    console.error("Internal server error: ", err);
    res.status(500).json({ error: err.message });
  }
};

export const createFolder = async (req: Request, res: Response) => {
  const { foldername, parentid } = req.body;
  const userId = Number(req.user?.id);

  try {
    const folder = await handleCreateFolder(
      foldername,
      Number(parentid),
      userId
    );
    res
      .status(201)
      .json({ message: "Created folder successfully", folder: folder });
  } catch (err: any) {
    console.error("Internal server error: ", err);
    res.status(500).json({ error: err.message });
  }
};

export const getFolders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = Number(req.user?.id);
  try {
    const folders = await handleGetFolders(userId);
    res.render("profile", { title: "Your Folders", folders });
  } catch (err: any) {
    console.error("Internal server error: ", err);
    res.status(500).json({ error: err.message });
  }
};

export const getFolderDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const folderDetails = await handleGetFolderDetails(Number(id));
    if (!folderDetails) {
      res.status(404).json({ message: "Folder not found" });
    }

    res
      .status(200)
      .json({ folder: folderDetails?.name, files: folderDetails?.file });
  } catch (err: any) {
    console.error("Internal server error: ", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  const { id } = req.params;

  try{
    await handleDeleteFile(Number(id));
    res.status(200).json({message: "File deleted successfully!"});
  }catch(err: any){
    console.error("Internal server error: ", err);
    res.status(500).json({error: err.message});
  }
}

export const getUpdateForm = async (req: Request, res: Response) => {}

export const updateFile = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {filename} = req.body;

  try{
    await handleUpdateFile(Number(id), filename);
  }catch(err: any){
    console.error("Internal server error: ", err);
    res.status(500).json({error: err.message});
  }
}

export const deleteFolder = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await handleDeleteFolder(Number(id));
    res.status(200).json({ message: "Folder deleted successfully!" });
  } catch (err: any) {
    console.error("Internal server error: ", err);
    res.status(500).json({ error: err.message });
  }
};
