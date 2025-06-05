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

export const createFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { foldername, parentid } = req.body;
    const user = req.user;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userId = user.id;
    const parentId = parentid || null;

    const { data: newFolder, error: newFolderError } = await supabase
      .from("Folders")
      .insert([{ user_id: userId, parent_id: parentId, name: foldername }]);

    if (newFolderError) throw newFolderError;

    res.status(201).json(newFolder);
    return;
  } catch (error: any) {
    console.error("Internal server error:", error);
    res.status(500).json({message: "Error creating folder", type: "Internal Server Error", error});
    return;
  }
};

export const updateFolder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;
  const user = req.user;
  const userId = user?.id;

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Verify the folder exists and belongs to user
    const { data: existingFolder } = await supabase
      .from("Folders")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingFolder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    if (existingFolder.user_id !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    // Update the folder name
    const { data: updatedFolder, error } = await supabase
      .from("Folders")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(updatedFolder);
    return;
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({message: "Error updating folder", type: "Internal Server Error", error});
    return;
  }
};

export const getFolders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = req.user;
  const userId = user?.id;

  try {
    const { data: folders, error } = await supabase
      .from("Folders")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;

    res.json(folders);
    return;
  } catch (error: any) {
    console.error("Internal server error: ", error);
    res.status(500).json({message: "Error getting folders", type: "Internal Server Error", error});
    return;
  }
};

export const getFolderDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const userId = user?.id;

  try {
    //get the current folder details
    const { data: folder, error } = (await supabase
      .from("Folders")
      .select("*")
      .eq("id", id)
      .single()) as { data: Folder; error: PostgrestError | null };

    if (folder.user_id !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

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

    res.status(200).json(folderDetails);
    return;
  } catch (error: any) {
    console.error("Internal server error: ", error);
    res.status(500).json({message: "Error getting folder details", type: "Internal Server Error", error});
    return;
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const userId = user?.id;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Verify ownership
    const { data: folder } = await supabase
      .from("Folders")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    if (folder.user_id !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    // Delete files first
    await supabase.from("Files").delete().eq("folder_id", id);

    // Delete folder
    const { error } = await supabase.from("Folders").delete().eq("id", id);
    if (error) throw error;

    res.status(200).json({ message: "Folder deleted successfully" });
    return;
  } catch (error: any) {
    console.error("Delete error:", error);
    res.status(500).json({message: "Error deleting folder", type: "Internal Server Error", error});
    return;
  }
};
