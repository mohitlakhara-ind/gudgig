import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import crypto from 'crypto';

class AnalyticsService {
  // Job performance tracking
  async trackJobPerformance(jobId, metrics) {
    try {
      const job = await Job.findById(jobId);
      if (!job) throw new Error('Job not found');

      // Update job metrics
      if (metrics.views) job.views += metrics.views;
      if (metrics.applications) job.applicationsCount += metrics.applications;

      await job.save();

      // Log performance data
      await this.logAnalyticsEvent('job_performance', {
        jobId,
        ...metrics,
        timestamp: new Date()
      });

      return job;
    } catch (error) {
      console.error('Job performance tracking error:', error);
      throw error;
    }
  }

  // User behavior analytics with privacy compliance
  async trackUserBehavior(userId, event, data, anonymize = true) {
    try {
      let analyticsData = {
        userId: anonymize ? this.anonymizeUserId(userId) : userId,
        event,
        timestamp: new Date(),
        sessionId: data.sessionId,
        userAgent: data.userAgent,
        ipAddress: anonymize ? this.anonymizeIP(data.ipAddress) : data.ipAddress
      };

      // Add event-specific data
      switch (event) {
        case 'job_search':
          analyticsData.searchQuery = data.query;
          analyticsData.filters = data.filters;
          analyticsData.resultsCount = data.resultsCount;
          break;
        case 'job_view':
          analyticsData.jobId = data.jobId;
          analyticsData.source = data.source; // search, recommendation, etc.
          break;
        case 'application_start':
          analyticsData.jobId = data.jobId;
          break;
        case 'application_complete':
          analyticsData.jobId = data.jobId;
          analyticsData.applicationId = data.applicationId;
          break;
      }

      await this.logAnalyticsEvent('user_behavior', analyticsData);
      return analyticsData;
    } catch (error) {
      console.error('User behavior tracking error:', error);
      throw error;
    }
  }

  // Employer dashboard metrics
  async getEmployerMetrics(employerId, timeframe = 30) {
    try {
      const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

      const [
        jobs,
        applications,
        jobViews,
        recentJobs
      ] = await Promise.all([
        Job.find({
          employer: employerId,
          createdAt: { $gte: startDate }
        }).select('title views applicationsCount status createdAt'),

        Application.find({
          job: { $in: await Job.find({ employer: employerId }).distinct('_id') },
          createdAt: { $gte: startDate }
        }).populate('job', 'title'),

        Job.aggregate([
          { $match: { employer: employerId, createdAt: { $gte: startDate } } },
          { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]),

        Job.find({
          employer: employerId,
          status: 'active'
        }).sort({ createdAt: -1 }).limit(5)
      ]);

      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(job => job.status === 'active').length;
      const totalViews = jobViews[0]?.totalViews || 0;
      const totalApplications = applications.length;

      // Calculate time-to-fill (simplified)
      const filledJobs = jobs.filter(job => job.status === 'closed').length;
      const avgTimeToFill = filledJobs > 0 ?
        jobs
          .filter(job => job.status === 'closed')
          .reduce((acc, job) => acc + (job.updatedAt - job.createdAt), 0) / filledJobs / (1000 * 60 * 60 * 24) : 0;

      // Cost per hire (simplified - assuming average cost)
      const costPerHire = totalApplications > 0 ? 50 / totalApplications : 0; // $50 average cost

      return {
        overview: {
          totalJobs,
          activeJobs,
          totalViews,
          totalApplications,
          conversionRate: totalViews > 0 ? (totalApplications / totalViews * 100).toFixed(2) : 0
        },
        performance: {
          avgTimeToFill: avgTimeToFill.toFixed(1),
          costPerHire: costPerHire.toFixed(2),
          sourceAttribution: await this.calculateSourceAttribution(employerId)
        },
        recentActivity: {
          recentJobs: recentJobs.map(job => ({
            id: job._id,
            title: job.title,
            views: job.views,
            applications: job.applicationsCount,
            createdAt: job.createdAt
          })),
          recentApplications: applications.slice(0, 10)
        }
      };
    } catch (error) {
      console.error('Employer metrics error:', error);
      throw error;
    }
  }

  // A/B testing framework for feature optimization
  async runABTest(testName, variants, userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Simple A/B assignment based on user ID
      const variantIndex = parseInt(userId.slice(-1), 16) % variants.length;
      const assignedVariant = variants[variantIndex];

      // Track assignment
      await this.logAnalyticsEvent('ab_test_assignment', {
        testName,
        userId,
        variant: assignedVariant,
        timestamp: new Date()
      });

      return assignedVariant;
    } catch (error) {
      console.error('A/B test error:', error);
      throw error;
    }
  }

