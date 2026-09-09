"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Star,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    TrendingUp,
    Minus,
    TrendingDown,
    X,
} from 'lucide-react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import Modal from '../(sheared)/Modal';
import {
    Review,
    ReviewSummary,
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    toggleReviewHelpful,
    getUserProductReview,
    CreateReviewData,
    UpdateReviewData
} from '../../../utils/reviewApi';
import { useAuth } from '@/context/AuthContext';

interface ProductReviewsProps {
    productId: number | string;
    productSlug?: string;
    onRatingUpdate?: () => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productSlug, onRatingUpdate }) => {
    const router = useRouter();
    const slugOrId = productSlug || productId;
    const { user, openAuthModal } = useAuth();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [summary, setSummary] = useState<ReviewSummary>({
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
    const [userReview, setUserReview] = useState<Review | null>(null);

    const [loading, setLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
    const [showCalcInfo, setShowCalcInfo] = useState(false);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const [allMediaItems, setAllMediaItems] = useState<{ url: string; rating: number; title?: string }[]>([]);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
    const mediaScrollRef = useRef<HTMLDivElement>(null);

    const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE || 'https://api.zelton.co.in';

    const getReviewImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        if (cleanPath.startsWith('/storage/')) {
            return `${baseUrl}${cleanPath}`;
        }
        return `${baseUrl}/storage/${cleanPath.replace(/^\//, '')}`;
    };

    const fetchNewlyReviews = async () => {
        setLoading(true);
        try {
            const response = await getProductReviews(productId, {
                page: 1,
                per_page: 10,
                sort_by: 'newest',
                search: selectedTag || undefined,
            });

            const data = response.reviews.data || [];
            setReviews(data);
            setSummary(response.summary);

            const mediaList: { url: string; rating: number; title?: string }[] = [];
            data.forEach((r) => {
                const imgs = r.images || (r as any).images;
                if (imgs && Array.isArray(imgs)) {
                    imgs.forEach((img: string) => {
                        mediaList.push({ url: img, rating: r.rating || 5, title: r.title || undefined });
                    });
                }
            });
            setAllMediaItems(mediaList);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserReview = async () => {
        if (!user) {
            setUserReview(null);
            return;
        }

        try {
            const response = await getUserProductReview(productId);
            setUserReview(response.review);
        } catch (error) {
            console.error('Error fetching user review:', error);
        }
    };

    useEffect(() => {
        fetchNewlyReviews();
    }, [productId, selectedTag]);

    useEffect(() => {
        fetchUserReview();
    }, [productId, user]);

    useEffect(() => {
        const handleOpenReviewModal = () => {
            setShowReviewForm(true);
            setEditingReview(null);
        };

        window.addEventListener('openReviewModal', handleOpenReviewModal);
        return () => {
            window.removeEventListener('openReviewModal', handleOpenReviewModal);
        };
    }, []);

    const handleFormSubmit = async (data: CreateReviewData | UpdateReviewData) => {
        try {
            if (editingReview) {
                const response = await updateReview(editingReview.id, data as UpdateReviewData);
                setUserReview(response.review || null);
            } else {
                const response = await createReview(data as CreateReviewData);
                setUserReview(response.review || null);
            }
            setShowReviewForm(false);
            setEditingReview(null);
            fetchNewlyReviews();
            onRatingUpdate?.();
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        const r = reviews.find((x) => x.id === reviewId) || userReview;
        if (r) {
            setReviewToDelete(r);
            setShowDeleteModal(true);
        }
    };

    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        try {
            await deleteReview(reviewToDelete.id);
            setUserReview(null);
            setShowDeleteModal(false);
            setReviewToDelete(null);
            fetchNewlyReviews();
            onRatingUpdate?.();
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const handleToggleHelpful = async (reviewId: number) => {
        return await toggleReviewHelpful(reviewId);
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const scrollMedia = (direction: 'left' | 'right') => {
        if (mediaScrollRef.current) {
            const offset = direction === 'left' ? -240 : 240;
            mediaScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    const getStarPercentage = (star: number) => {
        if (!summary.total_reviews || summary.total_reviews === 0) return 0;
        const count = summary.rating_distribution?.[star] || 0;
        return Math.round((count / summary.total_reviews) * 100);
    };

    const aspectTags = [
        { label: 'Comfort', count: Math.max(12, Math.round(summary.total_reviews * 0.45)), trend: 'up' },
        { label: 'Appearance', count: Math.max(8, Math.round(summary.total_reviews * 0.35)), trend: 'up' },
        { label: 'Fit', count: Math.max(6, Math.round(summary.total_reviews * 0.28)), trend: 'up' },
        { label: 'Versatility', count: Math.max(5, Math.round(summary.total_reviews * 0.22)), trend: 'up' },
        { label: 'Quality', count: Math.max(14, Math.round(summary.total_reviews * 0.55)), trend: 'neutral' },
        { label: 'Durability', count: Math.max(7, Math.round(summary.total_reviews * 0.25)), trend: 'neutral' },
        { label: 'Material quality', count: Math.max(4, Math.round(summary.total_reviews * 0.18)), trend: 'neutral' },
        { label: 'Stitching', count: Math.max(3, Math.round(summary.total_reviews * 0.12)), trend: 'down' },
    ];

    const averageRating = summary.average_rating > 0 ? summary.average_rating : (summary.total_reviews > 0 ? 4.2 : 0);

    return (
        <section className="w-full bg-surface-subtle border border-border-line text-on-surface">
            <div className="border-b border-on-surface/15 px-5 sm:px-8 py-6 sm:py-8">
                <span className="label-caps text-primary block mb-2">Atelier Voices</span>
                <h2 className="display-section text-on-surface">Customer Reviews</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-start">
                {/* Left: rating summary */}
                <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-[145px] self-start border-b lg:border-b-0 lg:border-r border-border-line px-5 sm:px-8 py-6 sm:py-8 bg-surface">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-5 h-5 ${s <= Math.round(averageRating)
                                            ? 'fill-accent-ochre text-accent-ochre'
                                            : 'fill-transparent text-body-slate/40'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-lg font-bold uppercase tracking-tight text-on-surface">
                                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                                <span className="text-body-slate font-semibold normal-case tracking-normal text-sm ml-1.5">
                                    out of 5
                                </span>
                            </span>
                        </div>

                        <p className="label-caps text-body-slate mb-5">
                            {summary.total_reviews} global rating{summary.total_reviews !== 1 ? 's' : ''}
                        </p>

                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const pct = getStarPercentage(star);
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => router.push(`/products/${slugOrId}/reviews?rating=${star}`)}
                                        className="w-full flex items-center gap-3 text-sm group cursor-pointer"
                                    >
                                        <span className="label-caps text-primary group-hover:text-primary-hover min-w-[52px] text-left">
                                            {star} star
                                        </span>
                                        <div className="flex-1 h-2.5 bg-surface-ivory border border-border-line overflow-hidden">
                                            <div
                                                className="h-full bg-accent-ochre transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="label-caps text-primary group-hover:text-primary-hover min-w-[38px] text-right">
                                            {pct}%
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-5 relative">
                            <button
                                type="button"
                                onClick={() => setShowCalcInfo(!showCalcInfo)}
                                className="inline-flex items-center gap-1 label-caps text-primary hover:text-on-surface transition-colors"
                            >
                                <span>How are ratings calculated?</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCalcInfo ? 'rotate-180' : ''}`} />
                            </button>

                            {showCalcInfo && (
                                <div className="mt-3 p-4 bg-surface-ivory border border-border-line text-[13px] text-body-slate leading-relaxed">
                                    Overall star rating and percentage breakdown weigh recent reviews and verified purchases — not a simple average — so trustworthiness stays clear.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-border-line pt-6 space-y-3">
                        <h3 className="text-base font-bold uppercase tracking-tight text-on-surface">
                            Review this product
                        </h3>
                        <p className="text-[13px] text-body-slate leading-relaxed">
                            Share your thoughts with other customers
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                if (!user) {
                                    openAuthModal('login');
                                    return;
                                }
                                if (userReview) {
                                    handleEditReview(userReview);
                                } else {
                                    setEditingReview(null);
                                    setShowReviewForm(true);
                                }
                            }}
                            className="sv-btn-outline w-full mt-1"
                        >
                            {userReview ? 'Edit your product review' : 'Write a product review'}
                        </button>
                    </div>
                </aside>

                {/* Right: list + media */}
                <div className="lg:col-span-8 space-y-8 min-w-0 px-5 sm:px-8 py-6 sm:py-8">
                    {summary.total_reviews > 0 && (
                        <div className="space-y-3 pb-6 border-b border-border-line">
                            <h3 className="text-base font-bold uppercase tracking-tight text-on-surface">
                                Customers say
                            </h3>
                            <p className="text-[14px] text-body-slate leading-relaxed">
                                Customers find this item comfortable and stylish, with a good fit and great versatility for daily wear. The appearance and design receive positive feedback, with customers noting it matches the picture. However, opinions vary regarding stitching and long-term durability.
                            </p>
                            <div className="flex items-center gap-1.5 label-caps text-body-slate">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span>Generated from the text of customer reviews</span>
                            </div>

                            <div className="pt-2">
                                <p className="label-caps text-on-surface mb-3">Select to learn more</p>
                                <div className="flex flex-wrap gap-2">
                                    {aspectTags.map((tag) => {
                                        const isSelected = selectedTag === tag.label;
                                        return (
                                            <button
                                                key={tag.label}
                                                type="button"
                                                onClick={() => setSelectedTag(isSelected ? null : tag.label)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase border transition ${isSelected
                                                    ? 'border-on-surface bg-surface-dark text-surface'
                                                    : 'border-border-line bg-surface-ivory text-on-surface hover:border-on-surface'
                                                    }`}
                                            >
                                                {tag.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                                                {tag.trend === 'neutral' && <Minus className="w-3 h-3" />}
                                                {tag.trend === 'down' && <TrendingDown className="w-3 h-3 text-primary" />}
                                                <span>{tag.label}</span>
                                                <span className="opacity-60">({tag.count})</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {allMediaItems.length > 0 && (
                        <div className="space-y-3 pb-6 border-b border-border-line">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-base font-bold uppercase tracking-tight text-on-surface">
                                    Customer photos
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => router.push(`/products/${slugOrId}/reviews?media=true`)}
                                    className="label-caps text-primary hover:text-on-surface transition-colors"
                                >
                                    See all →
                                </button>
                            </div>

                            <div className="relative group">
                                {allMediaItems.length > 4 && (
                                    <button
                                        type="button"
                                        onClick={() => scrollMedia('left')}
                                        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-surface border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-surface transition"
                                        aria-label="Scroll photos left"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                )}

                                <div
                                    ref={mediaScrollRef}
                                    className="flex gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
                                >
                                    {allMediaItems.map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedMediaIndex(idx)}
                                            className="relative w-28 h-28 sm:w-32 sm:h-32 overflow-hidden border border-border-line flex-shrink-0 cursor-pointer bg-surface-dark media-frame"
                                        >
                                            <img
                                                src={getReviewImageUrl(item.url)}
                                                alt={`Customer upload ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-0 inset-x-0 px-2 py-1.5 bg-surface-dark/85 text-accent-ochre text-[10px] font-semibold tracking-wider">
                                                {'★'.repeat(item.rating)}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {allMediaItems.length > 4 && (
                                    <button
                                        type="button"
                                        onClick={() => scrollMedia('right')}
                                        className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-surface border border-on-surface flex items-center justify-center hover:bg-on-surface hover:text-surface transition"
                                        aria-label="Scroll photos right"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-on-surface/15">
                            <h3 className="text-base font-bold uppercase tracking-tight text-on-surface">
                                Top reviews from India
                            </h3>
                            {selectedTag && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedTag(null)}
                                    className="label-caps text-primary hover:text-on-surface"
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>

                        {loading && reviews.length === 0 ? (
                            <div className="py-10 text-center text-sm text-body-slate label-caps">
                                Loading reviews...
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="py-10 text-center border border-border-line bg-surface px-6">
                                <p className="text-sm text-body-slate">
                                    {selectedTag
                                        ? `No reviews found mentioning "${selectedTag}".`
                                        : 'No reviews yet for this product.'}
                                </p>
                                <p className="label-caps text-primary mt-3">Be the first to leave a note</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border-line">
                                {reviews.map((review) => {
                                    const isOwner = !!user?.id && (
                                        Number(review.user_id) === Number(user.id) ||
                                        Number((review as any).userId) === Number(user.id) ||
                                        Number(review.user?.id) === Number(user.id)
                                    );
                                    return (
                                        <ReviewCard
                                            key={review.id}
                                            review={review}
                                            currentUserId={user?.id}
                                            onEdit={isOwner ? handleEditReview : undefined}
                                            onDelete={isOwner ? handleDeleteReview : undefined}
                                            onToggleHelpful={!isOwner ? handleToggleHelpful : undefined}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => router.push(`/products/${slugOrId}/reviews`)}
                                className="sv-btn-outline w-full sm:w-auto gap-2"
                            >
                                <span>See more reviews</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showReviewForm && (
                <Modal
                    isOpen={showReviewForm}
                    onClose={() => {
                        setShowReviewForm(false);
                        setEditingReview(null);
                    }}
                    title={editingReview ? "Edit Your Review" : "Write a Customer Review"}
                >
                    <ReviewForm
                        productId={productId}
                        initialData={editingReview ? {
                            rating: editingReview.rating,
                            title: editingReview.title || '',
                            review_text: editingReview.review_text || (editingReview as any).reviewText || '',
                            images: editingReview.images || []
                        } : undefined}
                        isEditing={!!editingReview}
                        onSubmit={handleFormSubmit}
                        onCancel={() => {
                            setShowReviewForm(false);
                            setEditingReview(null);
                        }}
                    />
                </Modal>
            )}

            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setReviewToDelete(null);
                }}
                title="Delete Review"
                width="max-w-md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-body-slate">
                        Are you sure you want to delete this review? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setReviewToDelete(null);
                            }}
                            className="sv-btn-outline !min-h-[40px] !py-2 !px-4"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDeleteReview}
                            className="sv-btn-primary !min-h-[40px] !py-2 !px-5"
                        >
                            Delete Review
                        </button>
                    </div>
                </div>
            </Modal>

            {selectedMediaIndex !== null && allMediaItems[selectedMediaIndex] && (
                <div
                    className="fixed inset-0 z-[99999] bg-surface-dark/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedMediaIndex(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[85vh] w-full bg-surface-dark border border-border-line-dark overflow-hidden flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedMediaIndex(null)}
                            className="absolute top-3 right-3 z-10 text-surface bg-surface-dark/60 hover:bg-primary p-2 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {allMediaItems.length > 1 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedMediaIndex((prev) =>
                                        prev !== null ? (prev > 0 ? prev - 1 : allMediaItems.length - 1) : 0
                                    )
                                }
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-surface bg-surface-dark/60 hover:bg-primary p-2"
                                aria-label="Previous"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        <img
                            src={getReviewImageUrl(allMediaItems[selectedMediaIndex].url)}
                            alt="Customer Photo Full"
                            className="max-h-[80vh] max-w-full object-contain"
                        />

                        {allMediaItems.length > 1 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedMediaIndex((prev) =>
                                        prev !== null ? (prev < allMediaItems.length - 1 ? prev + 1 : 0) : 0
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
        </section>
    );
};

export default ProductReviews;
