import Job from '../models/Job.js';
import User from '../models/User.js';

class SearchService {
  // Semantic job search with MongoDB Atlas Search or fallback
  async semanticSearch(query, filters = {}, options = {}) {
    try {
      const {
        limit = 20,
        skip = 0,
        sortBy = 'relevance',
        userId = null
      } = options;

      let searchQuery = {
        status: 'active',
        ...filters
      };

      // If MongoDB Atlas Search is available, use it
      if (this.isAtlasSearchAvailable()) {
        const pipeline = [
          {
            $search: {
              text: {
                query: query,
                path: ['title', 'description', 'skills', 'requirements'],
                fuzzy: { maxEdits: 2 }
              }
            }
          },
          { $match: searchQuery },
          {
            $addFields: {
              score: { $meta: 'searchScore' }
            }
          }
        ];

        const results = await Job.aggregate(pipeline);
        return this.formatSearchResults(results, limit, skip);
      } else {
        // Fallback to basic text search
        searchQuery.$text = { $search: query };
        const results = await Job.find(searchQuery)
          .sort({ score: { $meta: 'textScore' } })
          .limit(limit)
          .skip(skip);
        return results;
      }
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  // Skills-based matching with synonym handling
  async skillsBasedSearch(skills, options = {}) {
    try {
      const { strict = false, limit = 20 } = options;

      // Expand skills with synonyms
      const expandedSkills = await this.expandSkillsWithSynonyms(skills);

      const query = strict
        ? { skills: { $all: expandedSkills } }
        : { skills: { $in: expandedSkills } };

      const jobs = await Job.find({
        ...query,
        status: 'active'
      })
      .sort({ qualityScore: -1, createdAt: -1 })
      .limit(limit);

      // Calculate skill match scores
      return jobs.map(job => ({
        ...job.toObject(),
        skillMatchScore: this.calculateSkillMatchScore(expandedSkills, job.skills)
      }));
    } catch (error) {
      console.error('Skills-based search error:', error);
      throw error;
    }
  }

  // Location-based search with radius
  async locationBasedSearch(coordinates, radiusKm = 50, options = {}) {
    try {
      const { remoteAllowed = true, limit = 20 } = options;

      let query = {
        status: 'active'
      };

      // For jobs with physical locations
      const locationQuery = {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: coordinates
          },
          distanceField: 'distance',
          maxDistance: radiusKm * 1000, // Convert to meters
          spherical: true
        }
      };

      // Include remote jobs if allowed
      if (remoteAllowed) {
        query.$or = [
          { jobLocationType: 'PHYSICAL_LOCATION' },
          { jobLocationType: 'HYBRID' },
          {
            jobLocationType: 'TELECOMMUTE',
            'remoteEligibility.allowedStates': { $exists: true }
          }
        ];
      } else {
        query.jobLocationType = { $in: ['PHYSICAL_LOCATION', 'HYBRID'] };
      }

      const jobs = await Job.aggregate([
        locationQuery,
        { $match: query },
        { $sort: { distance: 1, qualityScore: -1 } },
        { $limit: limit }
      ]);

      return jobs;
    } catch (error) {
      console.error('Location-based search error:', error);
      throw error;
    }
  }

  // Salary range search with currency conversion
  async salaryRangeSearch(minSalary, maxSalary, currency = 'USD', options = {}) {
    try {
      const { period = 'yearly', limit = 20 } = options;

      // Convert salary to USD if needed (simplified conversion)
      const conversionRates = { EUR: 1.1, GBP: 1.3, CAD: 0.8 }; // Example rates
      const usdMin = currency === 'USD' ? minSalary : minSalary * (conversionRates[currency] || 1);
      const usdMax = currency === 'USD' ? maxSalary : maxSalary * (conversionRates[currency] || 1);

      const query = {
        status: 'active',
        $or: [
          {
            'salaryDisclosure.min': { $gte: usdMin, $lte: usdMax },
            'salaryDisclosure.currency': 'USD',
            'salaryDisclosure.period': period
          },
          {
            'salary.min': { $gte: usdMin, $lte: usdMax },
            salary: { $exists: true }
          }
        ]
      };

      const jobs = await Job.find(query)
        .sort({ 'salaryDisclosure.min': -1 })
        .limit(limit);

      return jobs;
    } catch (error) {
      console.error('Salary range search error:', error);
      throw error;
    }
  }

