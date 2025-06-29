import { prisma } from "@/lib/prisma";
import { addMinutes, isAfter } from "date-fns";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function checkAccountLock(user: any) {
  if (user.lockedUntil && isAfter(new Date(), user.lockedUntil) === false) {
    return true;
  }
  return false;
}

export async function incrementLoginAttempts(user: any) {
  const attempts = user.loginAttempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: attempts,
        lockedUntil: addMinutes(new Date(), LOCK_MINUTES),
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: attempts },
    });
  }
}

export async function resetLoginAttempts(user: any) {
  await prisma.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockedUntil: null },
  });
}

export async function addLoginHistory(user: any, req: any) {
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      ip: Array.isArray(ip) ? ip[0] : ip,
    },
  });
}
