"use client";

import { GigsListing } from '@/components/gigs';

export default function JobsListing(props: any) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[deprecation] components/jobs/JobsListing has moved. Use components/gigs/GigsListing instead.');
  }
  return <GigsListing {...props} />;
}


