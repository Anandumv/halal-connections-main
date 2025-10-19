import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
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
  };

  const nextModalPhoto = () => {
    setModalIndex((prev) => (prev + 1) % photos.length);
  };

  const prevModalPhoto = () => {
    setModalIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

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
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-background border-gray-800">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/70 text-foreground hover:bg-background/80"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Photo Counter */}
            <div className="absolute top-4 left-4 z-10 bg-background/70 text-foreground px-3 py-1 rounded-full text-sm font-medium">
              {modalIndex + 1} / {photos.length}
            </div>

            {/* Main Photo */}
            <img
              src={photos[modalIndex]}
              alt={`Photo ${modalIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/70 text-foreground hover:bg-background/80"
                  onClick={prevModalPhoto}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/70 text-foreground hover:bg-background/80"
                  onClick={nextModalPhoto}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Thumbnail Navigation at Bottom */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/70 p-2 rounded-lg max-w-sm overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                      index === modalIndex
                        ? 'border-amber-400'
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}