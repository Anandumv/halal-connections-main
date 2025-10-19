import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Expand, ZoomIn, ZoomOut, RotateCcw, RotateCw } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PhotoGalleryProps {
  photos: string[];
  className?: string;
  showThumbnails?: boolean;
  maxThumbnails?: number;
}

export default function PhotoGallery({ 
  photos, 
  className = '', 
  showThumbnails = true,
  maxThumbnails = 6 
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className={`aspect-square bg-card rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm">No photos</p>
        </div>
      </div>
    );
  }

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const openModal = (index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
    setZoom(1);
    setRotation(0);
  };

  const nextModalPhoto = () => {
    setModalIndex((prev) => (prev + 1) % photos.length);
  };

  const prevModalPhoto = () => {
    setModalIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Touch handling for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && photos.length > 1) {
      nextModalPhoto();
    }
    if (isRightSwipe && photos.length > 1) {
      prevModalPhoto();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      if (e.key === 'ArrowLeft' && photos.length > 1) {
        prevModalPhoto();
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        nextModalPhoto();
      } else if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen, photos.length]);

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Main Photo Display */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-card group">
          <img
            src={photos[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          
          {/* Photo Counter */}
          <div className="absolute top-2 right-2 bg-background/70 text-foreground px-2 py-1 rounded-full text-xs font-medium">
            {currentIndex + 1} / {photos.length}
          </div>

          {/* Expand Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 bg-background/70 text-foreground hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => openModal(currentIndex)}
          >
            <Expand className="h-4 w-4" />
          </Button>

          {/* Navigation Arrows (only show if more than 1 photo) */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 text-foreground hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevPhoto}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 text-foreground hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextPhoto}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {showThumbnails && photos.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {photos.slice(0, maxThumbnails).map((photo, index) => (
              <button
                key={index}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-amber-400 ring-1 ring-amber-400/50'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </button>
            ))}
            {photos.length > maxThumbnails && (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-card border-2 border-gray-600 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{photos.length - maxThumbnails}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-full h-[95vh] p-0 bg-background border-amber-400/20 overflow-hidden">
          <div 
            ref={modalRef}
            className="relative w-full h-full flex items-center justify-center bg-black/50"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-20 bg-background/80 text-foreground hover:bg-background/90 rounded-full p-3 shadow-lg"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Zoom and Rotation Controls */}
            <div className="absolute top-4 right-16 z-20 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 text-foreground hover:bg-background/90 rounded-full p-2 shadow-lg"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 text-foreground hover:bg-background/90 rounded-full p-2 shadow-lg"
                onClick={handleZoomIn}
                disabled={zoom >= 5}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 text-foreground hover:bg-background/90 rounded-full p-2 shadow-lg"
                onClick={handleRotate}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 text-foreground hover:bg-background/90 rounded-full p-2 shadow-lg"
                onClick={handleReset}
                disabled={zoom === 1 && rotation === 0}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Photo Counter */}
            <div className="absolute top-4 left-4 z-20 bg-background/80 text-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              {modalIndex + 1} / {photos.length}
            </div>

            {/* Zoom Level Indicator */}
            {zoom !== 1 && (
              <div className="absolute top-16 left-4 z-20 bg-background/80 text-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                {Math.round(zoom * 100)}%
              </div>
            )}

            {/* Main Photo Container */}
            <div 
              className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              <img
                src={photos[modalIndex]}
                alt={`Photo ${modalIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  cursor: zoom > 1 ? 'grab' : 'pointer'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/80 text-foreground hover:bg-background/90 rounded-full p-3 shadow-lg z-20"
                  onClick={prevModalPhoto}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/80 text-foreground hover:bg-background/90 rounded-full p-3 shadow-lg z-20"
                  onClick={nextModalPhoto}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Thumbnail Navigation at Bottom */}
            {photos.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 p-2 rounded-lg max-w-xs sm:max-w-sm overflow-x-auto shadow-lg z-20">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded border-2 overflow-hidden transition-all ${
                      index === modalIndex
                        ? 'border-amber-400 ring-2 ring-amber-400/50'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    onClick={() => setModalIndex(index)}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Mobile Touch Instructions */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full sm:hidden">
              Swipe to navigate
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}