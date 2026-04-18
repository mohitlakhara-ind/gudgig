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



  const marqueeJobs = [
    [
      { title: "E-commerce Website", budget: "₹15,000 - ₹25,000", tag: "Web Dev" },
      { title: "Mobile App UI", budget: "₹12,000 - ₹20,000", tag: "App Dev" },
      { title: "Brand Identity", budget: "₹10,000 - ₹18,000", tag: "Design" },
      { title: "SEO Strategy", budget: "₹8,000 - ₹15,000", tag: "Marketing" },
    ],
    [
      { title: "Product Video", budget: "₹25,000 - ₹40,000", tag: "Video" },
      { title: "Blog Series", budget: "₹5,000 - ₹8,000", tag: "Writing" },
      { title: "Instagram Growth", budget: "₹10,000 - ₹15,000", tag: "Social" },
      { title: "2D Game Assets", budget: "₹20,000 - ₹35,000", tag: "Games" },
    ],
    [
      { title: "React Dashboard", budget: "₹30,000 - ₹50,000", tag: "Web Dev" },
      { title: "Logo Animation", budget: "₹8,000 - ₹15,000", tag: "Video" },
      { title: "Content Calendar", budget: "₹12,000 - ₹20,000", tag: "Social" },
      { title: "UI Components", budget: "₹15,000 - ₹25,000", tag: "Web Dev" },
    ],
  ];

  const stats = [
    { label: "Verified Leads", value: "15,000+" },
    { label: "Active Freelancers", value: "50,000+" },
    { label: "Leads Unlocked", value: "100K+" },
    { label: "Unlock Fee", value: "Minimal" },
  ];

  return (
    <section className="relative bg-hero-gradient pb-12 py-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.10),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsl(var(--secondary)/0.08),transparent_50%)]" />

      <div className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8">
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
              No Bidding — Just Leads
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-4 sm:mb-6">
              <span className="text-foreground">Welcome to</span>
              <br />
              <span className="text-primary">
                Gudgig
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4 lg:px-0">
              Where opportunities meet talent, one lead at a time.
              Browse verified client leads for free, unlock contact details instantly, and connect directly with clients.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 lg:px-0">
              <Link
                href="/gigs"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm sm:text-base"
              >
                Browse Leads
              </Link>
              <Link
                href="/categories"
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
            className="hidden lg:flex flex-1 w-full max-w-md relative"
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
      </div>
    </section>
  );
}