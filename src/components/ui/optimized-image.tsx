/**
 * OptimizedImage - Componente de imagem otimizada
 * Lazy loading, placeholder, fallback e dimensões responsivas
 */

import { memo, useState, useCallback, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useLazyLoad } from "@/hooks/useIntersectionObserver";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholderColor?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  priority?: boolean;
  showSkeleton?: boolean;
  onLoadComplete?: () => void;
  onLoadError?: (error: Error) => void;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder.svg',
  placeholderColor,
  aspectRatio,
  objectFit = 'cover',
  priority = false,
  showSkeleton = true,
  className,
  onLoadComplete,
  onLoadError,
  ...props
}: OptimizedImageProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>(priority ? 'loading' : 'idle');
  const [currentSrc, setCurrentSrc] = useState(src);
  const { ref, shouldLoad } = useLazyLoad({ rootMargin: '200px' });

  const handleLoad = useCallback(() => {
    setLoadingState('loaded');
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback(() => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setLoadingState('loading');
    } else {
      setLoadingState('error');
      onLoadError?.(new Error(`Failed to load image: ${src}`));
    }
  }, [currentSrc, fallbackSrc, src, onLoadError]);

  // Start loading when visible
  const shouldRenderImage = priority || shouldLoad;

  if (loadingState === 'idle' && shouldRenderImage) {
    setLoadingState('loading');
  }

  const containerStyle = aspectRatio ? { aspectRatio } : undefined;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "relative overflow-hidden",
        aspectRatio && "w-full",
        className
      )}
      style={containerStyle}
    >
      {/* Skeleton/Placeholder */}
      {showSkeleton && loadingState !== 'loaded' && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: placeholderColor }}
        >
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {/* Image */}
      {shouldRenderImage && (
        <img
          {...props}
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            loadingState === 'loaded' ? 'opacity-100' : 'opacity-0',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            aspectRatio && 'absolute inset-0 w-full h-full'
          )}
        />
      )}

      {/* Error state */}
      {loadingState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Imagem indisponível</span>
        </div>
      )}
    </div>
  );
});

/**
 * Avatar otimizado
 */
interface OptimizedAvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitials?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const OptimizedAvatar = memo(function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  fallbackInitials,
  className,
}: OptimizedAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initials = fallbackInitials || alt.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary",
          sizeClasses[size],
          className
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={cn(
        "rounded-full object-cover",
        sizeClasses[size],
        className
      )}
    />
  );
});

export default OptimizedImage;
