import { supabase } from "../utils/supabaseClient";
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { CustomUser } from "./types";
import { handleUpdateName } from "../services/userService";

const jwtSecret = process.env.JWT_SECRET_KEY as string;
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
    const { data: newUser, error: newUserError } = await supabase.auth.signUp({
      email: email,
      password: req.body.password,
    });
    console.log("Signup Email: ", email, "Password: ", req.body.password);

    const user = newUser.user;
    if (!user) {
      throw new Error("User not found, cannot sign token.");
    }

    if (newUserError) {
      throw newUserError;
    }

    // Insert metadata into the database
    const { data: dbData, error: dbError } = await supabase
      .from("Users")
      .insert([{ name: fullname, email: email, password: hashedPassword }]);

    //Create a new root folder
    const { data: folder, error: folderError } = await supabase
      .from("Folders")
      .insert([{ name: "Parent Folder", user_id: user.id, parent_id: null }])
      .select(); // <-lets TS infer the shape of 'data'

    if (folderError || !folder || folder.length === 0) {
      console.error("Failed to create folder:", folderError);
      throw folderError;
    }

    if (dbError || folderError) {
      dbError
        ? console.error("Database error:", dbError)
        : console.error("Database error:", folderError);
      throw dbError || folderError;
    }

    const token = jwt.sign(newUser, jwtSecret, { expiresIn: "2h" });

    res.json({
      message: `Welcome ${req.body.firstname}`,
      user,
      success: true,
      token,
    });
  } catch (error: any) {
    console.error("Error signing in: ", error);
    res.status(500).json("Internal server error");
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    const loggedUser = data.user;
    const token = jwt.sign(loggedUser, jwtSecret, { expiresIn: "2h" });

    res.status(200).json({
      user: loggedUser,
      token,
    });
  } catch (error) {
    console.error("Error logging in: ", error);
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

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out: ", error);
    res.status(500).json({ message: "Internal server error. Couldn't logout" });
  }
};

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
  const user = req.user;
  const email = user?.email;
  const { oldpassword, newpassword } = req.body;

  try {
    if (!oldpassword) {
      throw new Error("Old password missing.");
    }

    if (!newpassword) {
      throw new Error("New password missing.");
    }

    const oldHashed = await bcrypt.hash(oldpassword, 10);
    const newHashed = await bcrypt.hash(newpassword, 10);

    if (await bcrypt.compare(oldpassword, oldHashed)) {
      const { error } = await supabase
        .from("Users")
        .update({ password: newHashed })
        .eq("email", email);

      if (error) throw error;
    } else {
      throw new Error("Old password is incorrect");
    }
    res.status(200).json({ message: `Updated password successfully.` });
    return;
  } catch (error: any) {
    console.error("Internal server error: ", error);
    res.status(500).json("Internal server error");
    return;
  }
};

export const updateRole = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const newRole = req.body.role;
  const secret = req.body.secret;
  const secretKey = process.env.ADMIN_SECRET_KEY as string;

  if (secret !== secretKey) {
    res.status(401).json({ message: "Unauthorized: Invalid secret key" });
    return;
  }

  try {
    if (newRole !== "admin" && newRole !== "client")
      throw new Error("Invalid role");

    const { data, error } = await supabase
      .from("Users")
      .update({ role: newRole })
      .eq("id", userId)
      .select(); // Get the updated row back
    console.log("Update result(updateRole):", data, error);

    if (error) throw error;

    res.status(200).json({ message: `Updated role successfully.` });
    return;
  } catch (error: any) {
    console.error("Internal server error: ", error);
    res.status(500).json("Internal server error");
  }
};

