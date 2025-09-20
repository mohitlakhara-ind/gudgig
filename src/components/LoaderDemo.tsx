'use client';

import { Loader } from "@/components/ui/loader";
import {
  Skeleton,
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton
} from "@/components/ui/skeleton";

export default function LoaderDemo() {
  return (
    <div className="p-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Loader Components</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Spinner Loaders */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Spinner</h3>
            <div className="flex flex-col space-y-2">
              <Loader variant="spinner" size="sm" color="primary" />
              <Loader variant="spinner" size="default" color="secondary" />
              <Loader variant="spinner" size="lg" color="accent" />
            </div>
          </div>

          {/* Dots Loaders */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Dots</h3>
            <div className="flex flex-col space-y-2">
              <Loader variant="dots" size="sm" color="primary" />
              <Loader variant="dots" size="default" color="secondary" />
              <Loader variant="dots" size="lg" color="accent" />
            </div>
          </div>

          {/* Pulse Loaders */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Pulse</h3>
            <div className="flex flex-col space-y-2">
              <Loader variant="pulse" size="sm" color="primary" />
              <Loader variant="pulse" size="default" color="secondary" />
              <Loader variant="pulse" size="lg" color="accent" />
            </div>
          </div>

          {/* Ring Loaders */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Ring</h3>
            <div className="flex flex-col space-y-2">
              <Loader variant="ring" size="sm" color="primary" />
              <Loader variant="ring" size="default" color="secondary" />
              <Loader variant="ring" size="lg" color="accent" />
            </div>
          </div>

          {/* Bars Loaders */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Bars</h3>
            <div className="flex flex-col space-y-2">
              <Loader variant="bars" size="sm" color="primary" />
              <Loader variant="bars" size="default" color="secondary" />
              <Loader variant="bars" size="lg" color="accent" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Skeleton Components</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Skeleton Card */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Card Skeleton</h3>
            <SkeletonCard />
          </div>

          {/* Skeleton Text */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Text Skeleton</h3>
            <SkeletonText lines={4} />
          </div>

          {/* Skeleton Avatar */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Avatar Skeleton</h3>
            <div className="flex space-x-4">
              <SkeletonAvatar size="sm" />
              <SkeletonAvatar size="default" />
              <SkeletonAvatar size="lg" />
              <SkeletonAvatar size="xl" />
            </div>
          </div>

          {/* Skeleton Button */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Button Skeleton</h3>
            <div className="flex space-x-4">
              <SkeletonButton />
              <Skeleton variant="button" size="lg" className="w-32" />
            </div>
          </div>

          {/* Mixed Skeletons */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Mixed Skeletons</h3>
            <div className="space-y-3">
              <Skeleton variant="avatar" size="lg" className="h-8 w-8" />
              <Skeleton variant="text" size="sm" className="w-3/4" />
              <Skeleton variant="text" size="default" className="w-full" />
              <Skeleton variant="text" size="default" className="w-2/3" />
            </div>
          </div>

          {/* Size Variants */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Size Variants</h3>
            <div className="space-y-2">
              <Skeleton size="sm" className="w-full" />
              <Skeleton size="default" className="w-full" />
              <Skeleton size="lg" className="w-full" />
              <Skeleton size="xl" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