  // Compliance reporting (EEO, pay equity analysis)
  async generateComplianceReport(timeframe = 90) {
    try {
      const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

      const [
        jobPostings,
        applications,
        salaryData
      ] = await Promise.all([
        Job.find({
          createdAt: { $gte: startDate }
        }).select('category location salaryDisclosure eeocCompliant disabilityAccommodations veteranFriendly'),

        Application.find({
          createdAt: { $gte: startDate }
        }).populate('applicant', 'gender ethnicity'),

        Job.find({
          'salaryDisclosure.min': { $exists: true },
          createdAt: { $gte: startDate }
        }).select('salaryDisclosure category location')
      ]);

      // EEO Analysis
      const eeoStats = {
        totalPostings: jobPostings.length,
        eeocCompliantPostings: jobPostings.filter(job => job.eeocCompliant).length,
        disabilityFriendlyPostings: jobPostings.filter(job => job.disabilityAccommodations).length,
        veteranFriendlyPostings: jobPostings.filter(job => job.veteranFriendly).length
      };

      // Pay Equity Analysis (simplified)
      const payEquityStats = this.analyzePayEquity(salaryData);

      // Adverse Impact Monitoring
      const adverseImpactStats = await this.monitorAdverseImpact(applications);

      return {
        period: `${timeframe} days`,
        eeoCompliance: {
          ...eeoStats,
          complianceRate: (eeoStats.eeocCompliantPostings / eeoStats.totalPostings * 100).toFixed(2)
        },
        payEquity: payEquityStats,
        adverseImpact: adverseImpactStats,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Compliance report error:', error);
      throw error;
    }
  }

  // Predictive analytics for job success probability
  async predictJobSuccess(jobId) {
    try {
      const job = await Job.findById(jobId);
      if (!job) throw new Error('Job not found');

      // Simple predictive model based on historical data
      let successScore = 0;

      // Quality factors
      successScore += (job.qualityScore / 100) * 0.3;

      // Company reputation (simplified)
      const company = await User.findById(job.employer).populate('company');
      if (company?.company?.trustScore) {
        successScore += (company.company.trustScore / 100) * 0.2;
      }

      // Salary competitiveness
      if (job.salaryDisclosure?.min) {
        const avgSalary = await this.getAverageSalaryForCategory(job.category);
        const competitiveness = Math.min(job.salaryDisclosure.min / avgSalary, 1.5) / 1.5;
        successScore += competitiveness * 0.2;
      }

      // Description quality
      const descriptionWords = job.description.split(' ').length;
      successScore += Math.min(descriptionWords / 100, 1) * 0.15;

      // Skills clarity
      successScore += job.skills?.length > 0 ? 0.15 : 0;

      return {
        jobId,
        successProbability: Math.min(successScore * 100, 100).toFixed(2),
        factors: {
          qualityScore: job.qualityScore,
          hasSalary: !!job.salaryDisclosure?.min,
          descriptionLength: descriptionWords,
          skillsCount: job.skills?.length || 0,
          companyTrustScore: company?.company?.trustScore || 0
        }
      };
    } catch (error) {
      console.error('Job success prediction error:', error);
      throw error;
    }
  }

  // Real-time dashboard data aggregation
  async getRealtimeDashboardData(userId, userRole) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      let dashboardData = {};

      if (userRole === 'employer') {
        const [
          todayJobs,
          weekJobs,
          monthJobs,
          activeJobs,
          recentApplications
        ] = await Promise.all([
          Job.countDocuments({ employer: userId, createdAt: { $gte: today } }),
          Job.countDocuments({ employer: userId, createdAt: { $gte: thisWeek } }),
          Job.countDocuments({ employer: userId, createdAt: { $gte: thisMonth } }),
          Job.countDocuments({ employer: userId, status: 'active' }),
          Application.find({
            job: { $in: await Job.find({ employer: userId }).distinct('_id') }
          })
          .populate('job', 'title')
          .sort({ createdAt: -1 })
          .limit(5)
        ]);

        dashboardData = {
          jobs: {
            today: todayJobs,
            thisWeek: weekJobs,
            thisMonth: monthJobs,
            active: activeJobs
          },
          recentApplications,
          trends: await this.calculateTrends(userId, 'employer')
        };
      } else if (userRole === 'admin') {
        const [
          todayUsers,
          todayJobs,
          todayApplications,
          totalUsers,
          totalJobs
        ] = await Promise.all([
          User.countDocuments({ createdAt: { $gte: today } }),
          Job.countDocuments({ createdAt: { $gte: today } }),
          Application.countDocuments({ createdAt: { $gte: today } }),
          User.countDocuments(),
          Job.countDocuments()
        ]);

        dashboardData = {
          users: {
            today: todayUsers,
            total: totalUsers
          },
          jobs: {
            today: todayJobs,
            total: totalJobs
          },
          applications: {
            today: todayApplications
          },
          systemHealth: await this.getSystemHealthMetrics()
        };
      }

      return dashboardData;
    } catch (error) {
      console.error('Realtime dashboard error:', error);
      throw error;
    }
  }

  // Export capabilities for external BI tools
  async exportAnalyticsData(format = 'json', filters = {}) {
    try {
      const { startDate, endDate, eventType } = filters;

      let query = {};
      if (startDate && endDate) {
        query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      if (eventType) {
        query.event = eventType;
      }

      // In production, retrieve from analytics collection
      const data = []; // Placeholder

      if (format === 'csv') {
        return this.convertToCSV(data);
      }

      return data;
    } catch (error) {
      console.error('Analytics export error:', error);
      throw error;
    }
  }

  // Helper methods
  async logAnalyticsEvent(eventType, data) {
    // In production, store in analytics database
    console.log(`Analytics event: ${eventType}`, data);
  }

  anonymizeUserId(userId) {
    // Simple hashing for anonymization
    return crypto.createHash('sha256').update(userId).digest('hex').substring(0, 16);
  }

  anonymizeIP(ip) {
    // Remove last octet for anonymization
    return ip.replace(/\.\d+$/, '.0');
  }

  async calculateSourceAttribution(employerId) {
    // Simplified source attribution
    return {
      organic: 60,
      referral: 25,
      paid: 15
    };
  }

  analyzePayEquity(salaryData) {
    // Simplified pay equity analysis
    const byCategory = {};
    salaryData.forEach(job => {
      if (!byCategory[job.category]) byCategory[job.category] = [];
      byCategory[job.category].push(job.salaryDisclosure.min);
    });

    const equityStats = {};
    for (const [category, salaries] of Object.entries(byCategory)) {
      const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;
      const variance = salaries.reduce((acc, salary) => acc + Math.pow(salary - avg, 2), 0) / salaries.length;
      equityStats[category] = {
        averageSalary: avg.toFixed(2),
        salaryVariance: variance.toFixed(2),
        sampleSize: salaries.length
      };
    }

    return equityStats;
  }

  async monitorAdverseImpact(applications) {
    // Simplified adverse impact monitoring
    const total = applications.length;
    const groups = {
      gender: {},
      ethnicity: {}
    };

    applications.forEach(app => {
      if (app.applicant?.gender) {
        groups.gender[app.applicant.gender] = (groups.gender[app.applicant.gender] || 0) + 1;
      }
      if (app.applicant?.ethnicity) {
        groups.ethnicity[app.applicant.ethnicity] = (groups.ethnicity[app.applicant.ethnicity] || 0) + 1;
      }
    });

    return {
      totalApplications: total,
      demographicBreakdown: groups,
      adverseImpactDetected: false // Simplified
    };
  }

  async getAverageSalaryForCategory(category) {
    // Simplified average salary lookup
    const averages = {
      'Technology': 95000,
      'Healthcare': 75000,
      'Finance': 85000,
      'default': 70000
    };
    return averages[category] || averages.default;
  }

  async calculateTrends(userId, role) {
    // Calculate trending metrics
    const now = new Date();
    const periods = [7, 14, 30].map(days => ({
      days,
      date: new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    }));

    const trends = {};
    for (const period of periods) {
      const count = await Job.countDocuments({
        employer: userId,
        createdAt: { $gte: period.date }
      });
      trends[`${period.days}days`] = count;
    }

    return trends;
  }

  async getSystemHealthMetrics() {
    // System health metrics
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      responseTime: 'N/A' // Would need actual monitoring
    };
  }

  convertToCSV(data) {
    // Simple CSV conversion
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];

    return csvRows.join('\n');
  }
  // Get job views for specific jobs within a date range
  async getJobViews(jobIds, startDate, endDate) {
    try {
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return { totalViews: 0, viewsByJob: [] };
      }

      // Aggregate views from the jobs collection
      const viewsData = await Job.aggregate([
        {
          $match: {
            _id: { $in: jobIds },
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
            viewsByJob: {
              $push: {
                jobId: '$_id',
                title: '$title',
                views: '$views',
                createdAt: '$createdAt'
              }
            }
          }
        }
      ]);

      if (viewsData.length === 0) {
        return { totalViews: 0, viewsByJob: [] };
      }

      const result = viewsData[0];
      
      // Also get individual job view counts for detailed analysis
      const individualViews = await Job.find(
        { _id: { $in: jobIds } },
        { _id: 1, title: 1, views: 1, createdAt: 1 }
      );

      return {
        totalViews: result.totalViews || 0,
        viewsByJob: individualViews.map(job => ({
          jobId: job._id,
          title: job.title,
          views: job.views || 0,
          createdAt: job.createdAt
        })),
        dateRange: {
          startDate,
          endDate
        }
      };
    } catch (error) {
      console.error('Get job views error:', error);
      // Return default structure on error to prevent controller failures
      return { totalViews: 0, viewsByJob: [] };
    }
  }
}

export default new AnalyticsService();