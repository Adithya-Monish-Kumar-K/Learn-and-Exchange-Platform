import { Request, Response } from 'express';
import User from '../models/User.model';
import Asset from '../models/Asset.model';

export async function getMe(req: Request, res: Response) {
  try {
    const userId = (req.body && req.body.userid) || (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(userId)
      .populate('resume')
      .populate('profileImage')
      .populate('certifications')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const user = await User.findById(id)
      .populate('resume')
      .populate('profileImage')
      .populate('certifications')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const userId = (req.body && req.body.userid) || (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { bio, links, experience, skills, portfolio } = req.body || {};

    const update: any = {};
    if (typeof bio !== 'undefined') update.bio = bio;
    if (Array.isArray(links)) update.links = links;
    if (Array.isArray(experience)) update.experience = experience;
    if (Array.isArray(skills)) update.skills = skills;
    if (Array.isArray(portfolio)) update.portfolio = portfolio; // kept here for compatibility if later added to User model

    // Note: Files (profileImage/resume/certifications[]) are handled in separate endpoints

    const user = await User.findByIdAndUpdate(userId, update, { new: true })
      .populate('resume')
      .populate('profileImage')
      .populate('certifications')
      .lean();
    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
}

export async function uploadProfileImage(req: Request, res: Response) {
  try {
    const userId = (req.body && req.body.userid) || (req as any).userId;
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

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: asset._id },
      { new: true }
    )
      .populate('profileImage')
      .lean();
    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to upload profile image', error: err.message });
  }
}

export async function uploadResume(req: Request, res: Response) {
  try {
    const userId = (req.body && req.body.userid) || (req as any).userId;
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

    const user = await User.findByIdAndUpdate(
      userId,
      { resume: asset._id },
      { new: true }
    )
      .populate('resume')
      .lean();
    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to upload resume', error: err.message });
  }
}

export async function uploadCertifications(req: Request, res: Response) {
  try {
    const userId = (req.body && req.body.userid) || (req as any).userId;
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

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { certifications: { $each: assets.map((a) => a._id) } } },
      { new: true }
    )
      .populate('certifications')
      .lean();
    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to upload certifications', error: err.message });
  }
}
