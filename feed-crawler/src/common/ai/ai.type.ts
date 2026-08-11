export interface ClaudeResponse {
  tags: Record<string, number>;
  summary: string;
}

export type FeedAIQueueItem = {
  id: number;
  content: string;
  deathCount: number;
  tagList?: string[];
  summary?: string;
};
