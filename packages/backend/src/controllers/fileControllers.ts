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

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Verify ownership
    const { data: file } = await supabase
      .from("Files")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!file){
        res.status(404).json({ error: "File not found" });
        return;
    } 
    if (file.user_id !== userId){
        res.status(403).json({ error: "Unauthorized" });
        return;
    }
     

    // Delete File
    const { error } = await supabase.from("Files").delete().eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "File deleted successfully" });
    return;
  } catch (error: any) {
    console.error("Delete error:", error);
    res.status(500).json({message: "Error deleting file", type: "Internal Server Error", error});
    return;
  }
};

export const getFile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    //get the current file details
    const { data: file, error } = (await supabase
      .from("Files")
      .select("*")
      .eq("id", id)
      .single()) as { data: File; error: PostgrestError | null };

    if (file.user_id !== userId){
        res.status(403).json({ error: "Unauthorized" });
        return;
    }
     
    if (error) {
      throw error || new Error("File not found");
    }

    res.status(200).json(file);
    return;
  } catch (error: any) {
    console.error("Internal server error: ", error);
    res.status(500).json({message: "Error getting file", type: "Internal Server Error", error});
    return;
  }
};

export const updateFile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Verify the file exists and belongs to user
    const { data: existingFile } = await supabase
      .from("Files")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingFile) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    if (existingFile.user_id !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return ;
    }

    // Update the file name
    const { data: updatedFile, error } = await supabase
      .from("Files")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(updatedFile);
    return ;
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({message: "Error updating file", type: "Internal Server Error", error});
    return ;
  }
};

export const getFiles = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  try {
    const { data: files, error } = await supabase
      .from("Files")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;

    res.json(files);
    return ;
  } catch (error: any) {
    console.error("Internal server error: ", error);
    res.status(500).json({message: "Error fetching files", type: "Internal Server Error", error});
    return;
  }
};
