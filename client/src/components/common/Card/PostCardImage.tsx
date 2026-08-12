import { LazyImage } from "@/components/common/LazyImage";

import { DEFAULT_THUMBNAIL } from "@/constants/thumbnail";

interface PostCardImageProps {
  thumbnail?: string;
  isNew?: boolean;
  alt: string;
}

export const PostCardImage = ({ thumbnail, alt, isNew }: PostCardImageProps) => {
  return (
    <div
      className="h-full md:h-[120px] relative bg-muted flex items-center justify-center overflow-hidden rounded md:rounded-t-xl"
      data-testid="image-container"
    >
      {isNew && (
        <span className="absolute z-10 top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
          New
        </span>
      )}
      <LazyImage
        src={thumbnail || DEFAULT_THUMBNAIL}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        wrapperClassName="w-full h-full"
      />
    </div>
  );
};
