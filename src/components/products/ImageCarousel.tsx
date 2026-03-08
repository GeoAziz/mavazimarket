
"use client";

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCarouselProps {
  images: string[];
  altText: string;
  dataAiHint?: string;
}

export function ImageCarousel({ images, altText, dataAiHint }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full bg-secondary/5 rounded-2xl flex items-center justify-center text-muted-foreground border-2 border-dashed border-primary/10">
        <p className="font-heading text-xl opacity-20">Visual Pending</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-2xl bg-secondary/5 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={`${altText} - view ${currentIndex + 1}`}
              fill
              style={{ objectFit: "cover" }}
              className="group-hover:scale-105 transition-transform duration-700 ease-out"
              data-ai-hint={dataAiHint || 'heritage design'}
              priority
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white cursor-pointer hover:bg-primary transition-colors">
          <Maximize2 size={18} />
        </div>

        {images.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              onClick={goToPrevious}
              className="bg-white/90 hover:bg-primary hover:text-white rounded-full h-12 w-12 shadow-xl"
            >
              <ChevronLeft size={24} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={goToNext}
              className="bg-white/90 hover:bg-primary hover:text-white rounded-full h-12 w-12 shadow-xl"
            >
              <ChevronRight size={24} />
            </Button>
          </div>
        )}
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentIndex === i ? "w-8 bg-primary" : "w-2 bg-white/50"
              )} 
            />
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all group",
                currentIndex === index ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/50"
              )}
            >
              <Image
                src={image}
                alt={`${altText} thumbnail ${index + 1}`}
                fill
                className={cn(
                  "object-cover transition-opacity",
                  currentIndex === index ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