  // Search analytics and query optimization
  async logSearchQuery(query, filters, resultsCount, userId = null) {
    try {
      // In production, store in database for analytics
      console.log(`Search query logged: "${query}", filters: ${JSON.stringify(filters)}, results: ${resultsCount}, user: ${userId}`);

      // Could implement query optimization based on analytics
      // e.g., suggest popular searches, cache frequent queries
    } catch (error) {
      console.error('Search logging error:', error);
    }
  }

  // Saved search and alert functionality
  async saveSearch(userId, searchCriteria, name) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Add to user's saved searches (assuming we add this field to User model)
      if (!user.savedSearches) user.savedSearches = [];
      user.savedSearches.push({
        name,
        criteria: searchCriteria,
        createdAt: new Date()
      });

      await user.save();
      return user.savedSearches[user.savedSearches.length - 1];
    } catch (error) {
      console.error('Save search error:', error);
      throw error;
    }
  }

  // Search result ranking based on relevance, recency, and quality
  rankResults(results, query, userPreferences = {}) {
    return results.map(job => {
      let score = 0;

      // Relevance score
      if (job.score) score += job.score * 0.4;

      // Quality score
      score += (job.qualityScore / 100) * 0.3;

      // Recency score (newer jobs get higher score)
      const daysSincePosted = (Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - (daysSincePosted / 30)); // Decay over 30 days
      score += recencyScore * 0.2;

      // User preference bonuses
      if (userPreferences.preferredCompanies?.includes(job.company?.name)) {
        score += 0.1;
      }
      if (userPreferences.preferredLocations?.includes(job.location)) {
        score += 0.1;
      }

      return {
        ...job,
        finalScore: score
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }

  // Faceted search capabilities
  async getSearchFacets(query = {}) {
    try {
      const facets = await Job.aggregate([
        { $match: { status: 'active', ...query } },
        {
          $facet: {
            categories: [
              { $group: { _id: '$category', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            types: [
              { $group: { _id: '$type', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            locations: [
              { $group: { _id: '$location', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],
            experienceLevels: [
              { $group: { _id: '$experience', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            salaryRanges: [
              {
                $bucket: {
                  groupBy: '$salaryDisclosure.min',
                  boundaries: [0, 30000, 50000, 70000, 100000, 150000],
                  default: '150000+',
                  output: { count: { $sum: 1 } }
                }
              }
            ]
          }
        }
      ]);

      return facets[0];
    } catch (error) {
      console.error('Facet search error:', error);
      throw error;
    }
  }

  // Helper methods
  isAtlasSearchAvailable() {
    // Check if MongoDB Atlas Search is configured
    return process.env.MONGODB_ATLAS_SEARCH === 'true';
  }

  async expandSkillsWithSynonyms(skills) {
    // Simple synonym expansion - in production, use a thesaurus API
    const synonyms = {
      'javascript': ['js', 'node.js', 'nodejs'],
      'python': ['py'],
      'react': ['reactjs', 'react.js'],
      'angular': ['angularjs', 'angular.js'],
      'vue': ['vuejs', 'vue.js']
    };

    const expanded = new Set(skills);
    skills.forEach(skill => {
      const skillSynonyms = synonyms[skill.toLowerCase()];
      if (skillSynonyms) {
        skillSynonyms.forEach(syn => expanded.add(syn));
      }
    });

    return Array.from(expanded);
  }

  calculateSkillMatchScore(requiredSkills, jobSkills) {
    if (!jobSkills || jobSkills.length === 0) return 0;

    const required = new Set(requiredSkills.map(s => s.toLowerCase()));
    const job = new Set(jobSkills.map(s => s.toLowerCase()));

    const matches = new Set([...required].filter(skill => job.has(skill)));
    return matches.size / required.size;
  }

  formatSearchResults(results, limit, skip) {
    return results.slice(skip, skip + limit).map(result => ({
      ...result,
      relevanceScore: result.score || 0
    }));
  }
  // Main search method called by controller
  async searchJobs(searchParams) {
    try {
      const {
        query,
        location,
        category,
        jobType,
        experienceLevel,
        salaryMin,
        salaryMax,
        remote,
        companySize,
        skills,
        page = 1,
        limit = 20,
        sortBy = 'relevance',
        userId
      } = searchParams;

      const skip = (page - 1) * limit;
      
      // Build filters
      const filters = {};
      if (location) filters.location = new RegExp(location, 'i');
      if (category) filters.category = category;
      if (jobType) filters.type = jobType;
      if (experienceLevel) filters.experience = experienceLevel;
      if (companySize) filters.companySize = companySize;
      if (remote !== undefined) filters.remote = remote;
      if (skills && skills.length > 0) filters.skills = { $in: skills };
      
      // Salary filter
      if (salaryMin || salaryMax) {
        filters.$or = [
          {
            'salaryDisclosure.min': {
              ...(salaryMin && { $gte: salaryMin }),
              ...(salaryMax && { $lte: salaryMax })
            }
          },
          {
            'salary.min': {
              ...(salaryMin && { $gte: salaryMin }),
              ...(salaryMax && { $lte: salaryMax })
            }
          }
        ];
      }

      let jobs;
      if (query) {
        // Use semantic search if query provided
        jobs = await this.semanticSearch(query, filters, { limit, skip, sortBy, userId });
      } else {
        // Regular filtered search
        const searchQuery = { status: 'active', ...filters };
        jobs = await Job.find(searchQuery)
          .populate('company', 'name logo')
          .sort(this.getSortOptions(sortBy))
          .skip(skip)
          .limit(limit);
      }

      const total = await Job.countDocuments({ status: 'active', ...filters });

      return {
        jobs,
        total,
        page,
        limit,
        appliedFilters: filters,
        suggestions: await this.getQuerySuggestions(query)
      };
    } catch (error) {
      console.error('Search jobs error:', error);
      throw error;
    }
  }

  // Get search suggestions
  async getSuggestions(query, type = 'all') {
    try {
      const suggestions = {
        jobs: [],
        locations: [],
        skills: [],
        companies: []
      };

      if (type === 'all' || type === 'jobs') {
        const jobTitles = await Job.distinct('title', {
          title: new RegExp(query, 'i'),
          status: 'active'
        }).limit(5);
        suggestions.jobs = jobTitles;
      }

      if (type === 'all' || type === 'locations') {
        const locations = await Job.distinct('location', {
          location: new RegExp(query, 'i'),
          status: 'active'
        }).limit(5);
        suggestions.locations = locations;
      }

      if (type === 'all' || type === 'skills') {
        const skills = await Job.aggregate([
          { $match: { status: 'active' } },
          { $unwind: '$skills' },
          { $match: { skills: new RegExp(query, 'i') } },
          { $group: { _id: '$skills', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]);
        suggestions.skills = skills.map(s => s._id);
      }

      if (type === 'all' || type === 'companies') {
        const companies = await Job.aggregate([
          { $match: { status: 'active' } },
          { $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'companyInfo' } },
          { $unwind: '$companyInfo' },
          { $match: { 'companyInfo.name': new RegExp(query, 'i') } },
          { $group: { _id: '$companyInfo.name', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]);
        suggestions.companies = companies.map(c => c._id);
      }

      return suggestions;
    } catch (error) {
      console.error('Get suggestions error:', error);
      throw error;
    }
  }

  // Save search with proper model integration
  async saveSearch(searchCriteria) {
    try {
      const user = await User.findById(searchCriteria.userId);
      if (!user) throw new Error('User not found');

      // Initialize savedSearches array if it doesn't exist
      if (!user.savedSearches) user.savedSearches = [];

      const savedSearch = {
        _id: new Date().getTime().toString(), // Simple ID generation
        name: searchCriteria.name,
        query: searchCriteria.query,
        location: searchCriteria.location,
        category: searchCriteria.category,
        jobType: searchCriteria.jobType,
        experienceLevel: searchCriteria.experienceLevel,
        salaryMin: searchCriteria.salaryMin,
        salaryMax: searchCriteria.salaryMax,
        remote: searchCriteria.remote,
        skills: searchCriteria.skills || [],
        alertFrequency: searchCriteria.alertFrequency || 'daily',
        isActive: searchCriteria.isActive !== false,
        createdAt: new Date(),
        lastAlertSent: null
      };

      user.savedSearches.push(savedSearch);
      await user.save();

      return savedSearch;
    } catch (error) {
      console.error('Save search error:', error);
      throw error;
    }
  }

  // Get saved searches for user
  async getSavedSearches(userId, page = 1, limit = 10) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.savedSearches) {
        return {
          searches: [],
          pagination: { page, limit, total: 0, pages: 0 }
        };
      }

      const skip = (page - 1) * limit;
      const searches = user.savedSearches
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + limit);

      return {
        searches,
        pagination: {
          page,
          limit,
          total: user.savedSearches.length,
          pages: Math.ceil(user.savedSearches.length / limit)
        }
      };
    } catch (error) {
      console.error('Get saved searches error:', error);
      throw error;
    }
  }

  // Update saved search
  async updateSavedSearch(searchId, userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.savedSearches) {
        return null;
      }

      const searchIndex = user.savedSearches.findIndex(s => s._id === searchId);
      if (searchIndex === -1) {
        return null;
      }

      // Update the search
      Object.assign(user.savedSearches[searchIndex], updateData, {
        updatedAt: new Date()
      });

      await user.save();
      return user.savedSearches[searchIndex];
    } catch (error) {
      console.error('Update saved search error:', error);
      throw error;
    }
  }

  // Delete saved search
  async deleteSavedSearch(searchId, userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.savedSearches) {
        return false;
      }

      const initialLength = user.savedSearches.length;
      user.savedSearches = user.savedSearches.filter(s => s._id !== searchId);

      if (user.savedSearches.length === initialLength) {
        return false; // Search not found
      }

      await user.save();
      return true;
    } catch (error) {
      console.error('Delete saved search error:', error);
      throw error;
    }
  }

  // Track search for analytics
  async trackSearch(userId, searchParams, resultsCount) {
    try {
      // Log the search query for analytics
      await this.logSearchQuery(
        searchParams.query,
        searchParams,
        resultsCount,
        userId
      );

      // In a real implementation, you might store this in a SearchAnalytics collection
      // For now, we'll just log it
      console.log('Search tracked:', {
        userId,
        query: searchParams.query,
        filters: searchParams,
        resultsCount,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Track search error:', error);
    }
  }

  // Get search analytics for user
  async getSearchAnalytics(userId, timeframe = '30d') {
    try {
      // In a real implementation, this would query a SearchAnalytics collection
      // For now, return mock data
      const mockAnalytics = {
        totalSearches: 45,
        topQueries: [
          { query: 'javascript developer', count: 12 },
          { query: 'react developer', count: 8 },
          { query: 'node.js', count: 6 }
        ],
        topFilters: {
          locations: [
            { location: 'New York', count: 15 },
            { location: 'San Francisco', count: 12 }
          ],
          categories: [
            { category: 'technology', count: 25 },
            { category: 'marketing', count: 8 }
          ]
        },
        searchTrends: [
          { date: '2024-01-01', searches: 5 },
          { date: '2024-01-02', searches: 8 },
          { date: '2024-01-03', searches: 12 }
        ],
        timeframe
      };

      return mockAnalytics;
    } catch (error) {
      console.error('Get search analytics error:', error);
      throw error;
    }
  }

  // Get trending searches
  async getTrendingSearches(limit = 10) {
    try {
      // In a real implementation, this would analyze search logs
      // For now, return mock trending data
      const trending = {
        queries: [
          { query: 'remote developer', count: 156, trend: '+12%' },
          { query: 'data scientist', count: 134, trend: '+8%' },
          { query: 'product manager', count: 98, trend: '+15%' },
          { query: 'ui/ux designer', count: 87, trend: '+5%' },
          { query: 'devops engineer', count: 76, trend: '+22%' }
        ].slice(0, limit),
        locations: [
          { location: 'Remote', count: 245, trend: '+18%' },
          { location: 'San Francisco', count: 189, trend: '+3%' },
          { location: 'New York', count: 167, trend: '+7%' }
        ].slice(0, limit),
        skills: [
          { skill: 'React', count: 198, trend: '+9%' },
          { skill: 'Python', count: 176, trend: '+14%' },
          { skill: 'AWS', count: 145, trend: '+11%' }
        ].slice(0, limit)
      };

      return trending;
    } catch (error) {
      console.error('Get trending searches error:', error);
      throw error;
    }
  }

  // Helper methods
  getSortOptions(sortBy) {
    switch (sortBy) {
      case 'date':
        return { createdAt: -1 };
      case 'salary':
        return { 'salaryDisclosure.min': -1 };
      case 'relevance':
      default:
        return { qualityScore: -1, createdAt: -1 };
    }
  }

  async getQuerySuggestions(query) {
    if (!query) return [];
    
    try {
      // Simple query suggestions based on similar job titles
      const suggestions = await Job.distinct('title', {
        title: new RegExp(query, 'i'),
        status: 'active'
      }).limit(3);
      
      return suggestions;
    } catch (error) {
      console.error('Query suggestions error:', error);
      return [];
    }
  }
}

export default new SearchService();