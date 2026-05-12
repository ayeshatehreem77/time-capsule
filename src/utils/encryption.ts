import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const iv = Buffer.alloc(16, 0);

function getKey() {
  console.log("SECRET:", process.env.ENCRYPTION_SECRET);
  const secret = process.env.ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error('ENCRYPTION_SECRET is not defined in environment variables');
  }

  return crypto.createHash('sha256').update(secret).digest();
}

export function encrypt(text: string): string {
  console.log("🔐 ENCRYPT INPUT:", text);
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  console.log("🔓 DECRYPT INPUT:", text);
  console.log("🔑 SECRET (decrypt):", process.env.ENCRYPTION_SECRET);

  const key = getKey();
  // Message ko ':' se split karke IV alag karein
  const [ivHex, encryptedText] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const result =
    decipher.update(encryptedText, 'hex', 'utf8') +
    decipher.final('utf8');

  console.log("✅ DECRYPTED:", result);

  return result;
}
