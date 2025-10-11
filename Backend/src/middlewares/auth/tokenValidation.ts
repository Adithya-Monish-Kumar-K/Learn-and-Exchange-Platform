import dotenv from 'dotenv';
import Token from '../../models/Token.model';
import * as paseto from 'paseto';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const {
  V4: { verify },
} = paseto as any;

const secret_key = process.env.SECRET_KEY;
const mail_secret_key = process.env.MAIL_SECRET_KEY;
const forgot_secret_key = process.env.FORGOT_SECRET_KEY;

const public_key_path = path.resolve(__dirname, '../rsa/public_key.pem');

function getPublicKey(): Buffer | string {
  try {
    return fs.readFileSync(public_key_path);
  } catch (err) {
    console.warn(
      `⚠️ Public key not found or unreadable at ${public_key_path}. Using fallback value "123".`
    );
    return '123';
  }
}

function attachNormalizedUser(req: Request, payload: any) {
  const userid = payload.userid ?? payload.userId;
  const email = payload.email;
  const name = payload.name;
  const role = payload.role;
  const isActive = payload.isActive;

  // attach both req.user and req.body.userid for compatibility
  (req as any).user = {
    userid,
    _id: userid, // controllers that expect req.user._id will work
    email,
    name,
    role,
    isActive,
  };

  if (!req.body) (req as any).body = {};
  (req as any).body.userid = userid;
}

export async function tokenValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log('tokenValidator');
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader && tokenHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
  }

  try {
    const public_key = getPublicKey();
    const payload = (await verify(token, public_key)) as any;

    // accept both userid and userId from token payload
    const userid = payload?.userid ?? payload?.userId;
    
    // Don't mutate req.body (causes unrecognized_keys in downstream validation). Attach to request context instead.
    interface AuthAugmentedRequest extends Request { auth?: any }
    const areFieldsPresent = (
      payload &&
      payload.secret_key === secret_key &&
      userid &&
      payload.email &&
      payload.name &&
      payload.role &&
      typeof payload.isActive !== 'undefined'
    );

    if (!areFieldsPresent) {
      console.log('Invalid token payload:', payload);
      return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
    }

    (req as AuthAugmentedRequest).auth = {
      userid: payload.userid,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      isActive: payload.isActive,
    };
    // For compatibility with existing code expecting userId from body, keep a lightweight field separate from body
    (req as any).userId = payload.userid;
    console.log('Token payload attached to req.auth');
    return next();
  } catch (err: any) {
    return res
      .status(401)
      .send({ MESSAGE: 'Invalid or expired token: ' + err.message });
  }
}

export async function admintokenValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log('admintokenValidator');
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader && tokenHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
  }

  try {
    const public_key = getPublicKey();
    const payload = (await verify(token, public_key)) as any;

    const userid = payload?.userid ?? payload?.userId;

    if (
      payload &&
      payload.secret_key === secret_key &&
      userid &&
      payload.email &&
      payload.name &&
      payload.role &&
      typeof payload.isActive !== 'undefined'
    ) {
      attachNormalizedUser(req, payload);

      if ((req as any).user.role !== 'admin') {
        return res
          .status(401)
          .send({ message: 'You are not authorized to access this resource.' });
      }

      return next();
    } else {
      console.log('Invalid token payload:', payload);
      return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
    }
  } catch (err: any) {
    console.error('Token verification error:', err.message);
    return res
      .status(401)
      .send({ MESSAGE: 'Invalid or expired token: ' + err.message });
  }
}

