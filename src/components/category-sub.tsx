"use client";
import React from 'react'
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";


const CategorySub = () => {
    const categories = [
        { title: "Website Development", icon: "💻", count: "2.5k+" },
    ];
    return (
        < div className="space-y-12" >
            {/* Categories */}
            < motion.div
                initial={{ opacity: 0, y: 20 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center lg:text-left">
                    Browse Leads by Category
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
                                <p className="text-xs text-muted-foreground">{cat.count} leads</p>
                            </Card>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </div >
    )
}

export default CategorySub