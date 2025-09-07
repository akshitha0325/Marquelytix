import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Search, Star, Users, TrendingUp, MessageCircle, ExternalLink } from "lucide-react";

export default function InfluencersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"influence" | "mentions" | "sentiment">("influence");

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: authors = [] } = useQuery({
    queryKey: ["/api/authors"],
    queryFn: () => api.getAuthors(),
  });

  // Calculate influencer statistics
  const influencerStats = authors.map(author => {
    const authorComments = comments.filter(c => c.authorId === author.id);
    const mentions = authorComments.length;
    const avgSentiment = mentions > 0 
      ? authorComments.reduce((sum, c) => sum + c.sentimentScore, 0) / mentions
      : 0;
    const avgInfluence = mentions > 0
      ? authorComments.reduce((sum, c) => sum + (c.influence || 0), 0) / mentions
      : 0;
    const reach = (author.followers || 0) + (avgInfluence * 1000);

    return {
      ...author,
      mentions,
      avgSentiment,
      avgInfluence,
      reach,
      engagementRate: author.followers ? (mentions / author.followers) * 100 : 0,
    };
  }).filter(influencer => 
    influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (influencer.handle && influencer.handle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort influencers
  const sortedInfluencers = [...influencerStats].sort((a, b) => {
    switch (sortBy) {
      case "influence":
        return b.avgInfluence - a.avgInfluence;
      case "mentions":
        return b.mentions - a.mentions;
      case "sentiment":
        return b.avgSentiment - a.avgSentiment;
      default:
        return b.avgInfluence - a.avgInfluence;
    }
  });

  const getInfluenceLevel = (influence: number) => {
    if (influence >= 8) return { label: "High", color: "bg-green-100 text-green-800" };
    if (influence >= 5) return { label: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Low", color: "bg-gray-100 text-gray-800" };
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.7) return "text-green-600";
    if (sentiment > 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const totalInfluencers = influencerStats.length;
  const highInfluencers = influencerStats.filter(i => i.avgInfluence >= 8).length;
  const totalReach = influencerStats.reduce((sum, i) => sum + i.reach, 0);
  const avgSentiment = influencerStats.length > 0
    ? influencerStats.reduce((sum, i) => sum + i.avgSentiment, 0) / influencerStats.length
    : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Influencers & Key Voices</h1>
        <p className="text-gray-600">Identify and analyze influential voices mentioning your brand</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Influencers</p>
                <p className="text-3xl font-bold text-primary">{totalInfluencers}</p>
                <p className="text-sm text-gray-500">Active voices</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Influence</p>
                <p className="text-3xl font-bold text-green-600">{highInfluencers}</p>
                <p className="text-sm text-green-600">Key voices</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-3xl font-bold text-blue-600">
                  {totalReach > 1000000 ? `${(totalReach / 1000000).toFixed(1)}M` :
                   totalReach > 1000 ? `${(totalReach / 1000).toFixed(1)}K` : totalReach}
                </p>
                <p className="text-sm text-blue-600">Combined followers</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Sentiment</p>
                <p className={`text-3xl font-bold ${getSentimentColor(avgSentiment)}`}>
                  {(avgSentiment * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600">Overall tone</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Sort */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Influencers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name or handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={sortBy === "influence" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("influence")}
              >
                By Influence
              </Button>
              <Button
                variant={sortBy === "mentions" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("mentions")}
              >
                By Mentions
              </Button>
              <Button
                variant={sortBy === "sentiment" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("sentiment")}
              >
                By Sentiment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Influencers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Influencer Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedInfluencers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No influencers found</h3>
              <p>No influential voices found matching your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Influencer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Platform</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Followers</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Influence</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mentions</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sentiment</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInfluencers.map((influencer) => {
                    const influenceLevel = getInfluenceLevel(influencer.avgInfluence);
                    
                    return (
                      <tr key={influencer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {influencer.avatarUrl ? (
                                <img 
                                  src={influencer.avatarUrl} 
                                  alt={influencer.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium">
                                  {influencer.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{influencer.name}</div>
                              {influencer.handle && (
                                <div className="text-sm text-gray-500">@{influencer.handle}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600 capitalize">
                            {influencer.platform || "Unknown"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium">
                            {influencer.followers ? influencer.followers.toLocaleString() : "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{influencer.avgInfluence.toFixed(1)}/10</span>
                            <Badge className={`text-xs ${influenceLevel.color}`}>
                              {influenceLevel.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium">{influencer.mentions}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-sm font-medium ${getSentimentColor(influencer.avgSentiment)}`}>
                            {influencer.mentions > 0 ? `${(influencer.avgSentiment * 100).toFixed(0)}%` : "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Profile
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