export const fetchUserFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  console.log("User in request(fetchUserFiles): ", req.user);

  const { data, error } = await supabase
    .from("Files")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data;
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized: No user found" });
    return;
  }
  const user = req.user;

  try {
    const { data: userRole, error: roleError } = await supabase
      .from("Users")
      .select("role")
      .eq("id", user?.id)
      .single();

    if (roleError) throw roleError;

    //fetch the user files
    const fileItems = await fetchUserFiles(req, res, next);

    // get unique folder IDs to avoid duplication (2n)
    const uniqueFolderIds = [
      ...new Set(
        fileItems.map((item) => item.folder_id).filter((id) => id != null)
      ),
    ];

    // map each folder ID to its files
    const folders = uniqueFolderIds.map((folderId) => ({
      folderId,
      files: fileItems.filter((file) => file.folder_id === folderId),
    }));

    //fetch the user's folders
    const { data: folderData, error: folderError } = await supabase
      .from("Folders")
      .select("*")
      .eq("user_id", req.user.id);
    if (folderError) {
      console.error("Error fetching folder names:", folderError);
      res.status(500).json({ message: "Error fetching folder names" });
      return;
    }
    //map the folder names to their ids by creating a dictionary of folderNames
    const folderNames = folderData.reduce((acc: any, folder: any) => {
      acc[folder.id] = folder.name;
      return acc;
    }, {});

    const folderIds = folderData.reduce((acc: any, folder: any) => {
      acc[folder.id] = folder.id;
      return acc;
    }, {});
    //get the files that do't have folder ids
    const files = fileItems.map((file: any) => file.folder_id === null);

    //fetch the user's name from the database
    const { data, error } = await supabase.from("Users").select("id, name");
    if (error) throw error;
    const userNames: Record<string, string> = data.reduce(
      (acc: any, user: any) => {
        acc[user.id] = user.name;
        return acc;
      },
      {} as Record<string, string>
    );

    const role = userRole.role;
    var profile = { user, userNames, folders, folderIds, folderNames, files , role };

    if (role === "admin") {
      const { fileCount, userCount, storageUsed } = await getAdminStats(
        req,
        res
      );
      const adminProfile = {
        ...profile,
        fileCount,
        userCount,
        storageUsed,
      };
      profile = adminProfile;
    }
    res.status(200).json(profile);
    return;
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

const getAdminStats = async (req: Request, res: Response): Promise<any> => {
  try {
    //OVERVIEW
    //get the total number of users in the db
    const { data: userCount, error: userCountError } = await supabase
      .from("Users")
      .select("*", { count: "exact" });

    if (userCountError) {
      console.error("Error fetching user count:", userCountError);
      throw userCountError;
    }

    //get the total number of files currently uploaded in the db
    const { data: fileCount, error: fileCountError } = await supabase
      .from("Files")
      .select("*", { count: "exact" });

    if (fileCountError) {
      console.error("Error fetching file count:", fileCountError);
      throw fileCountError;
    }

    //get the total storage used in the db
    //this is a custom function that returns the total storage used in bytes
    const { data: storageUsed, error: storageError } = await supabase.rpc(
      "get_total_storage"
    );

    if(storageError){
      console.error("Error fetching storage used:", storageError);
      throw storageError;
    }


    //USER MANAGEMENT
    //get all the users and their roles from the db
    const { data: allUsers, error: allUsersError } = await supabase
      .from("Users")
      .select("email, role, name, used_storage");

    if (allUsersError) {
      console.error("Error fetching all users:", allUsersError);
      throw allUsersError;
    }

    //get the activity logs of all the users
    const { data: activityLogs, error: activityLogsError } = await supabase
    .from("FileLogs")
    .select("user_id, file_id, action, inserted_at");

    if (activityLogsError) {
      console.error("Error fetching logs:", activityLogsError);
      throw activityLogsError;
    }

    return {
      fileCount: fileCount.length ?? 0,
      userCount: userCount.length ?? 0,
      storageUsed: Number(storageUsed) || 0,
      activityLogs,
      allUsers
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return;
  }
};

export const deleteProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;

  try {
    const { error } = await supabase.auth.admin.deleteUser(userId as string);

    if (error) throw error;

    //delete the user metadata
    const { error: dbError } = await supabase
      .from("Users")
      .delete()
      .eq("id", userId);

    if (dbError) throw dbError;

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Error deleting profile" });
  }
};
