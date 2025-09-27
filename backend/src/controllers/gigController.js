import {
  getJobs as getGigs,
  getJob as getGig,
  createJob as createGig,
  updateJob as updateGig,
  deleteJob as deleteGig,
  getJobsByEmployer,
  getJobStats as getGigStats
} from './jobController.js';

// Gig-specific helpers
const GIG_TYPES = ['micro-task', 'short-project', 'hourly', 'fixed-price', 'freelance'];

// Wrapper to support seller terminology while reusing job controller logic
export const getGigsBySeller = (req, res, next) => {
  // Map sellerId -> employerId expected by underlying controller
  if (req.params && req.params.sellerId) {
    req.params.employerId = req.params.sellerId;
  }
  return getJobsByEmployer(req, res, next);
};

export { getGigs, getGig, createGig, updateGig, deleteGig, getGigStats };

// Note: Validation and any gig-specific request shaping should be handled in the route layer
// to keep these wrappers thin and maintainable.


