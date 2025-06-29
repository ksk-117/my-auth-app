import { prisma } from "@/lib/prisma";
import { addMinutes, isAfter } from "date-fns";
import { User } from "@prisma/client";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function checkAccountLock(user: User) {
  try {
    if (user.lockedUntil && isAfter(new Date(), user.lockedUntil) === false) {
      console.log(`Account locked for user ${user.email} until ${user.lockedUntil}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking account lock:", error);
    return false;
  }
}

export async function incrementLoginAttempts(user: User) {
  try {
    const attempts = user.loginAttempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const lockUntil = addMinutes(new Date(), LOCK_MINUTES);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedUntil: lockUntil,
        },
      });
      console.log(`Account locked for user ${user.email} until ${lockUntil}`);
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: attempts },
      });
      console.log(`Login attempt ${attempts}/${MAX_ATTEMPTS} for user ${user.email}`);
    }
  } catch (error) {
    console.error("Error incrementing login attempts:", error);
  }
}

export async function resetLoginAttempts(user: User) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null },
    });
    console.log(`Login attempts reset for user ${user.email}`);
  } catch (error) {
    console.error("Error resetting login attempts:", error);
  }
}

export async function addLoginHistory(user: User, req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }) {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
    const ipAddress = Array.isArray(ip) ? ip[0] : ip;
    
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ip: ipAddress,
      },
    });
    console.log(`Login history added for user ${user.email} from IP: ${ipAddress}`);
  } catch (error) {
    console.error("Error adding login history:", error);
  }
}
