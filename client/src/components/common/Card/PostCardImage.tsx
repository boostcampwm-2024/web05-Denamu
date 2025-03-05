import { Image as ImageIcon } from "lucide-react";

import { LazyImage } from "@/components/common/LazyImage";

interface PostCardImageProps {
  thumbnail?: string;
  alt: string;
}

export const PostCardImage = ({ thumbnail, alt }: PostCardImageProps) => {
  return (
    <div
      className="h-full md:h-[120px] relative bg-muted flex items-center justify-center overflow-hidden rounded md:rounded-t-xl"
      data-testid="image-container"
    >
      {thumbnail ? (
        <LazyImage
          src={thumbnail}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          wrapperClassName="w-full h-full"
        />
      ) : (
        <div className="text-muted-foreground">
          <ImageIcon className="w-10 h-10" />
        </div>
      )}
    </div>
  );
};
