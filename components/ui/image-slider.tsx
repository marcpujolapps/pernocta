"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
  images: string[];
  altText: string;
  className?: string;
  showNavigationOnHover?: boolean;
  showIndicators?: boolean;
  aspectRatio?: string;
  onImageClick?: (e: React.MouseEvent) => void;
  onPrevious?: (e: React.MouseEvent) => void;
  onNext?: (e: React.MouseEvent) => void;
  fallbackContent?: React.ReactNode;
}

export function ImageSlider({
  images,
  altText,
  className = "",
  showNavigationOnHover = true,
  showIndicators = true,
  aspectRatio = "aspect-[4/3]",
  onImageClick,
  onPrevious,
  onNext,
  fallbackContent,
}: ImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image state when images change
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setCurrentImageIndex(0);
  }, [images]);

  // Navigation functions
  const goToPreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images && images.length > 1) {
      const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setImageLoaded(false);
    }
    onPrevious?.(e);
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images && images.length > 1) {
      const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setImageLoaded(false);
    }
    onNext?.(e);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
    setImageLoaded(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (images && images.length > 1) {
      if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
        setImageLoaded(false);
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation();
        const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
        setImageLoaded(false);
      }
    }
  };

  // If no images or error, show fallback
  if (!images || images.length === 0 || imageError) {
    return (
      <div className={`relative ${aspectRatio} bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 overflow-hidden ${className}`}>
        {fallbackContent || (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-rose-300 text-sm">No image available</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative group ${aspectRatio} bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 overflow-hidden ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Loading spinner */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100">
          <div className="w-8 h-8 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Main image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[currentImageIndex]}
        alt={altText}
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          console.log('Image failed to load:', images[currentImageIndex]);
          setImageError(true);
        }}
        onClick={onImageClick}
      />

      {/* Navigation buttons - only show when there are multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPreviousImage}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 z-20 ${
              showNavigationOnHover ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextImage}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 z-20 ${
              showNavigationOnHover ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Image indicators */}
          {showIndicators && (
            <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 transition-opacity duration-200 z-20 ${
              showNavigationOnHover ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
            }`}>
              {images.length <= 5 ? (
                // Show all dots if 5 or fewer images
                images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => goToImage(index, e)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex
                        ? 'bg-white'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))
              ) : images.length <= 10 ? (
                // Show sliding window of dots for 6-10 images
                Array.from({ length: Math.min(5, images.length) }, (_, i) => {
                  const maxStart = images.length - 5;
                  const start = Math.max(0, Math.min(maxStart, currentImageIndex - 2));
                  const actualIndex = start + i;
                  
                  return (
                    <button
                      key={actualIndex}
                      onClick={(e) => goToImage(actualIndex, e)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        actualIndex === currentImageIndex
                          ? 'bg-white'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  );
                })
              ) : (
                // Show position indicator for many images (11+)
                <div className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
