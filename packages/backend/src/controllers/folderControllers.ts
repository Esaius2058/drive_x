import { Request, Response } from "express";
import { supabase } from "../utils/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

interface Folder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  updated_at?: Date;
  created_at?: Date;
}

export const newFolderForm = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const { data: folders } = await supabase
    .from("Folders")
    .select("*")
    .eq("user_id", userId);

  res.render("new-folder", { title: "New Folder", folders });
};

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { foldername, parentid } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.id;
    const parentId = parentid || null;

    const { data: newFolder, error: newFolderError } = await supabase
      .from("Folders")
      .insert([{ user_id: userId, parent_id: parentId, name: foldername }]);

    if (newFolderError) throw newFolderError;

    return res.status(201).json(newFolder);
  } catch (error: any) {
    console.error("Internal server error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const updateFolder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify the folder exists and belongs to user
    const { data: existingFolder } = await supabase
      .from("Folders")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    if (existingFolder.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update the folder name
    const { data: updatedFolder, error } = await supabase
      .from("Folders")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(updatedFolder);
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ error: "Failed to update folder" });
  }
};

export const getFolders = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  try {
    const { data: folders, error } = await supabase
      .from("Folders")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;

    return res.json(folders);
  } catch (error: any) {
    console.error("Internal server error: ", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const getFolderDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    //get the current folder details
    const { data: folder, error } = (await supabase
      .from("Folders")
      .select("*")
      .eq("id", id)
      .single()) as { data: Folder; error: PostgrestError | null };

    if (folder.user_id !== userId)
      return res.status(403).json({ error: "Unauthorized" });
    if (error) {
      throw error || new Error("Folder not found");
    }

    //get the subfolders
    const { data: subfolders, error: subfoldersError } = await supabase
      .from("Folders")
      .select("*")
      .eq("parent_id", id);

    if (subfoldersError) {
      throw subfoldersError;
    }
    //get the files in the folder
    const { data: files, error: filesError } = await supabase
      .from("Files")
      .select("*")
      .eq("folder_id", id);

    if (filesError) throw filesError;
    const folderDetails = {
      id: folder.id,
      name: folder.name,
      parentId: folder.parent_id,
      userId: folder.user_id,
      files: files || [],
      subfolders: subfolders || [],
    };

    return res.status(200).json(folderDetails);
  } catch (error: any) {
    console.error("Internal server error: ", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Verify ownership
    const { data: folder } = await supabase
      .from("Folders")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!folder) return res.status(404).json({ error: "Folder not found" });
    if (folder.user_id !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    // Delete files first
    await supabase.from("Files").delete().eq("folder_id", id);

    // Delete folder
    const { error } = await supabase.from("Folders").delete().eq("id", id);
    if (error) throw error;

    return res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error: any) {
    console.error("Delete error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
