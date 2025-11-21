import User from '../models/User.js';
import Job from '../models/Job.js';
import Testimonial from '../models/Testimonial.js';

// @desc    Public platform stats for marketing sections (no auth)
// @route   GET /api/stats
// @access  Public
export async function getPublicStats(req, res) {
  try {
    const [
      totalUsers,
      totalJobs,
      activeJobs,
      testimonialAgg,
      distinctCategories,
      distinctCountries
    ] = await Promise.all([
      User.countDocuments({}),
      Job.countDocuments({}),
      Job.countDocuments({ status: 'active' }),
      Testimonial.aggregate([
        { $match: {} },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            total: { $sum: 1 },
          },
        },
      ]),
      Job.distinct('category'),
      User.distinct('country'),
    ]);

    const testimonialStats = testimonialAgg[0] || { avgRating: 0, total: 0 };
    const averageRating = Math.round((testimonialStats.avgRating || 0) * 10) / 10;

    const stats = {
      activeUsers: totalUsers,
      verifiedLeads: activeJobs || totalJobs,
      successRate: averageRating > 0 ? Math.round((averageRating / 5) * 100) : 0,
      averageRating,
      totalReviews: testimonialStats.total || 0,
      categories: distinctCategories.filter(Boolean).length,
      countries: distinctCountries.filter(Boolean).length,
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('[publicStats] error', error);
    res.status(500).json({ success: false, message: 'Failed to load public stats' });
  }
}





