import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const keyHex = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!keyHex) throw new Error("CREDENTIAL_ENCRYPTION_KEY must be set");
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new Error("CREDENTIAL_ENCRYPTION_KEY must be a 32-byte key, hex-encoded (64 characters)");
  }
  return key;
}

export function encryptSecret(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedSecret: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptSecret({ encryptedSecret, iv, authTag }) {
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedSecret, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
