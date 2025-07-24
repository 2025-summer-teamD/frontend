import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SwipeableImageGallery = ({ imageUrls, getSafeImageUrl, setImagePreview }) => {
  console.log('받은 imageUrls:', imageUrls);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);

  const minSwipeDistance = 50;

  // currentIndex가 변경될 때마다 PreviewImage도 업데이트
  useEffect(() => {
    if (imageUrls && imageUrls[currentIndex]) {
      setImagePreview(imageUrls[currentIndex]);
    }
  }, [currentIndex, imageUrls, setImagePreview]);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToNext = () => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      return nextIndex >= imageUrls.length ? 0 : nextIndex;
    });
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => {
      const prevIndex = prev - 1;
      return prevIndex < 0 ? imageUrls.length - 1 : prevIndex;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="relative p-6">
        <img
          src="/api/uploads/default-character.svg"
          alt="Default"
          className="w-full h-72 object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative p-6">
      <div
        ref={containerRef}
        className="relative h-72 overflow-hidden rounded-lg"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(-${currentIndex * (100 / imageUrls.length)}%)`,
            width: `${imageUrls.length * 100}%`,
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="relative flex items-center justify-center"
              style={{
                width: `${100 / imageUrls.length}%`,
                height: '100%'
              }}
            >
              <img
                src={getSafeImageUrl ? getSafeImageUrl(url) : url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.log('이미지 로드 실패:', url);
                  e.target.src = '/api/uploads/default-character.svg';
                }}
                onLoad={() => {
                  console.log('이미지 로드 성공:', url);
                }}
              />
            </div>
          ))}
        </div>

        {/* 그라데이션 오버레이 - 원래 코드와 동일 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {imageUrls.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {imageUrls.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {imageUrls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

        {imageUrls.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {imageUrls.length}
          </div>
        )}
      </div>
    </div>
  );
};

const ImagePreviewSection = ({ activeTab, imagePreview, imageUrls, getSafeImageUrl, setImagePreview }) => {
  return (
    <>
      {activeTab === 'custom' ? (
        <div className="relative p-6">
          <img
            src={getSafeImageUrl(imagePreview)}
            alt="Preview"
            className="w-full h-72 object-contain"
            onError={(e) => {
              e.target.src = '/api/uploads/default-character.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      ) : (
        <SwipeableImageGallery
          imageUrls={imageUrls}
          getSafeImageUrl={getSafeImageUrl}
          setImagePreview={setImagePreview}
        />
      )}
    </>
  );
};

export default ImagePreviewSection;
