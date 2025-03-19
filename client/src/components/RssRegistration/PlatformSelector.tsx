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
            {selectedPlatform?.label || "플랫폼을 선택하세요"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {platforms.map((platform) => (
            <SelectItem key={platform.value} value={platform.value}>
              {platform.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!value && (
        <p className="text-xs text-muted-foreground mt-1">
          블로그 주소 아래 표시된 플랫폼 배지를 클릭하시면 자동으로 선택됩니다.
        </p>
      )}
    </div>
  );
};
