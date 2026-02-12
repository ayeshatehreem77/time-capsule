import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const iv = Buffer.alloc(16, 0);

function getKey() {
  const secret = process.env.ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error('ENCRYPTION_SECRET is not defined in environment variables');
  }

  return crypto.createHash('sha256').update(secret).digest();
}

export function encrypt(text: string): string {
  const key = getKey();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(text: string): string {
  const key = getKey();
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}
