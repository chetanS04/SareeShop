"use client";

import React, { useState } from 'react';
import { Star, Edit, Trash2, Shield, User as UserIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Review } from '../../../utils/reviewApi';

interface ReviewCardProps {
  review: Review;
  currentUserId?: number;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  onToggleHelpful?: (reviewId: number) => Promise<{ helpful_count: number; is_helpful: boolean }>;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onToggleHelpful
}) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState((review.helpful_count ?? (review as any).helpfulCount) || 0);
  const [helpfulLoading, setHelpfulLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [reported, setReported] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const isOwnReview = currentUserId != null && (
    Number(currentUserId) === Number(review.user_id) ||
    Number(currentUserId) === Number((review as any).userId) ||
    Number(currentUserId) === Number(review.user?.id)
  );

  const handleToggleHelpful = async () => {
    if (!onToggleHelpful || isOwnReview) return;

    setHelpfulLoading(true);
    try {
      const result = await onToggleHelpful(review.id);
      setIsHelpful(result.is_helpful);
      setHelpfulCount(result.helpful_count);
    } catch (error) {
      console.error('Error toggling helpful:', error);
    } finally {
      setHelpfulLoading(false);
    }
  };

  const getReviewImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE || 'https://api.zelton.co.in';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (cleanPath.startsWith('/storage/')) {
      return `${baseUrl}${cleanPath}`;
    }
    return `${baseUrl}/storage/${cleanPath.replace(/^\//, '')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const userName = review.user_name || review.user?.name || (review as any).userName || "Verified Customer";
  const profilePic = review.user?.profile_picture || (review as any).profile_picture;
  const rawDate = review.created_at || (review as any).createdAt;
  const formattedDate = formatDate(rawDate);

  const rating = Math.max(1, Math.min(5, review.rating || 5));
  const reviewTitle = review.title || (review as any).title;
  const reviewText = review.review_text || (review as any).reviewText || "";
  const isVerified = review.is_verified ?? (review as any).isVerified ?? true;
  const images: string[] = review.images || (review as any).images || [];

  const shouldTruncate = reviewText.length > 350;
  const displayText = shouldTruncate && !isExpanded ? `${reviewText.slice(0, 350)}...` : reviewText;

  return (
    <article className="py-6 space-y-3 text-on-surface">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="sv-round w-9 h-9 overflow-hidden bg-surface-ivory border border-border-line flex items-center justify-center flex-shrink-0 text-body-slate">
            {profilePic ? (
              <img
                src={getReviewImageUrl(profilePic)}
                alt={userName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-sm font-semibold text-on-surface truncate">
              {userName}
            </span>
            {isOwnReview && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 label-caps bg-surface-ivory text-primary border border-border-line">
                <Shield className="w-2.5 h-2.5" />
                Your Review
              </span>
            )}
          </div>
        </div>

        {isOwnReview && (
          <div className="flex items-center gap-3 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(review)}
                className="label-caps text-primary hover:text-on-surface inline-flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(review.id)}
                className="label-caps text-primary hover:text-on-surface inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-4 h-4 ${s <= rating
                ? 'fill-accent-ochre text-accent-ochre'
                : 'fill-transparent text-body-slate/35'
                }`}
            />
          ))}
        </div>
        {reviewTitle && (
          <h4 className="font-bold text-sm sm:text-[15px] uppercase tracking-tight text-on-surface leading-snug">
            {reviewTitle}
          </h4>
        )}
      </div>

      {formattedDate && (
        <p className="text-[12px] text-body-slate">
          Reviewed in India on {formattedDate}
        </p>
      )}

      {isVerified && (
        <p className="label-caps text-accent-ochre">Verified Purchase</p>
      )}

      {reviewText && (
        <div className="text-[14px] text-body-slate leading-relaxed">
          <p className="whitespace-pre-line break-words text-on-surface/90">{displayText}</p>
          {shouldTruncate && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="label-caps text-primary hover:text-on-surface mt-2"
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {images && images.length > 0 && (
        <div className="flex items-center gap-2.5 pt-1 flex-wrap">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedPhotoIndex(idx)}
              className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border border-border-line cursor-pointer hover:border-on-surface transition bg-surface-ivory flex-shrink-0"
            >
              <img
                src={getReviewImageUrl(img)}
                alt={`Customer review photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 pt-1">
        {helpfulCount > 0 && (
          <p className="text-[12px] text-body-slate">
            {helpfulCount} {helpfulCount === 1 ? 'person' : 'people'} found this helpful
          </p>
        )}

        <div className="flex items-center gap-3 pt-0.5">
          {!isOwnReview && onToggleHelpful && (
            <button
              type="button"
              onClick={handleToggleHelpful}
              disabled={helpfulLoading}
              className={`px-4 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase border transition disabled:opacity-50 ${isHelpful
                ? 'bg-surface-dark text-surface border-on-surface'
                : 'bg-surface border-on-surface text-on-surface hover:bg-on-surface hover:text-surface'
                }`}
            >
              {helpfulLoading ? '...' : isHelpful ? 'Helpful ✓' : 'Helpful'}
            </button>
          )}

          {!isOwnReview && (
            <>
              <span className="text-border-line">|</span>
              <button
                type="button"
                onClick={() => setReported(true)}
                className="label-caps text-body-slate hover:text-on-surface"
              >
                {reported ? 'Reported' : 'Report'}
              </button>
            </>
          )}
        </div>
      </div>

      {selectedPhotoIndex !== null && images && images.length > 0 && (
        <div
          className="fixed inset-0 z-[99999] bg-surface-dark/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] w-full bg-surface-dark border border-border-line-dark overflow-hidden flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-3 right-3 z-10 text-surface bg-surface-dark/60 hover:bg-primary p-1.5"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedPhotoIndex((prev) =>
                    prev !== null ? (prev > 0 ? prev - 1 : images.length - 1) : 0
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-surface bg-surface-dark/60 hover:bg-primary p-2"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={getReviewImageUrl(images[selectedPhotoIndex])}
              alt="Full view"
              className="max-h-[80vh] max-w-full object-contain"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedPhotoIndex((prev) =>
                    prev !== null ? (prev < images.length - 1 ? prev + 1 : 0) : 0
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-surface bg-surface-dark/60 hover:bg-primary p-2"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default ReviewCard;
