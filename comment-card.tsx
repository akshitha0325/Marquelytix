import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Comment } from "@shared/schema";
import { getSentimentColor, getRelativeTime, getInfluenceLevel } from "@/lib/types";
import { ExternalLink, Tag, FileText } from "lucide-react";

interface CommentCardProps {
  comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps) {
  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      google: "fab fa-google",
      facebook: "fab fa-facebook",
      instagram: "fab fa-instagram",
      x: "fab fa-x-twitter",
      tiktok: "fab fa-tiktok",
      news: "fas fa-newspaper",
      blog: "fas fa-blog",
      video: "fas fa-video",
      podcast: "fas fa-podcast",
      manual: "fas fa-edit",
      other: "fas fa-globe",
    };
    return icons[source] || "fas fa-globe";
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      google: "text-blue-500",
      facebook: "text-blue-600",
      instagram: "text-pink-500",
      x: "text-gray-900",
      tiktok: "text-black",
      news: "text-gray-600",
      blog: "text-purple-500",
      video: "text-red-500",
      podcast: "text-green-500",
      manual: "text-orange-500",
      other: "text-gray-500",
    };
    return colors[source] || "text-gray-500";
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <i className={`${getSourceIcon(comment.source)} ${getSourceColor(comment.source)} text-lg`}></i>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-gray-900">
              {comment.authorId ? `Author ${comment.authorId.slice(0, 8)}` : "Anonymous"}
            </span>
            <span className="text-sm text-gray-500">
              {comment.createdAt ? getRelativeTime(comment.createdAt) : "Unknown time"}
            </span>
            <Badge className={`text-xs ${getSentimentColor(comment.sentimentLabel, comment.sentimentScore)}`}>
              {comment.sentimentLabel.toLowerCase()} {comment.sentimentScore.toFixed(2)}
            </Badge>
            {comment.influence && comment.influence > 0 && (
              <Badge variant="outline" className="text-xs">
                {getInfluenceLevel(comment.influence)} influence
              </Badge>
            )}
          </div>
          <p className="text-gray-700 mb-3 leading-relaxed">{comment.text}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {comment.country && (
                <span className="capitalize">{comment.country}</span>
              )}
              {comment.lang && comment.lang !== "en" && (
                <span className="uppercase">{comment.lang}</span>
              )}
              <span className="capitalize">{comment.source}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-3 h-3 mr-1" />
                Visit
              </Button>
              <Button variant="ghost" size="sm">
                <Tag className="w-3 h-3 mr-1" />
                Tag
              </Button>
              <Button variant="ghost" size="sm">
                <FileText className="w-3 h-3 mr-1" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
