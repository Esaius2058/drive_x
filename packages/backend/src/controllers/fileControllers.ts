import { Request, Response } from "express";
import { supabase } from "../utils/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

interface File {
  id: string;
  user_id: string;
  storage_path: string;
  name?: string;
  file_type?: string;
  size?: string;
  updated_at?: Date;
  created_at?: Date;
}

export const trashFile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // 1. Get the current value
    const { data: existingRow, error: fetchError } = await supabase
      .from("file_metadata")
      .select("is_deleted")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    // 2. Flip it
    const newValue = !existingRow.is_deleted;

    const { error: updateError } = await supabase
      .from("file_metadata")
      .update({ is_deleted: newValue })
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    const message = newValue == true ? "File moved to trash" : "File restored";

    res.status(200).json({message});
    return;
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: "Error trashing file",
      type: "Internal Server Error",
      error,
    });
    return;
  }
};

export const deleteFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Verify ownership
    const { data: file } = await supabase
      .from("file_metadata")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    if (file.user_id !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    // Delete File
    const { error } = await supabase
      .from("file_metadata")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "File deleted successfully" });
    return;
  } catch (error: any) {
    console.error("Delete error:", error);
    res.status(500).json({
      message: "Error deleting file",
      type: "Internal Server Error",
      error,
    });
    return;
  }
};

export const getFile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    //get the file's storage path
    const { data: file, error } = (await supabase
      .from("file_metadata")
      .select("id, user_id, storage_path")
      .eq("id", id)
      .single()) as { data: File; error: PostgrestError | null };

    console.log("Storage Path: ", file.storage_path);
    if (file.user_id !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    if (error) {
      throw error || new Error("File not found");
    }
    
    console.log("File Path: ", file.storage_path);
    const { data: signedData, error: signedDataError } = await supabase.storage
      .from("user-files")
      .createSignedUrl(file.storage_path, 300);

    if (signedDataError) {
      throw signedDataError || new Error("Error signing data");
    }

    const signedUrl = signedData?.signedUrl;

    res.status(200).json({ signedUrl });
    return;
  } catch (error: any) {
    console.error("Internal server error: ", error);
    res.status(500).json({
      message: "Error getting file",
      type: "Internal Server Error",
      error,
    });
    return;
  }
};

export const updateFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { newName } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Verify the file exists and belongs to user
    const { data: existingFile, error: existingFileError } = await supabase
      .from("file_metadata")
      .select("user_id")
      .eq("id", id)
      .single();

    if (existingFileError) throw existingFileError;

    if (existingFile.user_id !== userId) {
      res.status(403).json({ error: "Auth Error: Unauthorized" });
      return;
    }

    // Update the file name
    const { error } = await supabase
      .from("file_metadata")
      .update({ name: newName })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: "File updated successfully" });
    return;
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: "Error updating file",
      type: "Internal Server Error",
      error,
    });
    return;
  }
};

export const getFiles = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  try {
    const { data: files, error } = await supabase
      .from("file_metadata")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;

    res.json(files);
    return;
  } catch (error: any) {
    console.error("Internal server error: ", error);
    res.status(500).json({
      message: "Error fetching files",
      type: "Internal Server Error",
      error,
    });
    return;
  }
};
