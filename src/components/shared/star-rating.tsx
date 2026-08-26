"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  reviewCount?: number;
}

export function StarRating({
  rating,
  size = 14,
  className,
  showValue = false,
  reviewCount,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = !filled && rating >= star - 0.5;
          return (
            <Star
              key={star}
              size={size}
              className={
                filled
                  ? "fill-amber-400 text-amber-400"
                  : half
                  ? "fill-amber-200 text-amber-400"
                  : "fill-muted text-muted-foreground/40"
              }
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-foreground/80">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}
