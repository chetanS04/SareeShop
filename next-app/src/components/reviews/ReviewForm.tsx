import React, { useState } from 'react';
import { Send, Image as ImageIcon, Trash2, Star, Loader2 } from 'lucide-react';
import { CreateReviewData, UpdateReviewData } from '../../../utils/reviewApi';
import Image from 'next/image';

interface ReviewFormProps {
    productId: number | string;
    initialData?: {
        rating: number;
        title: string;
        review_text: string;
        images?: string[];
    };
    isEditing?: boolean;
    onSubmit: (data: CreateReviewData | UpdateReviewData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
    productId,
    initialData,
    isEditing = false,
    onSubmit,
    onCancel,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        rating: initialData?.rating || 0,
        title: initialData?.title || '',
        review_text: initialData?.review_text || (initialData as any)?.reviewText || ''
    });
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const MAX_IMAGES = 5;

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                rating: initialData.rating || 0,
                title: initialData.title || '',
                review_text: initialData.review_text || (initialData as any).reviewText || ''
            });
            setExistingImages(initialData.images || []);
        }
    }, [initialData]);

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


    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const currentCount = existingImages.length + selectedImages.length;
        const remainingSlots = MAX_IMAGES - currentCount;

        if (remainingSlots <= 0) {
            setErrors(prev => ({ ...prev, images: `You can only upload up to ${MAX_IMAGES} images.` }));
            e.target.value = '';
            return;
        }

        let filesToAdd = files;
        if (files.length > remainingSlots) {
            setErrors(prev => ({ ...prev, images: `Maximum ${MAX_IMAGES} images allowed. Only the first ${remainingSlots} images were added.` }));
            filesToAdd = files.slice(0, remainingSlots);
        } else {
            setErrors(prev => ({ ...prev, images: '' }));
        }

        // Validate file sizes (max 5MB each)
        const oversizedFiles = filesToAdd.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            setErrors(prev => ({ ...prev, images: 'Each image must be less than 5MB' }));
            e.target.value = '';
            return;
        }

        setSelectedImages(prev => [...prev, ...filesToAdd]);

        // Create preview URLs
        filesToAdd.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrls(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });

        e.target.value = '';
    };

    const removeSelectedImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imagePath: string) => {
        setExistingImages(prev => prev.filter(img => img !== imagePath));
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (formData.rating === 0) {
            newErrors.rating = 'Please select a rating';
        }

        if (formData.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        if (formData.review_text.trim().length < 10) {
            newErrors.review_text = 'Review must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const submitData = isEditing
                ? {
                    ...formData,
                    images: selectedImages,
                    existing_images: existingImages
                }
                : {
                    ...formData,
                    product_id: productId,
                    images: selectedImages
                };

            await onSubmit(submitData);
            // Close the form after successful submission
            onCancel();
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const handleRatingChange = (rating: number) => {
        setFormData(prev => ({ ...prev, rating }));
        if (errors.rating) {
            setErrors(prev => ({ ...prev, rating: '' }));
        }
    };

    const fieldBase = 'w-full border bg-pure-white px-3 py-2.5 text-sm text-on-surface placeholder:text-body-slate/55 focus:border-primary focus:outline-none transition-colors';

    return (
        <div className="bg-pure-white text-on-surface">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Section */}
                <div>
                    <label className="block label-caps text-body-slate mb-2">
                        Your Rating <span className="text-primary">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleRatingChange(s)}
                                    aria-label={`Rate ${s} star${s !== 1 ? 's' : ''}`}
                                    aria-pressed={formData.rating === s}
                                    className="p-0.5 transition-colors cursor-pointer"
                                >
                                    <Star
                                        className={`w-6 h-6 ${s <= formData.rating
                                            ? 'fill-accent-ochre text-accent-ochre'
                                            : 'fill-transparent text-body-slate/35'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="label-caps text-body-slate">
                            {formData.rating > 0 && `${formData.rating} star${formData.rating !== 1 ? 's' : ''}`}
                        </span>
                    </div>
                    {errors.rating && (
                        <p className="mt-2 text-[12px] text-primary">{errors.rating}</p>
                    )}
                </div>

                {/* Title Section */}
                <div>
                    <label htmlFor="title" className="block label-caps text-body-slate mb-2">
                        Review Title <span className="text-primary">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, title: e.target.value }));
                            if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                        }}
                        placeholder="Sum up your review"
                        className={`${fieldBase} ${errors.title ? 'border-primary' : 'border-border-line'}`}
                        maxLength={100}
                    />
                    <div className="flex justify-between gap-3 mt-1.5">
                        {errors.title ? (
                            <p className="text-[12px] text-primary">{errors.title}</p>
                        ) : (
                            <div></div>
                        )}
                        <span className="label-caps text-body-slate/70">
                            {formData.title.length}/100
                        </span>
                    </div>
                </div>

                {/* Review Text Section */}
                <div>
                    <label htmlFor="review_text" className="block label-caps text-body-slate mb-2">
                        Your Review <span className="text-primary">*</span>
                    </label>
                    <textarea
                        id="review_text"
                        value={formData.review_text}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, review_text: e.target.value }));
                            if (errors.review_text) setErrors(prev => ({ ...prev, review_text: '' }));
                        }}
                        placeholder="Share how the piece wears, drapes and lasts..."
                        rows={4}
                        className={`${fieldBase} resize-vertical ${errors.review_text ? 'border-primary' : 'border-border-line'}`}
                        maxLength={1000}
                    />
                    <div className="flex justify-between gap-3 mt-1.5">
                        {errors.review_text ? (
                            <p className="text-[12px] text-primary">{errors.review_text}</p>
                        ) : (
                            <div></div>
                        )}
                        <span className="label-caps text-body-slate/70">
                            {formData.review_text.length}/1000
                        </span>
                    </div>
                </div>

                {/* Image Upload Section */}
                <div>
                    <label className="block label-caps text-body-slate mb-2">
                        Add Photos (Optional)
                    </label>
                    <p className="text-[12px] text-body-slate mb-3">Upload up to {MAX_IMAGES} images (max 5MB each)</p>

                    {/* Image Preview Grid */}
                    <div className="grid grid-cols-5 gap-2">
                        {/* Existing Images */}
                        {existingImages.map((imagePath, index) => (
                            <div key={`existing-${index}`} className="relative aspect-square border border-border-line bg-surface-ivory overflow-hidden group">
                                <img
                                    src={getReviewImageUrl(imagePath)}
                                    alt={`Review image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(imagePath)}
                                    aria-label={`Remove review image ${index + 1}`}
                                    className="absolute top-0 right-0 bg-primary hover:bg-surface-dark text-surface p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {/* New Image Previews */}
                        {imagePreviewUrls.map((url, index) => (
                            <div key={`new-${index}`} className="relative aspect-square border border-border-line bg-surface-ivory overflow-hidden group">
                                <Image
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSelectedImage(index)}
                                    aria-label={`Remove selected image ${index + 1}`}
                                    className="absolute top-0 right-0 bg-primary hover:bg-surface-dark text-surface p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {/* Upload Button */}
                        {(existingImages.length + selectedImages.length) < MAX_IMAGES && (
                            <label className="aspect-square border border-dashed border-border-line bg-surface-subtle hover:border-on-surface flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                                <ImageIcon className="w-5 h-5 text-body-slate" />
                                <span className="label-caps text-body-slate">Add</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {errors.images && (
                        <p className="text-[12px] text-primary mt-2">{errors.images}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="sv-btn-outline flex-1 !min-h-[44px] !py-2 !px-4 disabled:opacity-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || formData.rating === 0}
                        className="sv-btn-primary flex-1 !min-h-[44px] !py-2 !px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                {isEditing ? 'Update Review' : 'Submit Review'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
