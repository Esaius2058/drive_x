import { Request, Response, NextFunction, json } from "express";
import { supabase } from "../utils/supabaseClient";
import sanitizeFilename from "sanitize-filename";
import fs from "fs/promises";
import {
  handleGetFolderDetails,
  handleGetUser,
  handleGetFile,
} from "../services/userService";
import { CustomUser } from "../services/userService";

export interface CustomRequest {
  user?: CustomUser;
}

export interface FileMetadata {
  id: string;
  name: string;
  bucket_id: string;
  metadata: Object | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: null;
  mimetype?: string;
}

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
    console.log("File:", file);
    const safeName = sanitizeFilename(file.originalname);
    const filePath = `${user?.id}/${Date.now()}-${safeName}`;

    //read file from disk
    const buffer = await fs.readFile(file.path);

    //upload to supabase storage
    const { data, error: uploadError } = await supabase.storage
      .from("user-files")
      .upload(filePath, buffer, {
        contentType: file.mimetype,
        upsert: false, // prevent overwrites
      });

    const newUploadError = {
      ...uploadError,
      name: "Error from Supabase Storage",
    };
    if (uploadError) throw newUploadError;

    // Insert metadata into the database
    const { data: dbData, error: dbError } = await supabase
      .from("file_metadata")
      .insert([
        {
          id: data.id,
          user_id: userId,
          name: file.originalname,
          type: file.mimetype,
          storage_path: data.path,
          stored_name: file.filename,
          size: file.size,
        },
      ]);

    const newDbError = {
      ...dbError,
      message: "Error from Database",
    };

    if (dbError) throw newDbError;

    const insertedFile = dbData?.[0]; 

    const { error: fileLogError } = await supabase.from("FileLogs").insert([
      {
        file_id: data.id,
        action: "created",
        user_id: userId,
        old_value: null,
        new_value: insertedFile,
      },
    ]);

    if (fileLogError) {
      console.error("Log insert error:", fileLogError);
    }

    const { publicUrl } = supabase.storage
      .from("user-files")
      .getPublicUrl(filePath).data;

    res.status(201).json({ success: true, url: publicUrl });
    return;
  } catch (error: any) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({
        message: "Error uploading file",
        type: "Internal Server Error",
        error,
      });
    return;
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
        };
      })
    );

    const { error: dbError } = await supabase
      .from("Files")
      .insert(uploadResults);

    if (dbError) throw dbError;

    const filesWithUrls = await Promise.all(
      uploadResults.map(async (file) => {
        const {
          data: { publicUrl },
        } = supabase.storage.from("user-files").getPublicUrl(file.storage_path);

        return { ...file, publicUrl };
      })
    );

    res.status(201).json({
      success: true,
      files: filesWithUrls,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({
        message: "Error uploading files",
        type: "Internal Server Error",
        error,
      });
  }
};

export const uploadMultipleFields = (req: Request, res: Response) => {
  if (!req.files) return res.status(400).json({ message: "No files uploaded" });
  return res.status(200).json({ files: req.files });
};
