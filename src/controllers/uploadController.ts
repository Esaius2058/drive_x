import { Request, Response, NextFunction, json } from "express";
import passport from "passport";
import { handleCreateUser, handleUpdatePassword, handleUpdateEmail } from "../services/userService";
import bcrypt from "bcryptjs";

interface LoginRequestBody {
  email: string;
  password: string;
}

export const uploadSingleFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }
  res.status(200).json({
    message: "File Uploaded Successfully!!",
    filename: req.file.filename,
    file: req.file,
  });
};

export const uploadMultipleFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.files) {
    res.status(400).json({ message: "No files uploaded" });
    return;
  }
  res.status(200).json({ files: req.files });
};

export const uploadMultipleFields = (req: Request, res: Response) => {
  if (!req.files) return res.status(400).json({ message: "No files uploaded" });
  return res.status(200).json({ files: req.files });
};

export const createUser = async (req: Request, res: Response):Promise<void> => {
  const fullname = req.body.firstname + " " + req.body.lastname;
  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    const newUser = await handleCreateUser(fullname, email, hashedPassword);
    res.status(201).json({
      message: `Welcome ${req.body.firstname}`,
      user: newUser,
    });
  } catch (err: unknown) {
    console.error("Internal server error: ", err);
    res.status(500).json("Internal server error");
  }
};

export const loginUser = (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("local", (err: unknown, user: any, info: any) => {
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

      return res.redirect("/profile");
    });
  })(req, res, next);
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    req.session.destroy(() => {
      res.redirect("/"); //redirect to dashboard after logout
    });
  });
};

export const ensureAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/log-in");
};

export const updateEmail = async (req: Request, res: Response) => {
  const newEmail = req.body.email;
  try {
    const updatedUser = await handleUpdateEmail(req.user?.name, newEmail);
    return res.status(200).json({
      message: `Updated ${req.user?.name}'s email`,
      update: updatedUser.email,
    });
  } catch (err: unknown) {
    console.error("Internal server error: ", err);
    res.status(500).json("Internal server error");
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const email = req.user?.email
  const newPassword = req.body.newpassword;
  const oldPassword = req.body.oldpassword;
  const oldHashed = req.user?.passwordHash ? req.user?.passwordHash.toString() : "";

  try{
    if(await bcrypt.compare(oldPassword, oldHashed)){
      const updatedPassword = await handleUpdatePassword(email, newPassword);
      return res.status(200).json({message: `Updated ${req.user?.name}'s password.`});
    }
  }catch(err: unknown){
    console.error("Internal server error: ", err);
    res.status(500).json("Internal server error");
  }
}
