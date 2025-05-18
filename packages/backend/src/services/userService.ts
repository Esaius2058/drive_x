import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CustomUser {
  user: {
    id: string;
    email: string;
  }
}

export const handleUploadSingleFile = async (
  fileName: string,
  folderId: number,
  size: number,
  userId: number,
  fileType: string,
  path: string
) => {
  try {
    await prisma.file.create({
      data: {
        name: fileName,
        size: size,
        userId: userId,
        fileType: fileType,
        path: path,
        folderId: folderId,
      },
    });
  } catch (err: any) {
    console.error("Error uploading file: ", err);
  }
};

export const handleUploadMultipleFiles = async (
  files: Express.Multer.File[],
  folderId: number,
  userId: number
) => {
  try {
    const fileData = files.map((file) => ({
      name: file.originalname,
      size: file.size, // File size in bytes
      userId: userId,
      fileType: file.mimetype, // MIME type (e.g., "image/png")
      path: file.path,
      folderId: folderId,
    }));

    await prisma.file.createMany({ data: fileData });
  } catch (err: any) {
    console.error("Error uploading files:", err);
  }
};

export const handleCreateUser = async (
  name: string,
  email: string,
  passwordHash: string
) => {
  try {
    return await prisma.user.create({
      data: {
        name: name,
        email: email,
        passwordHash: passwordHash,
        storageLimit: 1024,
        usedStorage: 0,
      },
    });
  } catch (err: unknown) {
    console.error("Error creating user: ", err);
  }
};

export const handleGetUser = async (email: string) => {
  try {
    return await prisma.user.findUnique({
      where: {
        email: email
      },
      include: {
        File: true,
        Folder: true
      }
    });
  } catch (err: any) {
    console.error("Error getting user: ", err);
  }
};

export const handleUpdateName = async (
  name: string | undefined,
  userEmail: string
) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!existingUser) {
      console.log("User not found.");
      return null;
    }

    return await prisma.user.update({
      where: { email: userEmail },
      data: { name: name },
    });
  } catch (err: unknown) {
    console.error("Error updating email: ", err);
    return null;
  }
};

export const handleUpdatePassword = async (
  email: string | undefined,
  newPassword: string
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        passwordHash: newPassword,
      },
    });
    return updatedUser;
  } catch (err: unknown) {
    console.error("Error updating password: ", err);
    return null;
  }
};

/*
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });
        const match = await bcrypt.compare(password, user?.passwordHash || "");

        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (!match) {
          return done(null, false, { message: "Incorrrect password" });
        }
        return done(null, user);
      } catch (error: unknown) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) return done(null, false);
    done(null, {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    });
  } catch (error: unknown) {
    done(error);
  }
});*/

export const handleGetFile = async (id: number) => {
  try {
    return await prisma.file.findUnique({
      where: {
        id,
      },
      include: {
        folder: true,
      },
    });
  } catch (err: unknown) {
    console.error("Error getting file: ", err);
  }
};

export const handleCreateFolder = async (
  name: string,
  user_id: number,
  parent_id?: number
) => {
  try {
    return await prisma.folder.create({
      data: {
        name: name,
        userId: user_id,
        parentFolderId: parent_id,
      },
    });
  } catch (err: unknown) {
    console.error("Error creating folder: ", err);
  }
};

export const handleGetFolders = async (id: number) => {
  try {
    return await prisma.folder.findMany({
      where: { userId: id },
      include: {
        parentFolder: true,
        subFolders: true,
        file: true,
      },
    });
  } catch (err: any) {
    console.error("Error getting folders: ", err);
  }
};

export const handleGetFolderDetails = async (id: number) => {
  try {
    return await prisma.folder.findUnique({
      where: {
        id: id,
      },
      include: {
        file: true,
      },
    });
  } catch (err: unknown) {
    console.error("Error getting folder details: ", err);
  }
};

export const handleDeleteFolder = async (id: number) => {
  try {
    await prisma.folder.delete({
      where: {
        id: id,
      },
    });
  } catch (err: unknown) {
    console.error("Error deleting folder: ", err);
  }
};

export const handleDeleteFile = async (id: number) => {
  try {
    await prisma.file.delete({
      where: {
        id: id,
      },
    });
  } catch (err: unknown) {
    console.error("Error deleting file: ", err);
  }
};

export const handleUpdateFile = async (id: number, fileName: string) => {
  try {
    await prisma.file.update({
      where: {
        id: id,
      },
      data: {
        name: fileName,
      },
    });
  } catch (err: unknown) {
    console.error("Error updating file: ");
  }
};

