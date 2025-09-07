export interface TimeRange {
  label: string;
  value: string;
  days: number;
}

export interface ChartDataPoint {
  date: string;
  mentions: number;
  reach: number;
  sentiment?: number;
}

export interface FilterState {
  timeRange: string;
  sources: string[];
  sentiment: string[];
  minInfluence: number;
  countriesExclude: string[];
  languagesExclude: string[];
  authorSearch: string;
  searchQuery: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SentimentCount {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface PlatformStats {
  platform: string;
  mentions: number;
  reach: number;
  sentiment: number;
  icon: string;
}

export const TIME_RANGES: TimeRange[] = [
  { label: "Last 24h", value: "1d", days: 1 },
  { label: "Last 7d", value: "7d", days: 7 },
  { label: "Last 30d", value: "30d", days: 30 },
  { label: "Custom", value: "custom", days: 0 },
];

export const GROUP_OPTIONS = [
  { label: "Days", value: "day" },
  { label: "Weeks", value: "week" },
  { label: "Months", value: "month" },
];

export const SOURCES = [
  { label: "Google Reviews", value: "google", icon: "fab fa-google" },
  { label: "Facebook", value: "facebook", icon: "fab fa-facebook" },
  { label: "X (Twitter)", value: "x", icon: "fab fa-x-twitter" },
  { label: "Instagram", value: "instagram", icon: "fab fa-instagram" },
  { label: "TikTok", value: "tiktok", icon: "fab fa-tiktok" },
  { label: "News", value: "news", icon: "fas fa-newspaper" },
  { label: "Blogs", value: "blog", icon: "fas fa-blog" },
  { label: "Videos", value: "video", icon: "fas fa-video" },
  { label: "Podcasts", value: "podcast", icon: "fas fa-podcast" },
  { label: "Manual", value: "manual", icon: "fas fa-edit" },
  { label: "Other", value: "other", icon: "fas fa-globe" },
];

export const SENTIMENT_OPTIONS = [
  { label: "Positive", value: "POSITIVE", color: "text-green-600" },
  { label: "Neutral", value: "NEUTRAL", color: "text-yellow-600" },
  { label: "Negative", value: "NEGATIVE", color: "text-red-600" },
];

export function getSentimentColor(sentiment: string, score?: number): string {
  if (sentiment === "POSITIVE") return "bg-green-100 text-green-800 border-green-200";
  if (sentiment === "NEGATIVE") return "bg-red-100 text-red-800 border-red-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
}

export function formatSentimentScore(score: number): string {
  return score.toFixed(2);
}

export function getInfluenceLevel(influence: number): string {
  if (influence >= 8) return "High";
  if (influence >= 5) return "Medium";
  return "Low";
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minutes ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return then.toLocaleDateString();
}
