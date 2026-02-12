import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_SECRET!)
  .digest();
const iv = Buffer.alloc(16, 0);

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(text: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}
