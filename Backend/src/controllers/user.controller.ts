import { Request, Response } from 'express';
import User from '../models/User.model';
import Asset from '../models/Asset.model';
import type { IUser } from '../types/User';

// Simplified: do not populate any referenced models to ensure we only deal with User document fields.
// This avoids errors for unregistered schemas like Task when only updating basic profile fields.
const populateUserQuery = <T>(query: any) => query; // no-op

type SkillPayload = string | { name?: unknown; level?: unknown; years?: unknown } | null | undefined;
type QualificationPayload = { title?: unknown; institution?: unknown; year?: unknown } | null | undefined;
type ExperiencePayload =
  | string
  | { company?: unknown; role?: unknown; duration?: unknown; description?: unknown }
  | null
  | undefined;

const toStringOrUndefined = (value: unknown) => (typeof value === 'string' ? value.trim() || undefined : undefined);

const sanitizeLinks = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const links = value
    .map((link) => (typeof link === 'string' ? link.trim() : ''))
    .filter((link) => link.length > 0);
  return links.length ? links : [];
};

const sanitizeSkills = (value: unknown): IUser['skills'] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const skills: NonNullable<IUser['skills']> = [];
  value.forEach((entry: SkillPayload) => {
    if (!entry) return;
    if (typeof entry === 'string') {
      const name = entry.trim();
      if (name) skills.push({ name });
      return;
    }
    if (typeof entry === 'object') {
      const name = toStringOrUndefined(entry.name);
      if (!name) return;
      const skill: NonNullable<IUser['skills']>[number] = { name };
      const level = toStringOrUndefined(entry.level);
      if (level) skill.level = level;
      const yearsRaw = (entry.years as number | string | undefined);
      const years = yearsRaw === undefined ? undefined : Number(yearsRaw);
      if (!Number.isNaN(years) && years !== undefined) skill.years = years;
      skills.push(skill);
    }
  });
  return skills;
};

const sanitizeQualifications = (value: unknown): IUser['qualifications'] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const qualifications: NonNullable<IUser['qualifications']> = [];
  value.forEach((entry: QualificationPayload) => {
    if (!entry || typeof entry !== 'object') return;
    const title = toStringOrUndefined(entry.title);
    const institution = toStringOrUndefined(entry.institution);
    const yearRaw = (entry.year as number | string | undefined);
    const yearNum = yearRaw === undefined ? undefined : Number(yearRaw);
    if (!title || !institution || Number.isNaN(yearNum)) return;
    qualifications.push({ title, institution, year: yearNum! });
  });
  return qualifications;
};


const sanitizeExperience = (value: unknown): IUser['experience'] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const experience: NonNullable<IUser['experience']> = [];
  value.forEach((entry: ExperiencePayload) => {
    if (!entry) return;
    if (typeof entry === 'string') {
      const description = entry.trim();
      if (!description) return;
      experience.push({
        company: description,
        role: 'Not specified',
        duration: 'Not specified',
        description,
      });
      return;
    }
    if (typeof entry === 'object') {
      const company = toStringOrUndefined(entry.company);
      const role = toStringOrUndefined(entry.role);
      const duration = toStringOrUndefined(entry.duration);
      if (!company || !role || !duration) return;
      const exp: NonNullable<IUser['experience']>[number] = { company, role, duration };
      const description = toStringOrUndefined(entry.description);
      if (description) exp.description = description;
      experience.push(exp);
    }
  });
  return experience;
};

const getUserIdFromRequest = (req: Request): string | undefined => {
  const fromBody = (req.body && (req.body.userid as string | undefined)) || undefined;
  const fromRequest = (req as unknown as { userId?: string }).userId;
  return fromBody || fromRequest;
};

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unexpected error';
};

export async function getMe(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error: unknown) {
    return res.status(500).json({ message: 'Failed to fetch user', error: extractErrorMessage(error) });
  }
}

export async function getUserByEmail(req: Request, res: Response) {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error: unknown) {
      console.log('Error fetching user by email:', error);
    return res.status(500).json({
      message: 'Failed to fetch user',
      error: extractErrorMessage(error),
    });
  }
}

// New: patch user profile fields by email (partial update)
export async function patchUserByEmail(req: Request, res: Response) {
  try {
    const { email, name, phone, bio, links, skills, qualifications, experience } = req.body || {};
    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Email is required for update' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const update: Partial<IUser> = {};

    const trimmedName = toStringOrUndefined(name);
    if (trimmedName) update.name = trimmedName;
    const trimmedPhone = toStringOrUndefined(phone);
    if (trimmedPhone) update.phone = trimmedPhone;
    if (typeof bio === 'string') update.bio = bio.trim();
    const sanitizedLinks = sanitizeLinks(links);
    if (sanitizedLinks) update.links = sanitizedLinks;
    const sanitizedSkills = sanitizeSkills(skills);
    if (sanitizedSkills) update.skills = sanitizedSkills;
    const sanitizedQualifications = sanitizeQualifications(qualifications);
    if (sanitizedQualifications) update.qualifications = sanitizedQualifications;
    const sanitizedExperience = sanitizeExperience(experience);
    if (sanitizedExperience) update.experience = sanitizedExperience;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json(user);
  } catch (error: unknown) {
    return res.status(500).json({ message: 'Failed to patch user', error: extractErrorMessage(error) });
  }
}

export async function uploadProfileImage(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    // TODO: integrate with real storage (e.g., Cloudinary/S3). For now, store metadata with a dummy URL.
    const asset = await Asset.create({
      owner: userId,
      url: `/uploads/${file.filename || file.originalname}`,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    const user = await populateUserQuery(
      User.findByIdAndUpdate(userId, { profileImage: asset._id }, { new: true, runValidators: true })
    ).lean();
    return res.json(user);
  } catch (error: unknown) {
    return res.status(500).json({ message: 'Failed to upload profile image', error: extractErrorMessage(error) });
  }
}

export async function uploadResume(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const asset = await Asset.create({
      owner: userId,
      url: `/uploads/${file.filename || file.originalname}`,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    const user = await populateUserQuery(
      User.findByIdAndUpdate(userId, { resume: asset._id }, { new: true, runValidators: true })
    ).lean();
    return res.json(user);
  } catch (error: unknown) {
    return res.status(500).json({ message: 'Failed to upload resume', error: extractErrorMessage(error) });
  }
}

export async function uploadCertifications(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

    const assets = await Promise.all(
      files.map((file) =>
        Asset.create({
          owner: userId,
          url: `/uploads/${file.filename || file.originalname}`,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        })
      )
    );

    const user = await populateUserQuery(
      User.findByIdAndUpdate(
        userId,
        { $push: { certifications: { $each: assets.map((a) => a._id) } } },
        { new: true, runValidators: true }
      )
    ).lean();
    return res.json(user);
  } catch (error: unknown) {
    return res.status(500).json({ message: 'Failed to upload certifications', error: extractErrorMessage(error) });
  }
}
