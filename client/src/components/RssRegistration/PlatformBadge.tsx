import { Badge } from "@/components/ui/badge";

interface PlatformBadgeProps {
  platform: string | null;
  onClick?: () => void;
}

export function PlatformBadge({ platform, onClick }: PlatformBadgeProps) {
  if (!platform) return null;

  const lowercasePlatform = platform.toLowerCase().replace(' ', '_');
  const isKnownPlatform = ['tistory', 'velog', 'medium', 'naver_blog'].includes(lowercasePlatform);
  
  return (
    <div className="flex flex-col items-start gap-1 mt-2">
      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary" 
          className={`flex items-center gap-1 px-3 py-1.5 transition-all ${onClick ? 'cursor-pointer hover:bg-secondary/80 hover:shadow-md hover:scale-105 border border-transparent hover:border-primary/30' : ''}`}
          onClick={onClick}
        >
          {isKnownPlatform && (
            <img 
              src={`https://denamu.site/files/${lowercasePlatform}-icon.svg`} 
              alt={platform} 
              className="w-5 h-5 mr-1" 
            />
          )}
          <span className="font-medium">{platform}</span>
        </Badge>
      </div>
    </div>
  );
} 