import { Request, Response } from "express";
import { handleGetFile, handleUpdateFile, handleDeleteFile } from "../services/userService";

export const deleteFile = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await handleDeleteFile(Number(id));
        res.status(200).json({ message: "File deleted successfully!" });
    } catch (err: any) {
        console.error("Internal server error: ", err);
        res.status(500).json({ error: err.message });
    }
};

export const getFile = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const file = await handleGetFile(Number(id));
        res.status(200).json({ name: file?.name, folder: file?.folder });
    } catch (err: any) {
        console.error("Internal server error: ", err);
        res.status(500).json({ error: err.message });
    }
};

export const updateFile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { filename } = req.body;

    try {
        await handleUpdateFile(Number(id), filename);
    } catch (err: any) {
        console.error("Internal server error: ", err);
        res.status(500).json({ error: err.message });
    }
};