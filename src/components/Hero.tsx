"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

export default function Hero() {
  // const [isVisible, setIsVisible] = useState(false);

  // useEffect(() => {
  //   const t = setTimeout(() => setIsVisible(true), 100);
  //   return () => clearTimeout(t);
  // }, []);

  const categories = [
    { title: "Website Development", icon: "💻", count: "2.5k+" },
    { title: "Graphic Design", icon: "🎨", count: "1.8k+" },
    { title: "Content Writing", icon: "✍️", count: "3.2k+" },
    { title: "Social Media", icon: "📱", count: "1.5k+" },
    { title: "SEO", icon: "🔍", count: "980+" },
    { title: "App Development", icon: "📲", count: "1.2k+" },
  ];

  const marqueeJobs = [
    [
      { title: "E-commerce Website", budget: "$500-800", tag: "Web Dev" },
      { title: "Brand Logo Design", budget: "$150-300", tag: "Design" },
      { title: "SEO Optimization", budget: "$200-400", tag: "Marketing" },
      { title: "Mobile App UI", budget: "$600-1000", tag: "Design" },
    ],
    [
      { title: "Blog Content Writing", budget: "$50-100", tag: "Writing" },
      { title: "Social Media Strategy", budget: "$300-500", tag: "Marketing" },
      { title: "Landing Page Design", budget: "$250-450", tag: "Web Dev" },
      { title: "Video Editing", budget: "$200-350", tag: "Creative" },
    ],
    [
      { title: "WordPress Setup", budget: "$180-300", tag: "Web Dev" },
      { title: "Product Photography", budget: "$150-250", tag: "Creative" },
      { title: "Email Campaign", budget: "$120-200", tag: "Marketing" },
      { title: "React Component", budget: "$300-500", tag: "Development" },
    ],
  ];

  const stats = [
    { label: "Active Gigs", value: "15,000+" },
    { label: "Freelancers", value: "50,000+" },
    { label: "Projects Done", value: "100K+" },
    { label: "Avg Response", value: "< 2hrs" },
  ];

  return (
    <section className="relative bg-hero-gradient pb-12 py-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.10),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsl(var(--secondary)/0.08),transparent_50%)]" />

      <div className="relative container mx-auto pl-6 pr-0 lg:pl-12 lg:pr-0">
        {/* TOP SECTION - Hero Content + Marquees */}
        <div className="flex flex-col lg:flex-row items-center gap-12  mb-20">
          {/* LEFT - Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left max-w-2xl pt-8"
          >
            <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              Where Talent Meets Opportunity
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-4 sm:mb-6">
              <span className="text-foreground">Welcome to</span>
              <br />
              <span className="text-primary">
                Gigs Mint
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4 lg:px-0">
              Discover meaningful micro-jobs and connect with talented freelancers. 
              Start browsing for free, upgrade when you&apos;re ready to mint your success.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 lg:px-0">
              <Link
                href="/gigs"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm sm:text-base"
              >
                Browse Gigs
              </Link>
              <Link
                href="/gigs"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-input bg-background text-foreground font-semibold hover:border-primary hover:shadow-lg transition-all text-sm sm:text-base"
              >
                View Categories
              </Link>
            </div>
          </motion.div>

          {/* RIGHT - Vertical Scrolling Marquees */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-md relative"
          >
            <div className="overlay absolute inset-0 bg-overlay-fade-b h-[520px] z-10"></div>
            <div className="flex gap-2 h-[520px]">
              {marqueeJobs.map((jobs, idx) => (
                <div key={idx} className="flex-1 overflow-hidden ">
                  <motion.div
                    animate={{ y: [0, -1000] }}
                    transition={{
                      duration: 15 + idx * 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex flex-col gap-4"
                  >
                    {[...jobs, ...jobs, ...jobs, ...jobs].map((job, i) => (
                      <Card
                        key={i}
                        className="p-4 bg-card border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground text-sm">
                            {job.title}
                          </h3>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                            {job.tag}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{job.budget}</p>
                      </Card>
                    ))}
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* BOTTOM SECTION - Stats + Categories */}
        <div className="space-y-12">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <Card
                key={i}
                className="p-6 text-center bg-card border border-border hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </Card>
            ))}
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center lg:text-left">
              Explore Popular Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
              {categories.map((cat, i) => (
                <Link href={`/gigs?category=${cat.title.toLowerCase().replace(' ', '-')}`} key={i} className="h-full">
                  <Card className="h-full p-5 text-center bg-card border border-border hover:border-primary hover:shadow-lg hover:scale-105 transition-all cursor-pointer group flex flex-col justify-between">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{cat.count} gigs</p>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}