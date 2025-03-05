import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

import { PLATFORMS, PlatformType } from "@/constants/rss";

interface RssUrlInputProps {
  platform: PlatformType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RssUrlInput = ({ platform, value, onChange }: RssUrlInputProps) => {
  const { prefix, suffix, placeholder } = PLATFORMS[platform];

  return (
    <div className="space-y-2">
      <Label>RSS URL</Label>
      <div className="flex items-center bg-background relative group">
        <div className="px-3 h-9 flex items-center text-sm text-muted-foreground bg-muted/30 rounded-l-md border-y border-l border-input">
          {prefix}
        </div>
        <div className="relative flex-grow h-9">
          <Input
            value={value}
            onChange={onChange}
            className="peer h-full border-0 border-y border-input bg-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 rounded-none"
            placeholder={placeholder}
          />
          <div className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-300 ease-in-out peer-focus:scale-x-100" />
        </div>
        {suffix && (
          <div className="px-3 h-9 flex items-center text-sm text-muted-foreground bg-muted/30 rounded-r-md border-y border-r border-input">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
};
