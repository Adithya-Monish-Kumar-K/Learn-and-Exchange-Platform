import { Request, Response } from 'express';
import Offer from '../models/Offer.model';

// @desc    Get all offers
// @route   GET /api/offers
// @access  Public
export const getAllOffers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      valueType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = req.query;

    // Build filter object
    const filter: any = { isActive: true };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (valueType && valueType !== 'all') {
      filter.valueType = valueType;
    }

    // Build search query
    let query = Offer.find(filter);

    if (search) {
      query = query.find({
        $text: { $search: search as string },
      });
    }

    // Apply sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    query = query.sort(sortOptions);

    // Apply pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    query = query.skip(skip).limit(parseInt(limit as string));

    // Note: removed cross-model populates to decouple from Task/User

    const offers = await query;

    // Get total count for pagination
    const total = await Offer.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: offers.length,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
      data: offers,
    });
  } catch (error: any) {
    console.error('Get all offers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch offers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get single offer
// @route   GET /api/offers/:id
// @access  Public
export const getOfferById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      res.status(404).json({
        status: 'error',
        message: 'Offer not found',
      });
      return;
    }

    // Increment view count
    offer.viewCount = (offer.viewCount || 0) + 1;
    await offer.save();

    res.status(200).json({
      status: 'success',
      data: offer,
    });
  } catch (error: any) {
    console.error('Get offer by ID error:', error);

    if (error.name === 'CastError') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid offer ID format',
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch offer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private (when auth is implemented)
export const createOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log('Creating offer:', req.body);
    const {
      task,
      offeredBy,
      description,
      valueType,
      valueDetail,
      assets,
      expiresAt,
    } = req.body;

    // Note: Skipping cross-model existence checks to decouple from Task/User

    // Check if user already has a pending offer for this task
    const existingOffer = await Offer.findOne({
      task,
      offeredBy,
      status: 'pending',
      isActive: true,
    });

    if (existingOffer) {
      res.status(400).json({
        status: 'error',
        message: 'You already have a pending offer for this task',
      });
      return;
    }

    // Create new offer
    const offerData: any = {
      task,
      offeredBy,
      description,
      valueType,
      valueDetail,
      assets: assets || [],
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    };

    const offer = await Offer.create(offerData);

    // Skipped populates to avoid Task/User dependencies

    res.status(201).json({
      status: 'success',
      message: 'Offer created successfully',
      data: offer,
    });
  } catch (error: any) {
    console.error('Create offer error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));

      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create offer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private (when auth is implemented)
export const updateOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      res.status(404).json({
        status: 'error',
        message: 'Offer not found',
      });
      return;
    }

    // Check if offer can be modified (only pending offers can be updated)
    if (offer.status !== 'pending') {
      res.status(400).json({
        status: 'error',
        message: 'Only pending offers can be modified',
      });
      return;
    }

    // Update allowed fields
    const allowedUpdates = [
      'description',
      'valueType',
      'valueDetail',
      'assets',
      'status',
      'expiresAt',
      'priority',
      'estimatedDelivery',
      'terms',
      'attachments',
    ];
    const updates: any = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If task is being updated, assign directly (no cross-model validation)
    if (req.body.task) {
      updates.task = req.body.task;
    }

    const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('offeredBy', 'name avatar rating level')
      .populate('acceptedBy', 'name avatar');

    res.status(200).json({
      status: 'success',
      message: 'Offer updated successfully',
      data: updatedOffer,
    });
  } catch (error: any) {
    console.error('Update offer error:', error);

    if (error.name === 'CastError') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid offer ID format',
      });
      return;
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));

      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update offer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private (when auth is implemented)
export const deleteOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      res.status(404).json({
        status: 'error',
        message: 'Offer not found',
      });
      return;
    }

    // Soft delete - set isActive to false
    offer.isActive = false;
    await offer.save();

    res.status(200).json({
      status: 'success',
      message: 'Offer deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete offer error:', error);

    if (error.name === 'CastError') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid offer ID format',
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete offer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get offers by user
// @route   GET /api/offers/user/:userId
// @access  Public
export const getOffersByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status, page = '1', limit = '10' } = req.query;

    const filter: any = { offeredBy: userId, isActive: true };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const offers = await Offer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Offer.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: offers.length,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
      data: offers,
    });
  } catch (error: any) {
    console.error('Get offers by user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user offers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Accept offer
// @route   POST /api/offers/:id/accept
// @access  Private
export const acceptOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      res.status(404).json({
        status: 'error',
        message: 'Offer not found',
      });
      return;
    }

    await offer.accept(userId);

    // Skipped populates to decouple from Task/User

    res.status(200).json({
      status: 'success',
      message: 'Offer accepted successfully',
      data: offer,
    });
  } catch (error: any) {
    console.error('Accept offer error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to accept offer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Withdraw offer
// @route   POST /api/offers/:id/withdraw
// @access  Private
export const withdrawOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      res.status(404).json({
        status: 'error',
        message: 'Offer not found',
      });
      return;
    }

    await offer.withdraw();

    res.status(200).json({
      status: 'success',
      message: 'Offer withdrawn successfully',
      data: offer,
    });
  } catch (error: any) {
    console.error('Withdraw offer error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to withdraw offer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Add feedback to offer
// @route   POST /api/offers/:id/feedback
// @access  Private
export const addFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { rating, comment, userId } = req.body;
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      res.status(404).json({
        status: 'error',
        message: 'Offer not found',
      });
      return;
    }

    if (offer.status !== 'accepted') {
      res.status(400).json({
        status: 'error',
        message: 'Can only add feedback to accepted offers',
      });
      return;
    }

    offer.feedback = {
      rating,
      comment,
      givenBy: userId,
      givenAt: new Date(),
    };

    await offer.save();

    res.status(200).json({
      status: 'success',
      message: 'Feedback added successfully',
      data: offer,
    });
  } catch (error: any) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
