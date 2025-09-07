import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Users, TrendingUp, Star, Activity, Award } from "lucide-react";

export default function InfluencerAnalysisPage() {
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: authors = [] } = useQuery({
    queryKey: ["/api/authors"],
    queryFn: () => api.getAuthors(),
  });

  // Calculate influencer metrics
  const influencerStats = authors.map(author => {
    const authorComments = comments.filter(c => c.authorId === author.id);
    const mentions = authorComments.length;
    const avgSentiment = mentions > 0 
      ? authorComments.reduce((sum, c) => sum + c.sentimentScore, 0) / mentions
      : 0;
    const avgInfluence = mentions > 0
      ? authorComments.reduce((sum, c) => sum + (c.influence || 0), 0) / mentions
      : 0;
    const totalReach = (author.followers || 0) + (avgInfluence * 1000);
    const engagementRate = author.followers ? (mentions / author.followers) * 100 : 0;

    // Calculate growth trend (simplified)
    const recentMentions = authorComments.filter(c => {
      const commentDate = new Date(c.createdAt || Date.now());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return commentDate > weekAgo;
    }).length;
    
    const influenceGrowth = mentions > 0 ? (recentMentions / mentions) * 100 - 50 : 0;

    return {
      ...author,
      mentions,
      avgSentiment,
      avgInfluence,
      totalReach,
      engagementRate,
      influenceGrowth,
      isRising: influenceGrowth > 10,
      isTrending: mentions >= 3 && avgInfluence >= 7,
    };
  });

  // Sort influencers by different metrics
  const topInfluencers = [...influencerStats]
    .sort((a, b) => b.avgInfluence - a.avgInfluence)
    .slice(0, 10);

  const risingInfluencers = influencerStats
    .filter(i => i.isRising)
    .sort((a, b) => b.influenceGrowth - a.influenceGrowth)
    .slice(0, 5);

  const engagementLeaders = [...influencerStats]
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5);

  // Calculate overview stats
  const totalInfluencers = influencerStats.length;
  const highInfluence = influencerStats.filter(i => i.avgInfluence >= 8).length;
  const risingCount = risingInfluencers.length;
  const totalReach = influencerStats.reduce((sum, i) => sum + i.totalReach, 0);

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Influencer Analysis</h1>
          <Badge variant="secondary">BETA</Badge>
        </div>
        <p className="text-gray-600">Advanced analysis of influential voices and rising stars</p>
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
                <p className="text-3xl font-bold text-green-600">{highInfluence}</p>
                <p className="text-sm text-green-600">Key players</p>
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
                <p className="text-sm font-medium text-gray-600">Rising Stars</p>
                <p className="text-3xl font-bold text-blue-600">{risingCount}</p>
                <p className="text-sm text-blue-600">Growing influence</p>
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
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalReach > 1000000 ? `${(totalReach / 1000000).toFixed(1)}M` :
                   totalReach > 1000 ? `${(totalReach / 1000).toFixed(1)}K` : totalReach}
                </p>
                <p className="text-sm text-purple-600">Combined audience</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Influence vs Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 font-medium">Scatter Plot Chart</p>
                <p className="text-sm text-gray-400 mt-2">
                  Influence score vs engagement rate visualization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 font-medium">Growth Chart</p>
                <p className="text-sm text-gray-400 mt-2">
                  Influence growth trends over time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Influencer Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Influencer Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="top" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="top">Top Influencers</TabsTrigger>
              <TabsTrigger value="rising">Rising Stars</TabsTrigger>
              <TabsTrigger value="engagement">Engagement Leaders</TabsTrigger>
            </TabsList>

            <TabsContent value="top" className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Influencer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Influence Score</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mentions</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sentiment</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Reach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topInfluencers.map((influencer, index) => {
                      const influenceLevel = getInfluenceLevel(influencer.avgInfluence);
                      
                      return (
                        <tr key={influencer.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">#{index + 1}</span>
                              {index < 3 && <Award className="w-4 h-4 text-yellow-500" />}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {influencer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{influencer.name}</div>
                                {influencer.handle && (
                                  <div className="text-sm text-gray-500">@{influencer.handle}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{influencer.avgInfluence.toFixed(1)}/10</span>
                              <Badge className={`text-xs ${influenceLevel.color}`}>
                                {influenceLevel.label}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{influencer.mentions}</td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-medium ${getSentimentColor(influencer.avgSentiment)}`}>
                              {influencer.mentions > 0 ? `${(influencer.avgSentiment * 100).toFixed(0)}%` : "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {influencer.totalReach > 1000 ? `${(influencer.totalReach / 1000).toFixed(1)}K` : influencer.totalReach}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="rising" className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Influencer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Growth Rate</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Current Influence</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Recent Mentions</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risingInfluencers.map((influencer) => (
                      <tr key={influencer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{influencer.name}</div>
                              {influencer.handle && (
                                <div className="text-sm text-gray-500">@{influencer.handle}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-green-600">
                              +{influencer.influenceGrowth.toFixed(1)}%
                            </span>
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          {influencer.avgInfluence.toFixed(1)}/10
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{influencer.mentions}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                          {influencer.platform || "Unknown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Influencer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Engagement Rate</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Followers</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mentions</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Avg Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engagementLeaders.map((influencer) => (
                      <tr key={influencer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Activity className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{influencer.name}</div>
                              {influencer.handle && (
                                <div className="text-sm text-gray-500">@{influencer.handle}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-purple-600">
                            {influencer.engagementRate.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {influencer.followers ? influencer.followers.toLocaleString() : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{influencer.mentions}</td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-medium ${getSentimentColor(influencer.avgSentiment)}`}>
                            {influencer.mentions > 0 ? `${(influencer.avgSentiment * 100).toFixed(0)}%` : "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
