"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="w-full max-w-[1000px] mx-auto px-6 py-12">
      <div className="space-y-10">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-28 h-28 rounded-full bg-border/20 relative overflow-hidden shrink-0">
             <motion.div
               className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
               animate={{ translateX: ['100%'] }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
             />
          </div>
          <div className="space-y-4 flex-1 pt-2">
            <div className="h-8 w-64 bg-border/20 rounded-md relative overflow-hidden">
               <motion.div
                 className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                 animate={{ translateX: ['100%'] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               />
            </div>
            <div className="h-4 w-32 bg-border/20 rounded-md relative overflow-hidden" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-24 bg-border/20 rounded-full" />
              <div className="h-6 w-32 bg-border/20 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column Skeletons */}
          <div className="space-y-6">
            <div className="h-[200px] rounded-2xl bg-border/10 border border-border/20 relative overflow-hidden">
               <motion.div
                 className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                 animate={{ translateX: ['100%'] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               />
            </div>
            <div className="h-[180px] rounded-2xl bg-border/10 border border-border/20 relative overflow-hidden">
               <motion.div
                 className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                 animate={{ translateX: ['100%'] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               />
            </div>
          </div>

          {/* Right Column Skeletons */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[400px] rounded-2xl bg-border/10 border border-border/20 relative overflow-hidden">
               <motion.div
                 className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                 animate={{ translateX: ['100%'] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
