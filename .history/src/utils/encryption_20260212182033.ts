import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';

const secret = process.env.ENCRYPTION_SECRET;

if (!secret) {
  throw new Error('ENCRYPTION_SECRET is not defined in environment variables');
}

const key = crypto
  .createHash('sha256')
  .update(secret)
  .digest();

const iv = Buffer.alloc(16, 0);

export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Text to encrypt is undefined');
  }

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(text: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}
