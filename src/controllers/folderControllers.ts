import {
    handleCreateFolder,
    handleGetFolders,
    handleGetFolderDetails,
    handleDeleteFolder,
    handleUploadMultipleFiles,
    handleUpdateFile,
    handleGetUser,
    handleDeleteFile,
    handleGetFile,
} from "../services/userService";
import { Request, Response, NextFunction } from "express";

export const newFolderForm = async (req: Request, res: Response) => {
    const userEmail = req.user?.email || "";
    const user = await handleGetUser(userEmail);
    const folders = user?.Folder;
  
    res.render("new-folder", { title: "New Folder", folders });
  };
  
  export const createFolder = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { foldername, parentid: parentIdRaw } = req.body;
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
  
      const userId = user.id;
      const folders = user.Folder || [];
  
      const parentid =
        folders.length === 1 ? folders[0].id : Number(parentIdRaw) || undefined;
  
      const folder = await handleCreateFolder(foldername, userId, parentid);
      //await supabase.storage.
  
      res.status(201).json({ message: "Created folder successfully", folder });
    } catch (err: any) {
      console.error("Internal server error:", err);
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
  
      res.status(200).json({
        folder: folderDetails?.name,
        parentFolder: folderDetails?.parentFolderId,
        files: folderDetails?.file,
      });
    } catch (err: any) {
      console.error("Internal server error: ", err);
      res.status(500).json({ error: err.message });
    }
  };
  
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