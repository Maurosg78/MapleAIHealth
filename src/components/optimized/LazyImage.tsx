import * as React from 'react';
import { useState, useEffect, useRef, memo } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  placeholderSrc?: string;
  threshold?: number;
  className?: string;
  srcSet?: string;
  sizes?: string;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = memo(({
  src,
  alt,
  width,
  height,
  placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23cccccc" /%3E%3C/svg%3E',
  threshold = 0.1,
  className = '',
  srcSet,
  sizes,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!observerRef.current && typeof IntersectionObserver !== 'undefined') {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              if (observerRef.current && imgRef.current) {
                observerRef.current.unobserve(imgRef.current);
              }
            }
          });
        },
        { threshold }
      );
    }

    if (observerRef.current && imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [src, threshold]);

  const handleImageLoad = () => setIsLoaded(true);
  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  if (!isInView) {
    return React.createElement('div', {
      className: "flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700",
      style: { width, height, minHeight: height || 200 }
    },
    React.createElement('svg', {
      className: "w-10 h-10 text-gray-400",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg"
    },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "2",
      d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    })));
  }

  if (hasError) {
    return React.createElement('div', {
      className: "flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700",
      style: { width, height }
    },
    React.createElement('span', {
      className: "text-gray-500"
    }, "Error al cargar la imagen"));
  }

  if (placeholderSrc) {
    return React.createElement('div', {
      className: "relative",
      style: { width, height }
    }, [
      React.createElement('img', {
        key: 'placeholder',
        src: placeholderSrc,
        alt: `Placeholder for ${alt}`,
        className: `transition-opacity absolute top-0 left-0 w-full h-full object-cover ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`,
        style: {
          width: width || '100%',
          height: height || '100%'
        },
        'aria-hidden': "true"
      }),
      React.createElement('img', {
        key: 'main-image',
        ref: imgRef,
        src: src,
        alt: alt,
        srcSet: srcSet,
        sizes: sizes,
        className: `w-full h-full object-cover transition-opacity ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`,
        style: {
          width: width || '100%',
          height: height || '100%'
        },
        onLoad: handleImageLoad,
        onError: handleImageError
      })
    ]);
  }

  return React.createElement('img', {
    ref: imgRef,
    src: src,
    alt: alt,
    srcSet: srcSet,
    sizes: sizes,
    className: `w-full h-full object-cover ${className}`,
    style: {
      width: width || '100%',
      height: height || '100%'
    },
    onLoad: handleImageLoad,
    onError: handleImageError
  });
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
