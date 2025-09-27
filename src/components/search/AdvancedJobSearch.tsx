'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Search, MapPin, Filter, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { apiClient, ApiClientError } from '@/lib/api';
import { SearchSuggestionsResponse } from '@/types/api';

interface SearchFilters {
  query: string;
  location: string;
  category: string;
  type: string;
  experience: string;
  salaryMin: number;
  salaryMax: number;
  isRemote: boolean;
  jobLocationType: string;
  eeocCompliant: boolean;
  disabilityAccommodations: boolean;
  veteranFriendly: boolean;
  company: string;
  postedWithin: string;
}

interface AdvancedJobSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onFilterChange?: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  loading?: boolean;
  showFacets?: boolean;
  facets?: any;
}

export const AdvancedJobSearch: React.FC<AdvancedJobSearchProps> = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  loading = false,
  showFacets = true,
  facets
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    category: '',
    type: '',
    experience: '',
    salaryMin: 0,
    salaryMax: 200000,
    isRemote: false,
    jobLocationType: '',
    eeocCompliant: false,
    disabilityAccommodations: false,
    veteranFriendly: false,
    company: '',
    postedWithin: '',
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [locationSuggestionsLoading, setLocationSuggestionsLoading] = useState(false);

  // Debounced search suggestions
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length > 2) {
        setSuggestionsLoading(true);
        try {
          const response: SearchSuggestionsResponse = await apiClient.getSearchSuggestions(query);
          setSuggestions(response.jobs || []);
        } catch (error) {
          console.error('Failed to fetch search suggestions:', error);
          setSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const debouncedLocationSearch = useCallback(
    debounce(async (location: string) => {
      if (location.length > 2) {
        setLocationSuggestionsLoading(true);
        try {
          const response: SearchSuggestionsResponse = await apiClient.getSearchSuggestions(location);
          setLocationSuggestions(response.locations || []);
        } catch (error) {
          console.error('Failed to fetch location suggestions:', error);
          setLocationSuggestions([]);
        } finally {
          setLocationSuggestionsLoading(false);
        }
      } else {
        setLocationSuggestions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(filters.query);
  }, [filters.query, debouncedSearch]);

  useEffect(() => {
    debouncedLocationSearch(filters.location);
  }, [filters.location, debouncedLocationSearch]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      location: '',
      category: '',
      type: '',
      experience: '',
      salaryMin: 0,
      salaryMax: 200000,
      isRemote: false,
      jobLocationType: '',
      eeocCompliant: false,
      disabilityAccommodations: false,
      veteranFriendly: false,
      company: '',
      postedWithin: ''
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.location) count++;
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.experience) count++;
    if (filters.salaryMin > 0 || filters.salaryMax < 200000) count++;
    if (filters.isRemote) count++;
    if (filters.jobLocationType) count++;
    if (filters.eeocCompliant) count++;
    if (filters.disabilityAccommodations) count++;
    if (filters.veteranFriendly) count++;
    if (filters.company) count++;
    if (filters.postedWithin) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Microjob title, keywords, or client"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="pl-10"
                  aria-label="Search microjobs"
                  role="combobox"
                  aria-expanded={suggestions.length > 0}
                  aria-haspopup="listbox"
                />
              </div>
              {(suggestions.length > 0 || suggestionsLoading) && (
                <ul
                  className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  role="listbox"
                >
                  {suggestionsLoading ? (
                    <li className="px-4 py-2 text-gray-500 flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading suggestions...
                    </li>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <li
                        key={suggestion}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleFilterChange('query', suggestion)}
                        role="option"
                        aria-selected={filters.query === suggestion}
                      >
                        {suggestion}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            <div className="flex-1 relative">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Location or 'Remote'"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="pl-10"
                  aria-label="Microjob location"
                />
              </div>
              {(locationSuggestions.length > 0 || locationSuggestionsLoading) && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {locationSuggestionsLoading ? (
                    <li className="px-4 py-2 text-gray-500 flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading locations...
                    </li>
                  ) : (
                    locationSuggestions.map((location) => (
                      <li
                        key={location}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleFilterChange('location', location)}
                      >
                        {location}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            <Button onClick={handleSearch} disabled={loading} className="px-8">
              {loading ? 'Searching...' : 'Search MicroJobs'}
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={filters.isRemote ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('isRemote', !filters.isRemote)}
            >
              Remote MicroJobs
            </Button>
            <Select value={filters.postedWithin} onValueChange={(value) => handleFilterChange('postedWithin', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date posted" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any time</SelectItem>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="3">Last 3 days</SelectItem>
                <SelectItem value="7">Last week</SelectItem>
                <SelectItem value="30">Last month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Advanced Filters
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFiltersCount()}
            </Badge>
          )}
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {getActiveFiltersCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Microjob Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Microjob Category</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Microjob Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Microjob Type</Label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="fresher">Fresher</SelectItem>
                    <SelectItem value="1-2 years">1-2 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="5-10 years">5-10 years</SelectItem>
                    <SelectItem value="10+ years">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range */}
              <div className="space-y-2 md:col-span-2">
                <Label>Salary Range (USD)</Label>
                <div className="px-2">
                  <Slider
                    value={[filters.salaryMin, filters.salaryMax]}
                    onValueChange={([min, max]) => {
                      handleFilterChange('salaryMin', min);
                      handleFilterChange('salaryMax', max);
                    }}
                    max={200000}
                    min={0}
                    step={5000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>${filters.salaryMin.toLocaleString()}</span>
                    <span>${filters.salaryMax.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Work Arrangement */}
              <div className="space-y-2">
                <Label htmlFor="jobLocationType">Work Arrangement</Label>
                <Select value={filters.jobLocationType} onValueChange={(value) => handleFilterChange('jobLocationType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select arrangement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="PHYSICAL_LOCATION">On-site</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                    <SelectItem value="TELECOMMUTE">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Compliance Filters */}
              <div className="space-y-3">
                <Label>Compliance & Diversity</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="eeocCompliant"
                      checked={filters.eeocCompliant}
                      onCheckedChange={(checked) => handleFilterChange('eeocCompliant', checked)}
                    />
                    <label htmlFor="eeocCompliant" className="text-sm">EEOC Compliant</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disabilityAccommodations"
                      checked={filters.disabilityAccommodations}
                      onCheckedChange={(checked) => handleFilterChange('disabilityAccommodations', checked)}
                    />
                    <label htmlFor="disabilityAccommodations" className="text-sm">Disability Accommodations</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="veteranFriendly"
                      checked={filters.veteranFriendly}
                      onCheckedChange={(checked) => handleFilterChange('veteranFriendly', checked)}
                    />
                    <label htmlFor="veteranFriendly" className="text-sm">Veteran Friendly</label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results Summary */}
      {showFacets && facets && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {facets.categories?.slice(0, 5).map((facet: any) => (
                <Button
                  key={facet._id}
                  variant={filters.category === facet._id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('category', facet._id)}
                >
                  {facet._id} ({facet.count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}