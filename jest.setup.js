import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock api client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getJobSeekerStats: jest.fn().mockResolvedValue({ success: true, data: {} }),
    getApplications: jest.fn().mockResolvedValue({ success: true, data: [] }),
    getJobs: jest.fn().mockResolvedValue({ success: true, data: [] }),
    createApplication: jest.fn().mockResolvedValue({ success: true, data: {} }),
  },
}));