import { Request, Response, NextFunction, json } from "express";
import { supabase } from "../utils/supabaseClient";
import multer from "multer";
import passport, {
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
  handleGetUser,
  handleDeleteFile,
  handleGetFile,
} from "../services/userService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CustomUser } from "../services/userService";
import { body, validationResult } from "express-validator";

export interface CustomRequest {
  token?: string;
  user?: any;
}

const upload = multer({ storage: multer.memoryStorage() });
const jwtSecret = process.env.JWT_SECRET_KEY as string;

export const uploadForm = async (req: Request, res: Response) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    res.status(401).json({ error: "Unauthorized: User not logged in" });
    return;
  }
  const user = await handleGetUser(userEmail);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const folders = user.Folder;

  res.render("upload-form", {
    title: "Upload Form",
    user: req.user,
    folders: folders,
  });
};

export const uploadSingleFile = async (req: Request, res: Response) => {
  jwt.verify(req.token as string, jwtSecret, (err, authData) => {
    if (err) {
      console.log("Error verifying jwt: ", err);
      res.status(403).json({ err });
    } else {
      console.log("auth data: ", authData);
    }
  });

  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  try {
    const file = req.file;
    const filePath = `uploads/${Date.now()}-${file.originalname}`;
    const { folderid, userid, filename } = req.body;
    const user = supabase.auth.getUser();
    if (user) {
      console.log("User ID:", (await user).data.user?.id);
    } else {
      console.log("No user is logged in.");
    }

    //upload to supabase
    const { data, error } = await supabase.storage
      .from("user-files")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });


    if (error) {
      res.status(500).json({ message: "Error uploading file", error });
      return;
    }

    // Insert metadata into the database
    const { data: dbData, error: dbError } = await supabase
      .from("Files")
      .insert([
        {
          user_id: userid,
          folder_id: folderid,
          name: filename,
          size: file.size,
          file_type: file.mimetype,
        },
      ]);

    if (dbError) {
      console.error("Database error:", dbError);
      res.status(500).json({ message: "Error saving file metadata" });
      return;
    }

    if (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Error uploading file" });
      return;
    }

    const { publicUrl } = supabase.storage
      .from("user-files")
      .getPublicUrl(filePath).data;

    res
      .status(201)
      .json({ message: "File uploaded successfully", url: publicUrl });
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

    await handleUploadMultipleFiles(files, Number(folderId), Number(userId));

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

export const getUpdateForm = async (req: Request, res: Response) => {
  jwt.verify(req.token as string, jwtSecret, (err, authData) => {
    if (err) {
      console.log("Error verifying jwt: ", err);
      res.status(403).json({ err });
    } else {
      console.log("auth data: ", authData);
    }
  });

  if (req.baseUrl == "/file") {
    const fileId = req.params;
    const file = await handleGetFile(Number(fileId));
    try {
      res.render("update-file", { title: "File Update", file });
    } catch (err: any) {
      console.error("Internal server error: ", err);
      res.status(500).json({ error: err.message });
    }
  } else {
    const folderId = req.params;
    const folder = await handleGetFolderDetails(Number(folderId));
    try {
      res.render("update-folder", { title: "Folder Update", folder });
    } catch (err: any) {
      console.error("Internal server error: ", err);
      res.status(500).json({ error: err.message });
    }
  }
};