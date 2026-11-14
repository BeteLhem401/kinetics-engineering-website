import React from 'react';
import { testimonialsData } from '@/data/testimonials';
import TestimonialsClient from './TestimonialsClient';

export default function Testimonials() {
  const isDev = process.env.NODE_ENV !== 'production';

  const visibleItems = (testimonialsData.items || []).filter(
    (item) => isDev || !item.sample
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return <TestimonialsClient items={visibleItems} />;
}

