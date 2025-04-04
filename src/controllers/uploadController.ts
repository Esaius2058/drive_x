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
import { strict } from "assert";

export interface CustomRequest {
  token?: string;
  user?: any; 
}

interface LoginRequestBody {
  email: string;
  password: string;
}


const upload = multer({ storage: multer.memoryStorage() });
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const jwtSecret = process.env.JWT_SECRET_KEY as string;

export const fetchUserFiles = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  console.log("User in request: ", req.user);
  console.log("User Id: ", userId);

  const { data, error } = await supabase
    .from("Files")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data;
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token as string, jwtSecret, (err, authData) => {
    if(err){
      console.log("Error verifying jwt: ", err);
      res.status(403).json({err});
    } else {
      console.log("auth data: ", authData);
    }
  });

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized: No user found" });
    return;
  }
  
  try {
    const files = await fetchUserFiles(req, res, next);
    const folders = files.map((file: any) => ({
      folder: file.folder_id,
      File: files.filter((f: any) => f.folder_id === file.folder_id),
    })); //store the folder ids in an array

    res.render("profile", { title: `${req.user?.name}`, folders });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

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
    if(err){
      console.log("Error verifying jwt: ", err);
      res.status(403).json({err});
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

const alphaErr = "must contain only alphabets";
const lengthErr = "must be between 1 and 10 characters long";
const emailErr = "Invalid email address";

export const validateUser = [
  body("firstname")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`First name ${lengthErr}`),
  body("lastname")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Last name ${lengthErr}`),
  body("email").trim().isEmail().withMessage(emailErr),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  //since I'm using ejs, I'll be using the https cookies instead
  const bearerHeader = req.headers.authorization;
  console.log("Bearer Header: ", bearerHeader);
  const bearer = bearerHeader !== undefined ? bearerHeader?.split(" ") : "";
  const token = bearer[1]; //Get the token from Authorization header
  
  console.log("Token: ", token);

  if (!token || token === "") {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    }) as unknown as CustomUser;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const fullname = req.body.firstname + " " + req.body.lastname;
  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    //const newUser = await handleCreateUser(fullname, email, hashedPassword);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: req.body.password,
    });

    if (error) {
      throw error;
    }

    // Insert metadata into the database
    const { data: dbData, error: dbError } = await supabase
      .from("Users")
      .insert([{ name: fullname, email: email, password: hashedPassword }]);

    if (dbError) {
      console.error("Database error:", dbError);
      res.status(500).json({ message: "Error saving file metadata" });
      return;
    }

    if (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Error uploading file" });
    }

    const token = jwt.sign({user: data.user}, jwtSecret, {expiresIn: "2h"});

    res.json({
      message: `Welcome ${req.body.firstname}`,
      user: data.user,
      success: true,
      token
    });
  } catch (error: any) {
    console.error("Error signing in: ", error);
    res.status(500).json("Internal server error");
  }
};

export const loginUser = async (
  /*req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction*/
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*return passport.authenticate(
    "local",
    (err: unknown, user: any, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.redirect("/log-in");
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        console.log("User logged in: ", req.user);
        return getProfile(req, res);
      });
    }
  )(req, res, next);*/
  const email = req.body.email;
  const password = req.body.password;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      throw error;
    }

    console.log("User logged in: ", data.user);
    const token = jwt.sign({user: data.user}, jwtSecret, {expiresIn: "2h"});
  
    res.json({
      action: "loginUser",
      success: true,
      message: "Login Successful",
      token
    });
  } catch (error) {
    console.error("Error signing in: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    res.redirect("/");
  } catch (error) {
    console.error("Error logging out: ", error);
  }
};

/*export const ensureAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/log-in");
};*/

export const updateEmail = async (req: Request, res: Response) => {
  const newEmail = req.body.email;
  try {
    const updatedUser = await handleUpdateName(req.user?.name, newEmail);
    updatedUser
      ? res.status(200).json({
          message: `Updated successful`,
          update: updatedUser.name,
        })
      : res.status(400).json("User update failed or user not found.");
  } catch (err: any) {
    console.error("Internal server error: ", err);
    res.status(500).json({ error: err.message });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const user = await supabase.from("Users").select("*").eq("email", req.user?.email);
  const userData = user.data != null ? user.data[0] : "";
  const email = userData.email;
  const newPassword = req.body.newpassword;
  const oldPassword = req.body.oldpassword;
  const oldHashed = await bcrypt.hash(req.body.oldPassword, 10);

  try {
    if (await bcrypt.compare(oldPassword, oldHashed)) {
      await supabase.from("Users").update({ password: await bcrypt.hash(newPassword, 10) }).eq("email", email); 
      
      return res
        .status(200)
        .json({ message: `Updated ${userData.name}'s password.` });
      }
  } catch (err: any) {
    console.error("Internal server error: ", err);
    res.status(500).json({ error: err.message });
  }
};

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

export const getUpdateForm = async (req: Request, res: Response) => {
  jwt.verify(req.token as string, jwtSecret, (err, authData) => {
    if(err){
      console.log("Error verifying jwt: ", err);
      res.status(403).json({err});
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
