import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewStarsProps {
  rating: number;
  totalReviews?: number;
  size?: number;
  className?: string;
  showReviewCount?: boolean;
}

export function ReviewStars({ rating, totalReviews, size = 5, className, showReviewCount = true }: ReviewStarsProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill="currentColor" className="text-yellow-400" size={size * 4} />
      ))}
      {halfStar && (
        <Star key="half" fill="currentColor" className="text-yellow-400" size={size * 4} style={{ clipPath: 'inset(0 50% 0 0)' }} />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="text-gray-300" size={size * 4} />
      ))}
      {showReviewCount && totalReviews !== undefined && (
        <span className="ml-2 text-sm text-muted-foreground">
          ({totalReviews} review{totalReviews === 1 ? '' : 's'})
        </span>
      )}
    </div>
  );
}
