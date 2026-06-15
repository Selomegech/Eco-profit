import { hash, verify } from "@node-rs/argon2";

// OWASP-recommended argon2id parameters.
const opts = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, opts);
}

export async function verifyPassword(hashStr: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashStr, plain, opts);
  } catch {
    return false;
  }
}
