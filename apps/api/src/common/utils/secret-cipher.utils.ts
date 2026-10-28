import { InternalServerErrorException } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;

export class SecretCipherUtils {
  static encrypt(plaintext: string, keyBase64: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, SecretCipherUtils.toKey(keyBase64), iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64');
  }

  static decrypt(payload: string, keyBase64: string): string {
    const raw = Buffer.from(payload, 'base64');
    const iv = raw.subarray(0, IV_BYTES);
    const tag = raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
    const encrypted = raw.subarray(IV_BYTES + TAG_BYTES);
    const decipher = createDecipheriv(ALGORITHM, SecretCipherUtils.toKey(keyBase64), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  private static toKey(keyBase64: string): Buffer {
    const key = Buffer.from(keyBase64, 'base64');
    if (key.length !== KEY_BYTES) throw new InternalServerErrorException('ENCRYPTION_KEY must be 32 bytes in base64');
    return key;
  }
}
