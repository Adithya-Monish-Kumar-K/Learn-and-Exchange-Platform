import { Request, Response } from 'express';
import User from '../models/User.model';
import Task from '../models/Task.model';
import Offer from '../models/Offer.model';
import Review from '../models/Review.model';

interface StatResponse {
  title: string;
  value: number;
  trend: {
    value: number;
    isPositive: boolean;
  };
}

// Get total users count and trend
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const currentCount = await User.countDocuments({ isActive: true });
    
    // Get count from 30 days ago for trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const previousCount = await User.countDocuments({
      createdAt: { $lt: thirtyDaysAgo },
      isActive: true
    });

    const trend = {
      value: Math.round(((currentCount - previousCount) / previousCount) * 100),
      isPositive: currentCount >= previousCount
    };

    const stats: StatResponse = {
      title: 'Total Users',
      value: currentCount,
      trend
    };

    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ message: 'Error fetching user statistics' });
  }
};

// Get completed tasks count and trend
export const getTaskStats = async (req: Request, res: Response) => {
  try {
    const currentCount = await Task.countDocuments({ status: 'completed' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const previousCount = await Task.countDocuments({
      completedAt: { $lt: thirtyDaysAgo },
      status: 'completed'
    });

    const trend = {
      value: Math.round(((currentCount - previousCount) / previousCount) * 100),
      isPositive: currentCount >= previousCount
    };

    const stats: StatResponse = {
      title: 'Tasks Completed',
      value: currentCount,
      trend
    };

    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('Error fetching task stats:', error);
    return res.status(500).json({ message: 'Error fetching task statistics' });
  }
};

// Get active offers count and trend
export const getOfferStats = async (req: Request, res: Response) => {
  try {
    const currentCount = await Offer.countDocuments({ status: 'active' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const previousCount = await Offer.countDocuments({
      createdAt: { $lt: thirtyDaysAgo },
      status: 'active'
    });

    const trend = {
      value: Math.round(((currentCount - previousCount) / previousCount) * 100),
      isPositive: currentCount >= previousCount
    };

    const stats: StatResponse = {
      title: 'Active Offers',
      value: currentCount,
      trend
    };

    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('Error fetching offer stats:', error);
    return res.status(500).json({ message: 'Error fetching offer statistics' });
  }
};

// Get reviews count and trend
export const getReviewStats = async (req: Request, res: Response) => {
  try {
    const currentCount = await Review.countDocuments();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const previousCount = await Review.countDocuments({
      createdAt: { $lt: thirtyDaysAgo }
    });

    const trend = {
      value: Math.round(((currentCount - previousCount) / previousCount) * 100),
      isPositive: currentCount >= previousCount
    };

    const stats: StatResponse = {
      title: 'Reviews',
      value: currentCount,
      trend
    };

    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('Error fetching review stats:', error);
    return res.status(500).json({ message: 'Error fetching review statistics' });
  }
};

// Get all stats combined
export const getAllStats = async (req: Request, res: Response) => {
  try {
    console.log("Fetching all stats");
    const [users, tasks, offers, reviews] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Task.countDocuments({ status: 'completed' }),
      Offer.countDocuments({ status: 'active' }),
      Review.countDocuments()
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [previousUsers, previousTasks, previousOffers, previousReviews] = await Promise.all([
      User.countDocuments({ createdAt: { $lt: thirtyDaysAgo }, isActive: true }),
      Task.countDocuments({ completedAt: { $lt: thirtyDaysAgo }, status: 'completed' }),
      Offer.countDocuments({ createdAt: { $lt: thirtyDaysAgo }, status: 'active' }),
      Review.countDocuments({ createdAt: { $lt: thirtyDaysAgo } })
    ]);

    const calculateTrend = (current: number, previous: number) => ({
      value: Math.round(((current - previous) / previous) * 100),
      isPositive: current >= previous
    });

    const stats = [
      {
        title: 'Total Users',
        value: users,
        trend: calculateTrend(users, previousUsers)
      },
      {
        title: 'Tasks Completed',
        value: tasks,
        trend: calculateTrend(tasks, previousTasks)
      },
      {
        title: 'Active Offers',
        value: offers,
        trend: calculateTrend(offers, previousOffers)
      },
      {
        title: 'Reviews',
        value: reviews,
        trend: calculateTrend(reviews, previousReviews)
      }
    ];
    console.log("Stats fetched:", stats);

    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('Error fetching all stats:', error);
    return res.status(500).json({ message: 'Error fetching statistics' });
  }
};