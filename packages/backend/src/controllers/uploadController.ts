import { Request, Response, NextFunction, json } from "express";
import { supabase } from "../utils/supabaseClient";
import multer from "multer";
import sanitizeFilename from "sanitize-filename";
import {
  handleGetFolderDetails,
  handleGetUser,
  handleGetFile,
} from "../services/userService";
import jwt from "jsonwebtoken";

export interface CustomRequest {
  token?: string;
  user?: any;
}

interface FileMetadata {
  user_id?: string;
  folder_id: string | null;
  name: string;
  size: number;
  file_type: string;
  storage_path: string;
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
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const user = req.user;
  const userId = user?.id;

  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  try {
    const file = req.file;
    const safeName = sanitizeFilename(file.originalname);
    const filePath = `user-${user?.id}/${Date.now()}-${safeName}`;
    const { folderid } = req.body;

    //upload to supabase storage
    const { error: uploadError } = await supabase.storage
      .from("user-files")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false, // prevent overwrites
      });

    if (uploadError) throw uploadError;

    const fileMetadata: FileMetadata = {
      user_id: userId,
      folder_id: folderid || null,
      name: safeName,
      size: file.size,
      file_type: file.mimetype,
      storage_path: filePath,
    };
    // Insert metadata into the database
    const { error: dbError } = await supabase
      .from("Files")
      .insert(fileMetadata);

    if (dbError) throw dbError;

    const { publicUrl } = supabase.storage
      .from("user-files")
      .getPublicUrl(filePath).data;

    res
      .status(201)
      .json({success: true, url: publicUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Error uploading file" });
  }
};

export const uploadMultipleFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const user = req.user;
  if (!req.files || req.files.length === 0) {
    res.status(400).json({ message: "No files uploaded" });
  }

  try {
    const { folderid } = req.body;
    const files = req.files as Express.Multer.File[];
    const maxSize = 15 * 1024 * 1024; //15MB

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        if (file.size) {
          throw new Error(`File ${file.originalname} exceeds 15MB limit`);
        }

        const safeName = sanitizeFilename(file.originalname);
        const filePath = `user-${user?.id}/${Date.now()}-${safeName}`;

        //upload to supabase storage
        const { error: uploadError } = await supabase.storage
          .from("user-files")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        return {
          user_id: user?.id,
          folder_id: folderid || null,
          name: safeName,
          storage_path: filePath,
          size: file.size,
          file_type: file.mimetype,
        } satisfies FileMetadata;
      })
      
    );

    const { error: dbError } = await supabase
      .from('Files')
      .insert(uploadResults);

      if (dbError) throw dbError;

      const filesWithUrls = await Promise.all(
        uploadResults.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('user-files')
            .getPublicUrl(file.storage_path);
  
          return { ...file, publicUrl };
        })
      );

      res.status(201).json({
        success: true,
        files: filesWithUrls,
      });
  } catch (error: any) {
    console.error("Upload error:", error);
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
