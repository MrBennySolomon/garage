/**
 * הצפנת סיסמה (hash) עם Argon2id.
 * עובד בדפדפן וב-Node בעזרת הספרייה hash-wasm.
 *
 * התקנה:
 *   npm install hash-wasm
 */
import { argon2id, argon2Verify } from "hash-wasm";

// הגדרות מומלצות (OWASP): זיכרון 19 MiB, 2 איטרציות, thread אחד
const ARGON2_OPTIONS = {
  memorySize: 19456, // ב-KiB
  iterations: 2,
  parallelism: 1,
  hashLength: 32,
  outputType: "encoded" // מחרוזת מלאה: $argon2id$v=19$m=...,t=...,p=...$salt$hash
};

/**
 * יוצר hash מהסיסמה עם salt אקראי.
 * מחזיר מחרוזת אחת שכוללת את כל הפרמטרים, כך שאפשר לשמור אותה כמו שהיא.
 */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  return argon2id({
    ...ARGON2_OPTIONS,
    password,
    salt
  });
}

/**
 * בודק אם סיסמה תואמת ל-hash שנשמר. מחזיר true / false.
 */
export async function verifyPassword(password, hash) {
  try {
    return await argon2Verify({ password, hash });
  } catch {
    return false; // hash לא תקין
  }
}

// דוגמה:
// const hash = await hashPassword("12345");
// await verifyPassword("12345", hash); // true
// await verifyPassword("wrong", hash); // false
