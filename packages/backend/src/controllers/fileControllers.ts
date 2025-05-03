import { Request, Response } from "express";
import { supabase } from "../utils/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

interface File {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  file_type: string;
  size?: string;
  updated_at: Date;
  created_at?: Date;
}

export const deleteFile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Verify ownership
    const { data: file } = await supabase
      .from("Files")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!file) return res.status(404).json({ error: "File not found" });
    if (file.user_id !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    // Delete File
    const { error } = await supabase.from("Files").delete().eq("id", id);

    if (error) throw error;

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error: any) {
    console.error("Delete error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const getFile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    //get the current file details
    const { data: file, error } = (await supabase
      .from("Files")
      .select("*")
      .eq("id", id)
      .single()) as { data: File; error: PostgrestError | null };

    if (file.user_id !== userId)
      return res.status(403).json({ error: "Unauthorized" });
    if (error) {
      throw error || new Error("File not found");
    }

    return res.status(200).json(file);
  } catch (error: any) {
    console.error("Internal server error: ", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const updateFile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify the file exists and belongs to user
    const { data: existingFile } = await supabase
      .from("Files")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingFile) {
      return res.status(404).json({ error: "File not found" });
    }

    if (existingFile.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update the file name
    const { data: updatedFile, error } = await supabase
      .from("Files")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(updatedFile);
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ error: "Failed to update file" });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  try {
    const { data: files, error } = await supabase
      .from("Files")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;

    return res.json(files);
  } catch (error: any) {
    console.error("Internal server error: ", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
