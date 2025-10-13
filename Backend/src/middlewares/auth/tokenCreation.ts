import dotenv from 'dotenv';
import Token from '../../models/Token.model';
import * as paseto from 'paseto';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

dotenv.config();

const {
  V4: { sign: pasetoSign },
} = paseto as any;

const refresh_secret_key = process.env.REFRESH_SECRET_KEY as string;
const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || '7d';
const secret_key = process.env.SECRET_KEY as string;
const mail_secret_key = process.env.MAIL_SECRET_KEY as string;
const forgot_secret_key = process.env.FORGOT_SECRET_KEY as string;
const expiresIn = process.env.EXPIRES_IN as string;
const mailexpiresIn = process.env.MAIL_EXPIRES_IN as string;

// Prefer environment-provided keys (Render-friendly) with file fallback
const private_key_path = path.resolve(__dirname, '../rsa/private_key.pem');

function getEnvKey(possibleNames: string[]): Buffer | undefined {
  for (const name of possibleNames) {
    const direct = process.env[name];
    // Prefer explicit BASE64 variable to avoid encoding issues
    const b64 = process.env[`${name}_BASE64`];
    if (b64 && b64.trim()) {
      try {
        return Buffer.from(b64, 'base64');
      } catch {}
    }
    // Fallback: if a direct value is provided and looks base64-like, attempt decode
    if (direct && direct.trim()) {
      try {
        return Buffer.from(direct, 'base64');
      } catch {}
    }
  }
  return undefined;
}

function normalizePem(str: string): string {
  // Support escaped newlines in env vars
  return str.replace(/\\n/g, '\n');
}

function getPrivateKey(): Buffer | string {
  const envVal = getEnvKey([
    'PASETO_PRIVATE_KEY',
    'RSA_PRIVATE_KEY',
    'PRIVATE_KEY',
  ]);
  if (envVal) {
    console.info('[Auth] Using private key from environment');
    return envVal;
  }
  try {
    const buf = fs.readFileSync(private_key_path);
    console.info(`[Auth] Using private key file: ${private_key_path}`);
    return buf;
  } catch (err) {
    console.warn(
      `⚠️ Private key not found at ${private_key_path} and no env key provided. Using insecure fallback "123".`
    );
    return '123';
  }
}

interface TokenData {
  [key: string]: any;
  secret_key?: string;
  email?: string;
  tokenId?: string;
}

export async function createToken(data: TokenData): Promise<string> {
  if (!secret_key) {
    throw new Error('SECRET_KEY is not defined in the environment variables.');
  }

  data.secret_key = secret_key;
  const private_key = getPrivateKey();

  const token = await pasetoSign(data, private_key, { expiresIn: expiresIn });

  return token;
}

export function createRefreshToken(
  data: TokenData,
  rememberme: boolean
): string {
  if (!refresh_secret_key) {
    throw new Error(
      'REFRESH_SECRET_KEY is not defined in the environment variables.'
    );
  }

  const payload = { ...data };
  delete payload.secret_key;

  const expiresInValue = rememberme ? refreshExpiresIn : '1d';

  return jwt.sign(payload, refresh_secret_key, {
    expiresIn: expiresInValue as jwt.SignOptions['expiresIn'],
  });
}

export async function registermailtoken(data: TokenData): Promise<string> {
  if (!mail_secret_key) {
    throw new Error(
      'MAIL_SECRET_KEY is not defined in the environment variables.'
    );
  }

  console.log('registermailtoken');

  data.secret_key = mail_secret_key;

  const newToken = new Token({
    token: '123',
    email: data.email,
  });

  const savedToken = await newToken.save();

  console.log('Token ID:', savedToken._id);

  data.tokenId = String(savedToken._id);

  const private_key = getPrivateKey();
  const token = await pasetoSign(data, private_key, {
    expiresIn: mailexpiresIn,
  });

  savedToken.token = token;
  await savedToken.save();

  console.log('Updated Token:', savedToken);

  return token;
}

export async function forgotmailtoken(data: TokenData): Promise<string> {
  if (!forgot_secret_key) {
    throw new Error(
      'FORGOT_SECRET_KEY is not defined in the environment variables.'
    );
  }
  console.log('forgotmailtoken');

  data.secret_key = forgot_secret_key;

  console.log('forgotmailtoken data', data);
  const newToken = new Token({
    token: '123',
    email: data.email,
  });

  const savedToken = await newToken.save();

  console.log('Token ID:', savedToken._id);

  data.tokenId = String(savedToken._id);
  const private_key = getPrivateKey();
  let token = await pasetoSign(data, private_key, { expiresIn: mailexpiresIn });

  savedToken.token = token;
  await savedToken.save();

  console.log('Updated Token:', savedToken);

  return token;
}
