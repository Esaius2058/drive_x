import { PrismaClient, Prisma } from "@prisma/client";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
export interface CustomUser {
  id?: number;
  name?: string;
  email: string;
  passwordHash?: string;
  users?: CustomUser[];
}

export const handleCreateUser = async (
  name: string,
  email: string,
  passwordHash: string
):Promise<void> => {
  await prisma.user.create({
    data: {
      name: name,
      email: email,
      passwordHash: passwordHash,
      storageLimit: 1024,
      usedStorage: 0,
    },
  });
};

export const handleUpdateEmail = async (name: string | undefined, userEmail: string) => {
  return await prisma.user.update({
    where: {
      email: userEmail,
    },
    data: {
      name: name,
    },
  });
};

export const handleUpdatePassword = async (email: string | undefined, newPassword: string) => {
  return await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      passwordHash: newPassword,
    },
  });
};

passport.use(
  new LocalStrategy(async (email, password, done) => {
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
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.user_id);
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
      passwordHash: user.passwordHash
    });
  } catch (error: unknown) {
    done(error);
  }
});

export default passport;
