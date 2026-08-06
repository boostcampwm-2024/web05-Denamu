import { PlatformIcon } from "@/components/profile/rss/PlatformIcon";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlogPlatformSelectorProps {
  platforms: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const BlogPlatformSelector = ({ platforms, value, onChange }: BlogPlatformSelectorProps) => {
  const selectedPlatform = platforms.find(p => p.value === value);

  return (
    <div className="space-y-2">
      <Label>블로그 플랫폼</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="플랫폼을 선택하세요">
            {selectedPlatform ? (
              <span className="flex items-center gap-2">
                <PlatformIcon platform={selectedPlatform.value} className="w-4 h-4" />
                {selectedPlatform.label}
              </span>
            ) : (
              "플랫폼을 선택하세요"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {platforms.map((platform) => (
            <SelectItem key={platform.value} value={platform.value} className="py-2.5 pl-5 pr-1 text-base">
              <span className="flex items-center gap-3">
                <PlatformIcon platform={platform.value} className="w-5 h-5" />
                {platform.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
