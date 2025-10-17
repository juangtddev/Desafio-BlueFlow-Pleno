import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}:${salt}`;
}

export async function verifyPassword(stored: string, supplied: string) {
  const [hashedPassword, salt] = stored.split(':');
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;

  const suppliedBuf = Buffer.from(hashedPassword, 'hex');
  return timingSafeEqual(buf, suppliedBuf);
}
