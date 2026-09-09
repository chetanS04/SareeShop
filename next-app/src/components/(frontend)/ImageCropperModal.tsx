"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import axios from "../../../utils/axios";
import Modal from "../(sheared)/Modal";
import { Image, Trash2, Crop, RotateCw, RotateCcw, RefreshCw, CheckCircle2, ChevronRight, UploadCloud, Layers, Maximize2 } from "lucide-react";
import { getImageUrl } from "../../../utils/imageUtils";

export interface ImageItem {
    url: string;
    selected: boolean;
}

interface QueueItem {
    id: string;
    file: File;
    url: string;
    name: string;
}

type Props = {
    multiple?: boolean;
    onSelect: (imgs: string[] | string) => void;
    buttonLabel?: string;
    className?: string;
    directory?: string;
    aspectRatio?: number;
};

const FRAME_OPTIONS = [
    { label: "Free", ratio: 0, description: "Custom" },
    { label: "1:1", ratio: 1, description: "Square" },
    { label: "4:3", ratio: 4 / 3, description: "Landscape" },
    { label: "16:9", ratio: 16 / 9, description: "Banner" },
    { label: "3:4", ratio: 3 / 4, description: "Portrait" },
    { label: "9:16", ratio: 9 / 16, description: "Story" },
    { label: "2:1", ratio: 2 / 1, description: "Wide Header" },
];

