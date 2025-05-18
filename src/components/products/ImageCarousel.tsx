
"use client";

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const selectImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">No Image</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg shadow-md group">
        <Image
          src={images[currentIndex]}
          alt={`${altText} - view ${currentIndex + 1}`}
          fill
          style={{objectFit:"cover"}}
          className="transition-transform duration-500 ease-in-out group-hover:scale-105" // Simple zoom on hover
          data-ai-hint={dataAiHint || 'product image'}
          priority={currentIndex === 0} // Prioritize loading the first image
        />
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full text-foreground z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full text-foreground z-10"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </Button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={image + index} // Use image URL + index for a more stable key if images can change
              onClick={() => selectImage(index)}
              className={cn(
                "aspect-square w-full rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                currentIndex === index ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border hover:border-muted-foreground"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${altText} - thumbnail ${index + 1}`}
                width={100}
                height={100}
                style={{objectFit:"cover"}}
                className="w-full h-full"
                data-ai-hint={dataAiHint || 'product thumbnail'}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
