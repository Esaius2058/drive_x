import { Request, Response, NextFunction } from "express";
import passport from "passport";

interface LoginRequestBody {
    email: string;
    password: string;
}

export const uploadSingleFile = async (req: Request, res: Response):Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }
  res.json({
    message: "File Uploaded Successfully!!",
    filename: req.file.filename,
    file: req.file,
  });
};

export const uploadMultipleFiles = async (req: Request, res: Response):Promise<void> => {
  if (!req.files) {
    res.status(400).json({ message: "No files uploaded" });
    return;
  }
  res.json({ files: req.files });
};

export const uploadMultipleFields = (req: Request, res: Response) => {
  if (!req.files) return res.status(400).json({ message: "No files uploaded" });
  return res.json({ files: req.files });
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
  
        return res.redirect("/dashboard");
      });
    })(req, res, next);
  }
  
  export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.logout((error) => {
      if(error){
        return next(error);
      }
      req.session.destroy(() => {
        res.redirect("/");//redirect to login after logout
      });
    });
  };

  export const ensureAuthenticated = (req: any, res: any, next: any) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/log-in");
  };