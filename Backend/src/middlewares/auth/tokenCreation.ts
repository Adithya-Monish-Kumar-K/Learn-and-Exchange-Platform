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

const private_key_path = path.resolve(__dirname, '../rsa/private_key.pem');

function getPrivateKey(): Buffer | string {
  try {
    return fs.readFileSync(private_key_path);
  } catch (err) {
    console.warn(
      `⚠️ Private key not found or unreadable at ${private_key_path}. Using fallback value "123".`
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
  const token = await pasetoSign(data, private_key, { expiresIn: mailexpiresIn });

  savedToken.token = token;
  await savedToken.save();

  console.log('Updated Token:', savedToken);

  return token;
}

export async function forgotmailtoken(data: TokenData): Promise<string> {
    if (!forgot_secret_key) {
        throw new Error('FORGOT_SECRET_KEY is not defined in the environment variables.');
    }
    console.log("forgotmailtoken")

    data.secret_key = forgot_secret_key;

    console.log("forgotmailtoken data",data)
    const newToken = new Token({
        token: "123", 
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