// readverifyRegisterTokens, readverifyForgotToken, verifyRegisterToken, verifyForgotToken
// remain unchanged (they set req.body.email/name and validate mail/forgot tokens)
export async function readverifyRegisterTokens(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader && tokenHeader.split(' ')[1];

  console.log('Received token:', token);

  if (!token) {
    return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
  }

  try {
    const existingToken = await Token.findOne({ token });
    console.log('Token found in database:', existingToken);

    if (!existingToken) {
      return res.status(401).send({
        MESSAGE: 'Token not found in database or has already been used.',
      });
    }

    const public_key = getPublicKey();
    const payload = await verify(token, public_key);

    if (!req.body) {
      req.body = {};
    }
    console.log('Decoded payload:', payload);

    if (
      payload &&
      payload.secret_key === mail_secret_key &&
      payload.email &&
      payload.name
    ) {
      req.body.email = payload.email;
      req.body.name = payload.name;

      if (payload.phone) req.body.phone = payload.phone;
      if (payload.role) req.body.role = payload.role;

      console.log('User details added to request body:', req.body);

      next();
    } else {
      console.log('Invalid token payload:', payload);
      return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
    }
  } catch (err: any) {
    console.error('Error verifying token:', err.message);

    return res
      .status(401)
      .send({ MESSAGE: 'Invalid or expired token: ' + err.message });
  }
}

export async function readverifyForgotToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader && tokenHeader.split(' ')[1];

  console.log('Received token:', token);

  if (!token) {
    return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
  }

  try {
    const existingToken = await Token.findOne({ token });
    console.log('Token found in database:', existingToken);

    if (!existingToken) {
      return res.status(401).send({
        MESSAGE: 'Token not found in database or has already been used.',
      });
    }

    const public_key = getPublicKey();
    const payload = await verify(token, public_key);

    if (!req.body) {
      req.body = {};
    }
    console.log('Decoded payload:', payload);

    if (
      payload &&
      payload.secret_key === forgot_secret_key &&
      payload.email &&
      payload.name
    ) {
      req.body.email = payload.email;
      req.body.name = payload.name;

      console.log('User details added to request body:', req.body);

      next();
    } else {
      return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
    }
  } catch (err: any) {
    console.error('Error verifying token:', err.message);

    return res
      .status(401)
      .send({ MESSAGE: 'Invalid or expired token: ' + err.message });
  }
}

export async function verifyRegisterToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader && tokenHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
  }

  try {
    const public_key = getPublicKey();
    const payload = await verify(token, public_key);

    if (!req.body) {
      req.body = {};
    }

    if (
      payload &&
      payload.secret_key === mail_secret_key &&
      payload.email &&
      payload.name
    ) {
      const existingToken = await Token.findOne({ token });

      if (!existingToken) {
        return res
          .status(401)
          .send({ MESSAGE: 'Token has already been used or expired.' });
      }

      req.body.email = payload.email;
      req.body.name = payload.name;

      if (payload.phone) req.body.phone = payload.phone;
      if (payload.role) req.body.role = payload.role;
      console.log('Token payload:', payload);
      console.log('User details added to request body:', req.body);
      await Token.deleteOne({ token });

      next();
    } else {
      return res
        .status(401)
        .send({ MESSAGE: 'Invalid register token payload.' });
    }
  } catch (err: any) {
    return res
      .status(401)
      .send({ MESSAGE: 'Invalid or expired register token: ' + err.message });
  }
}

export async function verifyForgotToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader && tokenHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
  }

  try {
    const public_key = getPublicKey();
    const payload = await verify(token, public_key);

    if (!req.body) {
      req.body = {};
    }

    if (
      payload &&
      payload.secret_key === forgot_secret_key &&
      payload.email &&
      payload.name
    ) {
      const existingToken = await Token.findOne({ token });
      console.log(existingToken);
      if (!existingToken) {
        return res
          .status(401)
          .send({ MESSAGE: 'Token has already been used or expired.' });
      }

      req.body.email = payload.email;
      req.body.name = payload.name;

      await Token.deleteOne({ token });

      next();
    } else {
      return res.status(401).send({ MESSAGE: 'Invalid forgot token payload.' });
    }
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({ MESSAGE: 'Forgot token has expired.' });
    }

    return res
      .status(401)
      .send({ MESSAGE: 'Invalid or expired forgot token: ' + err.message });
  }
}
