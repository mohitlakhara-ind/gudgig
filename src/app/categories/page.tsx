'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Star, 
  ArrowRight,
  Code,
  Palette,
  PenTool,
  Share2,
  Search as SearchIcon,
  Smartphone,
  Video,
  Camera,
  Database,
  Headphones,
  Zap,
  Globe,
  BarChart3,
  Briefcase,
  Heart,
  Clock,
  Award
} from 'lucide-react';

interface CategoryData {
  name: string;
  slug: string;
  icon: any;
  description: string;
  gigCount: number;
  avgPrice: string;
  trending: boolean;
  featured: boolean;
  color: string;
}

const CATEGORY_DATA: CategoryData[] = [
  {
    name: 'Website Development',
    slug: 'website-development',
    icon: Code,
    description: 'Build responsive websites and web applications',
    gigCount: 245,
    avgPrice: '$500-2000',
    trending: true,
    featured: true,
    color: 'bg-blue-500'
  },
  {
    name: 'Graphic Design',
    slug: 'graphic-design',
    icon: Palette,
    description: 'Create stunning visuals and brand identities',
    gigCount: 189,
    avgPrice: '$200-800',
    trending: true,
    featured: true,
    color: 'bg-purple-500'
  },
  {
    name: 'Content Writing',
    slug: 'content-writing',
    icon: PenTool,
    description: 'Engaging copy and content for all platforms',
    gigCount: 156,
    avgPrice: '$100-500',
    trending: false,
    featured: true,
    color: 'bg-green-500'
  },
  {
    name: 'Social Media',
    slug: 'social-media',
    icon: Share2,
    description: 'Manage and grow your social media presence',
    gigCount: 134,
    avgPrice: '$300-1000',
    trending: true,
    featured: false,
    color: 'bg-pink-500'
  },
  {
    name: 'SEO',
    slug: 'seo',
    icon: SearchIcon,
    description: 'Optimize your website for search engines',
    gigCount: 98,
    avgPrice: '$400-1500',
    trending: false,
    featured: false,
    color: 'bg-orange-500'
  },
  {
    name: 'App Development',
    slug: 'app-development',
    icon: Smartphone,
    description: 'Native and cross-platform mobile apps',
    gigCount: 167,
    avgPrice: '$1000-5000',
    trending: true,
    featured: true,
    color: 'bg-indigo-500'
  },
  {
    name: 'Video Editing',
    slug: 'video-editing',
    icon: Video,
    description: 'Professional video production and editing',
    gigCount: 89,
    avgPrice: '$300-1200',
    trending: false,
    featured: false,
    color: 'bg-red-500'
  },
  {
    name: 'Photography',
    slug: 'photography',
    icon: Camera,
    description: 'Professional photography and photo editing',
    gigCount: 76,
    avgPrice: '$200-800',
    trending: false,
    featured: false,
    color: 'bg-teal-500'
  },
  {
    name: 'Data Entry',
    slug: 'data-entry',
    icon: Database,
    description: 'Accurate and efficient data processing',
    gigCount: 112,
    avgPrice: '$50-300',
    trending: false,
    featured: false,
    color: 'bg-gray-500'
  },
  {
    name: 'Virtual Assistant',
    slug: 'virtual-assistant',
    icon: Headphones,
    description: 'Administrative support and task management',
    gigCount: 145,
    avgPrice: '$200-600',
    trending: true,
    featured: false,
    color: 'bg-yellow-500'
  },
  {
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    icon: BarChart3,
    description: 'Comprehensive online marketing strategies',
    gigCount: 123,
    avgPrice: '$500-2000',
    trending: true,
    featured: true,
    color: 'bg-emerald-500'
  },
  {
    name: 'Business Consulting',
    slug: 'business-consulting',
    icon: Briefcase,
    description: 'Strategic business advice and planning',
    gigCount: 67,
    avgPrice: '$800-3000',
    trending: false,
    featured: false,
    color: 'bg-slate-500'
  }
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredCategories, setFeaturedCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = useMemo(() => CATEGORY_DATA, []);

  useEffect(() => {
    // Simulate API call for featured categories
    const timer = setTimeout(() => {
      setFeaturedCategories(categories.filter(cat => cat.featured));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const trendingCategories = useMemo(() => 
    categories.filter(cat => cat.trending), 
    [categories]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="h-12 bg-muted rounded-lg mb-4 animate-pulse"></div>
                <div className="h-6 bg-muted rounded-lg mb-8 animate-pulse max-w-2xl mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Explore Categories
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover freelance opportunities across diverse categories. Find the perfect gig that matches your skills and interests.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{categories.length} Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>{trendingCategories.length} Trending</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span>{featuredCategories.length} Featured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {featuredCategories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Star className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Featured Categories</h2>
                <Badge variant="secondary" className="ml-auto">
                  {featuredCategories.length} categories
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {featuredCategories.map((category) => {
                  const IconComponent = category.icon;
                return (
                    <Link key={category.slug} href={`/gigs?category=${category.slug}`}>
                      <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-xl ${category.color} text-white mb-3`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {category.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-4 overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                            {category.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              <span>{category.gigCount} gigs</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{category.avgPrice}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            Explore Gigs
                            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending Categories */}
      {trendingCategories.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
                <Badge variant="default" className="ml-auto">
                  Hot
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                {trendingCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link key={category.slug} href={`/gigs?category=${category.slug}`}>
                      <Badge 
                        variant="outline" 
                        className="px-4 py-2 h-auto hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer group"
                      >
                        <IconComponent className="h-3 w-3 mr-2" />
                        {category.name}
                        <TrendingUp className="h-3 w-3 ml-2 text-orange-500" />
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">All Categories</h2>
              <Badge variant="secondary">
                {filteredCategories.length} categories
              </Badge>
            </div>
            
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No categories found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link key={category.slug} href={`/gigs?category=${category.slug}`}>
                      <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-2.5 rounded-lg ${category.color} text-white`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex gap-1">
                              {category.trending && (
                                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                  <TrendingUp className="h-2 w-2 mr-1" />
                                  Hot
                                </Badge>
                              )}
                              {category.featured && (
                                <Badge variant="default" className="text-xs px-2 py-0.5">
                                  <Star className="h-2 w-2 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical'}}>
                            {category.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3 overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                            {category.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              <span>{category.gigCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{category.avgPrice}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            View Gigs
                            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}



