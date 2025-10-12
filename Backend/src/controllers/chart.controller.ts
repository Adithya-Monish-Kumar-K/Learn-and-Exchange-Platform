import { Request, Response } from 'express';
import User from '../models/User.model';
import Task from '../models/Task.model';
import Review from '../models/Review.model';

// Get monthly task completion data for the last 6 months
export const getTaskCompletionTrend = async (req: Request, res: Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const tasks = await Task.aggregate([
      {
        $match: {
          status: 'Completed',
          updatedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$completedAt' },
            year: { $year: '$completedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const data = {
      labels: [] as string[],
      datasets: [
        {
          label: 'Tasks Completed',
          data: [] as number[],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.3,
        },
      ],
    };

    tasks.forEach((task) => {
      data.labels.push(`${monthNames[task._id.month - 1]} ${task._id.year}`);
      data.datasets[0].data.push(task.count);
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching task completion trend:', error);
    res.status(500).json({ message: 'Error fetching task completion trend' });
  }
};

// Get user registration data by month for the last 6 months
export const getUserRegistrationTrend = async (req: Request, res: Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const users = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const data = {
      labels: [] as string[],
      datasets: [
        {
          label: 'New Users',
          data: [] as number[],
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
        },
      ],
    };

    users.forEach((user) => {
      data.labels.push(`${monthNames[user._id.month - 1]} ${user._id.year}`);
      data.datasets[0].data.push(user.count);
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user registration trend:', error);
    res.status(500).json({ message: 'Error fetching user registration trend' });
  }
};

// Get review rating distribution
export const getReviewDistribution = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const data = {
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      datasets: [
        {
          data: Array(5).fill(0),
          backgroundColor: [
            'rgba(239, 68, 68, 0.5)', // red
            'rgba(249, 115, 22, 0.5)', // orange
            'rgba(234, 179, 8, 0.5)', // yellow
            'rgba(34, 197, 94, 0.5)', // green
            'rgba(59, 130, 246, 0.5)', // blue
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(249, 115, 22)',
            'rgb(234, 179, 8)',
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
          ],
          borderWidth: 1,
        },
      ],
    };

    reviews.forEach((review: any) => {
      if (review._id >= 1 && review._id <= 5) {
        data.datasets[0].data[review._id - 1] = review.count;
      }
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching review distribution:', error);
    res.status(500).json({ message: 'Error fetching review distribution' });
  }
};
