import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Used for the password-reset token: we store only the hash in Mongo so a
// leaked database never yields a usable reset link.
export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function verifyToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