export default function ImageCropperModal({
    multiple = false,
    onSelect,
    buttonLabel = "Select Image",
    className = "",
    directory = "products",
    aspectRatio,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageQueue, setImageQueue] = useState<QueueItem[]>([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
    const [isCropping, setIsCropping] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);

    const [activeAspectRatio, setActiveAspectRatio] = useState<number>(aspectRatio ?? 0);

    const cropperRef = useRef<ReactCropperElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setActiveAspectRatio(aspectRatio ?? 0);
        }
    }, [isOpen, aspectRatio]);

    const handleSelectFrame = (ratio: number) => {
        setActiveAspectRatio(ratio);
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            if (ratio > 0) {
                cropper.setAspectRatio(ratio);
            } else {
                cropper.setAspectRatio(NaN);
                const canvasData = cropper.getCanvasData();
                if (canvasData) {
                    cropper.setCropBoxData({
                        left: canvasData.left,
                        top: canvasData.top,
                        width: canvasData.width,
                        height: canvasData.height,
                    });
                }
            }
        }
    };

    const handleFitFullImage = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            if (activeAspectRatio > 0) {
                cropper.setAspectRatio(activeAspectRatio);
            } else {
                cropper.setAspectRatio(NaN);
                const canvasData = cropper.getCanvasData();
                if (canvasData) {
                    cropper.setCropBoxData({
                        left: canvasData.left,
                        top: canvasData.top,
                        width: canvasData.width,
                        height: canvasData.height,
                    });
                }
            }
        }
    };

    const handleRotate = (degree: number) => {
        if (cropperRef.current?.cropper) {
            cropperRef.current.cropper.rotate(degree);
        }
    };

    const handleReset = () => {
        if (cropperRef.current?.cropper) {
            cropperRef.current.cropper.reset();
            const currentRatio = activeAspectRatio;
            if (currentRatio > 0) {
                cropperRef.current.cropper.setAspectRatio(currentRatio);
            } else {
                cropperRef.current.cropper.setAspectRatio(NaN);
                const canvasData = cropperRef.current.cropper.getCanvasData();
                if (canvasData) {
                    cropperRef.current.cropper.setCropBoxData({
                        left: canvasData.left,
                        top: canvasData.top,
                        width: canvasData.width,
                        height: canvasData.height,
                    });
                }
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const queue: QueueItem[] = files.map((file, idx) => ({
                id: `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
                file,
                url: URL.createObjectURL(file),
                name: file.name,
            }));

            setImageQueue(queue);
            setCurrentQueueIndex(0);
            setSelectedImage(queue[0].url);

            // Reset input value so user can select the same file again if desired
            e.target.value = "";
        }
    };

    const fetchImages = async () => {
        try {
            const res = await axios.get(`/api/images/get-files/${directory}`);
            const imgs: ImageItem[] = res.data.map((url: string) => ({ url, selected: false }));
            setImages(imgs);
        } catch (err) {
            console.error("Error fetching images:", err);
        }
    };

    const handleCropSave = async () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper || !selectedImage) return;

        // Obtain canvas of exact selected region BEFORE triggering any state re-render
        const canvas = cropper.getCroppedCanvas({
            fillColor: "#ffffff",
            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high",
        });

        if (!canvas) {
            alert("Could not get cropped canvas");
            return;
        }

        setIsCropping(true);

        try {
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((b) => resolve(b), "image/png");
            });

            if (!blob) throw new Error("Could not create blob from canvas");

            const currentItem = imageQueue[currentQueueIndex];
            const originalName = currentItem?.name
                ? currentItem.name.replace(/\.[^/.]+$/, "") + ".png"
                : "cropped_image.png";

            const formData = new FormData();
            formData.append("directory", directory);
            formData.append("image", blob, originalName);

            const res = await axios.post("/api/images/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                params: { directory },
            });

            const uploadedUrl: string = res.data.result || res.data.url;
            if (!uploadedUrl) throw new Error("No image URL returned from server");

            const finalUrl = uploadedUrl.startsWith("http") ? uploadedUrl : `${uploadedUrl}`;

            // Add newly uploaded image into the images list and mark it selected
            setImages((prev) => {
                const exists = prev.some((img) => img.url === finalUrl);
                if (exists) {
                    return prev.map((img) =>
                        img.url === finalUrl
                            ? { ...img, selected: true }
                            : multiple
                            ? img
                            : { ...img, selected: false }
                    );
                }
                const newEntry = { url: finalUrl, selected: true };
                return multiple
                    ? [...prev, newEntry]
                    : [...prev.map((img) => ({ ...img, selected: false })), newEntry];
            });

            // Revoke current object URL
            if (currentItem?.url) {
                URL.revokeObjectURL(currentItem.url);
            }

            // Move to next image in queue if available (retaining user's chosen activeAspectRatio)
            const nextIndex = currentQueueIndex + 1;
            if (nextIndex < imageQueue.length) {
                setCurrentQueueIndex(nextIndex);
                setSelectedImage(imageQueue[nextIndex].url);
                // Keep activeAspectRatio unchanged so next image uses the same frame
            } else {
                // All queued images processed! Return to gallery modal
                setImageQueue([]);
                setCurrentQueueIndex(0);
                setSelectedImage(null);
            }
        } catch (err) {
            console.error("Crop upload error:", err);
            alert("Failed to upload cropped image.");
        } finally {
            setIsCropping(false);
        }
    };

    const handleSkipImage = () => {
        const currentItem = imageQueue[currentQueueIndex];
        if (currentItem?.url) {
            URL.revokeObjectURL(currentItem.url);
        }

        const nextIndex = currentQueueIndex + 1;
        if (nextIndex < imageQueue.length) {
            setCurrentQueueIndex(nextIndex);
            setSelectedImage(imageQueue[nextIndex].url);
            // Keep activeAspectRatio unchanged so next image uses the same frame
        } else {
            // Finished queue
            setImageQueue([]);
            setCurrentQueueIndex(0);
            setSelectedImage(null);
        }
    };

    const handleCancelCropping = () => {
        // Clean up remaining queue object URLs
        imageQueue.forEach((item) => {
            if (item.url) URL.revokeObjectURL(item.url);
        });
        setImageQueue([]);
        setCurrentQueueIndex(0);
        setSelectedImage(null);
        setActiveAspectRatio(0);
    };

    const toggleSelect = (index: number) => {
        setImages((prev) => {
            return multiple
                ? prev.map((img, i) =>
                      i === index ? { ...img, selected: !img.selected } : img
                  )
                : prev.map((img, i) => {
                      if (i === index) {
                          const isCurrentlySelected = img.selected;
                          return { ...img, selected: !isCurrentlySelected };
                      } else {
                          return { ...img, selected: false };
                      }
                  });
        });
    };

    const selectAllImages = () => {
        setImages((prev) => prev.map((img) => ({ ...img, selected: true })));
    };

    const deselectAllImages = () => {
        setImages((prev) => prev.map((img) => ({ ...img, selected: false })));
    };

    const confirmDeleteImage = (url: string) => {
        setImageToDelete(url);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!imageToDelete) return;
        try {
            const res = await axios.delete("/api/images", { data: { path: imageToDelete } });
            if (res.data?.isSuccess || res.data?.success) {
                setImages((prev) => prev.filter((img) => img.url !== imageToDelete));
                setIsDeleteModalOpen(false);
                setImageToDelete(null);
            } else {
                alert(res.data?.message || "Failed to delete image.");
            }
        } catch (err) {
            console.error("Error deleting image:", err);
            alert("Error deleting image.");
        }
    };

    const handleDone = () => {
        const selectedImgs = images.filter((img) => img.selected).map((img) => img.url);
        onSelect(multiple ? selectedImgs : selectedImgs[0] || "");
        setIsOpen(false);
        handleCancelCropping();
        setImages([]);
    };

    const handleClose = () => {
        setIsOpen(false);
        handleCancelCropping();
    };

    const openModal = () => {
        setIsOpen(true);
        setActiveAspectRatio(0);
        fetchImages();
    };

    const selectedCount = images.filter((img) => img.selected).length;

    return (
        <div>
            <button
                type="button"
                onClick={openModal}
                className={
                    className ||
                    `flex items-center gap-2 px-4 py-2 mt-2
                    bg-gradient-to-r from-[#007FFF] to-[#0055CC]
                    hover:from-[#0066CC] hover:to-[#0044BB]
                    rounded-xl shadow-md text-white font-semibold
                    hover:shadow-lg transition-all duration-200`
                }
            >
                <Image size={16} />
                {buttonLabel}
            </button>

            {typeof window !== "undefined" &&
                createPortal(
                    <>
                        <Modal
                            isOpen={isOpen}
                            onClose={handleClose}
                            title={
                                selectedImage && imageQueue.length > 1
                                    ? `Crop Image (${currentQueueIndex + 1} of ${imageQueue.length})`
                                    : selectedImage
                                    ? "Crop Image"
                                    : "Select Image"
                            }
                            width="max-w-4xl"
                            zIndex="z-[99999]"
                        >
                            {!selectedImage ? (
                                <div className="space-y-4">
                                    {/* Top Bar with Upload Button & Selection Stats */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <label className="btn btn-secondary cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow inline-flex items-center gap-2 transition-all">
                                            <UploadCloud size={18} />
                                            <span>Upload Images</span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </label>

                                        {multiple && images.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <button
                                                    type="button"
                                                    onClick={selectAllImages}
                                                    className="px-2.5 py-1 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 rounded-md transition"
                                                >
                                                    Select All
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={deselectAllImages}
                                                    className="px-2.5 py-1 text-gray-600 hover:text-gray-800 font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                                >
                                                    Deselect All
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Gallery Images Grid */}
                                    {images.length > 0 ? (
                                        <div className="max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                                                {images.map((img, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => toggleSelect(i)}
                                                        className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                                                            img.selected
                                                                ? "border-blue-600 shadow-md ring-2 ring-blue-400/50"
                                                                : "border-gray-200 hover:border-gray-400 bg-gray-50"
                                                        }`}
                                                    >
                                                        <div className="w-full h-32 relative bg-gray-100 flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={getImageUrl(img.url) || ""}
                                                                alt={`Image ${i}`}
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                loading="lazy"
                                                            />
                                                        </div>

                                                        {/* Delete Button */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                confirmDeleteImage(img.url);
                                                            }}
                                                            className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                                            title="Delete image"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>

                                                        {/* Selection Indicator Checkbox */}
                                                        <div className="absolute top-2 left-2 z-10">
                                                            <div
                                                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                                                    img.selected
                                                                        ? "bg-blue-600 text-white shadow"
                                                                        : "bg-white/80 border border-gray-400"
                                                                }`}
                                                            >
                                                                {img.selected && <CheckCircle2 size={14} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <UploadCloud size={40} className="text-gray-400 mb-2" />
                                            <p className="font-medium text-sm text-gray-700">No images uploaded yet</p>
                                            <p className="text-xs text-gray-500 mt-1">Click &quot;Upload Images&quot; to select one or multiple photos to crop &amp; add.</p>
                                        </div>
                                    )}

                                    {/* Action Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                        <div className="text-xs font-medium text-gray-500">
                                            {selectedCount > 0 ? (
                                                <span className="text-blue-600 font-semibold">
                                                    {selectedCount} {selectedCount === 1 ? "image" : "images"} selected
                                                </span>
                                            ) : (
                                                <span>Select an image to continue</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-100 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDone}
                                                disabled={selectedCount === 0}
                                                className={`px-5 py-2 rounded-lg font-semibold text-sm shadow transition-all ${
                                                    selectedCount > 0
                                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                }`}
                                            >
                                                Done {selectedCount > 0 && `(${selectedCount})`}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col w-full h-[620px] bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                                    {/* Multi-Image Queue Progress Header */}
                                    {imageQueue.length > 1 && (
                                        <div className="bg-gray-950 px-4 py-2 border-b border-gray-800 flex items-center justify-between text-xs text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Layers size={14} className="text-blue-400" />
                                                <span className="font-semibold text-white">
                                                    Image {currentQueueIndex + 1} of {imageQueue.length}
                                                </span>
                                                <span className="text-gray-400 truncate max-w-[200px] sm:max-w-[300px]">
                                                    ({imageQueue[currentQueueIndex]?.name})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {imageQueue.map((item, idx) => (
                                                    <span
                                                        key={item.id}
                                                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                                                            idx < currentQueueIndex
                                                                ? "bg-green-500"
                                                                : idx === currentQueueIndex
                                                                ? "bg-blue-500 ring-2 ring-blue-300 scale-125"
                                                                : "bg-gray-700"
                                                        }`}
                                                        title={`Image ${idx + 1}: ${item.name}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Frame Size Selection Toolbar */}
                                    <div className="bg-gray-800/95 backdrop-blur-md px-3 py-2 border-b border-gray-700 flex flex-wrap items-center justify-between gap-2 z-[10]">
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <Crop size={15} className="text-[#007FFF]" />
                                            <span className="text-xs font-semibold text-gray-200">Frame Size:</span>
                                        </div>
                                        <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                            {FRAME_OPTIONS.map((frame) => {
                                                const isSelected = isNaN(frame.ratio)
                                                    ? isNaN(activeAspectRatio)
                                                    : activeAspectRatio === frame.ratio;
                                                return (
                                                    <button
                                                        key={frame.label}
                                                        type="button"
                                                        onClick={() => handleSelectFrame(frame.ratio)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all flex-shrink-0 ${
                                                            isSelected
                                                                ? "bg-gradient-to-r from-[#007FFF] to-[#0055CC] text-white shadow-sm font-bold"
                                                                : "bg-gray-700/80 hover:bg-gray-700 text-gray-300 hover:text-white"
                                                        }`}
                                                    >
                                                        <span>{frame.label}</span>
                                                        <span className="text-[10px] opacity-75 font-normal">
                                                            ({frame.description})
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Cropper Workspace */}
                                    <div className="flex-1 relative bg-black/50 overflow-hidden flex items-center justify-center">
                                        <Cropper
                                            key={selectedImage}
                                            src={selectedImage}
                                            style={{ height: "460px", width: "100%" }}
                                            guides={true}
                                            ref={cropperRef}
                                            viewMode={1}
                                            dragMode="move"
                                            scalable={true}
                                            cropBoxMovable={true}
                                            cropBoxResizable={true}
                                            checkOrientation={true}
                                            checkCrossOrigin={true}
                                            background={true}
                                            aspectRatio={activeAspectRatio > 0 ? activeAspectRatio : NaN}
                                            autoCropArea={1}
                                            ready={() => {
                                                const cropper = cropperRef.current?.cropper;
                                                if (cropper) {
                                                    if (activeAspectRatio > 0) {
                                                        cropper.setAspectRatio(activeAspectRatio);
                                                    } else {
                                                        cropper.setAspectRatio(NaN);
                                                        const canvasData = cropper.getCanvasData();
                                                        if (canvasData) {
                                                            cropper.setCropBoxData({
                                                                left: canvasData.left,
                                                                top: canvasData.top,
                                                                width: canvasData.width,
                                                                height: canvasData.height,
                                                            });
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Action Controls Footer */}
                                    <div className="bg-gray-800/95 backdrop-blur-md px-4 py-3 border-t border-gray-700 flex items-center justify-between z-[10]">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleRotate(-90)}
                                                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
                                                title="Rotate Left 90°"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRotate(90)}
                                                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
                                                title="Rotate Right 90°"
                                            >
                                                <RotateCw size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
                                                title="Reset Crop Box"
                                            >
                                                <RefreshCw size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleFitFullImage}
                                                className="p-2 bg-gray-700 hover:bg-gray-600 text-blue-400 hover:text-blue-300 rounded-lg transition flex items-center gap-1 text-xs font-semibold"
                                                title="Cover Full Image (100%)"
                                            >
                                                <Maximize2 size={16} />
                                                <span className="hidden sm:inline">Cover Full</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={handleCancelCropping}
                                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-xl transition duration-200 text-sm"
                                            >
                                                {imageQueue.length > 1 ? "Cancel All" : "Cancel"}
                                            </button>

                                            {imageQueue.length > 1 && currentQueueIndex < imageQueue.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={handleSkipImage}
                                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium rounded-xl transition duration-200 text-sm"
                                                >
                                                    Skip
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleCropSave}
                                                disabled={isCropping}
                                                className={`px-6 py-2 rounded-xl font-semibold text-white text-sm shadow-md transition duration-200 flex items-center gap-1.5 ${
                                                    isCropping
                                                        ? "bg-gray-600 cursor-not-allowed"
                                                        : "bg-gradient-to-r from-[#007FFF] to-[#0055CC] hover:from-[#0066CC] hover:to-[#0044BB]"
                                                }`}
                                            >
                                                {isCropping ? (
                                                    "Saving..."
                                                ) : imageQueue.length > 1 && currentQueueIndex < imageQueue.length - 1 ? (
                                                    <>
                                                        <span>Crop &amp; Next</span>
                                                        <ChevronRight size={16} />
                                                    </>
                                                ) : (
                                                    "Crop & Save"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Modal>

                        <Modal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            title="Delete Image"
                            width="max-w-md"
                            zIndex="z-[99999]"
                        >
                            <div className="text-center space-y-4">
                                <p className="text-gray-700">Are you sure you want to delete this image?</p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-black font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteConfirmed}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-md transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    </>,
                    document.body
                )}
        </div>
    );
}
