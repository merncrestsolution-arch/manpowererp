import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, BCRYPT_COST);
}

export async function verifyToken(
  token: string,
  hashedToken: string,
): Promise<boolean> {
  return bcrypt.compare(token, hashedToken);
}
