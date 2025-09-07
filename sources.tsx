import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { SOURCES } from "@/lib/types";
import { Globe, Search, TrendingUp, MessageCircle, Eye, EyeOff } from "lucide-react";

export default function SourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [excludedSources, setExcludedSources] = useState<string[]>([]);

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  // Calculate source statistics
  const sourceStats = SOURCES.map(source => {
    const sourceComments = comments.filter((c: any) => c.source === source.value);
    const mentions = sourceComments.length;
    const reach = sourceComments.reduce((sum: number, c: any) => sum + (c.influence || 0) * 100, 0);
    const avgSentiment = mentions > 0 
      ? sourceComments.reduce((sum: number, c: any) => sum + c.sentimentScore, 0) / mentions
      : 0;
    
    return {
      ...source,
      mentions,
      reach,
      avgSentiment,
      isActive: !excludedSources.includes(source.value),
      growth: Math.floor(Math.random() * 30) - 10, // Simplified growth calculation
    };
  }).filter(source => 
    source.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSourceMutation = useMutation({
    mutationFn: async (sourceValue: string) => {
      // This would update user preferences in the backend
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
    },
  });

  const handleToggleSource = (sourceValue: string) => {
    setExcludedSources(prev => 
      prev.includes(sourceValue)
        ? prev.filter(s => s !== sourceValue)
        : [...prev, sourceValue]
    );
    toggleSourceMutation.mutate(sourceValue);
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.7) return "text-green-600";
    if (sentiment > 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const getSentimentBg = (sentiment: number) => {
    if (sentiment > 0.7) return "bg-green-100";
    if (sentiment > 0.4) return "bg-yellow-100";
    return "bg-red-100";
  };

  const totalMentions = sourceStats.reduce((sum, s) => sum + s.mentions, 0);
  const activeSources = sourceStats.filter(s => s.isActive).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Sources Management</h1>
        <p className="text-gray-600">Monitor and manage mentions across all platforms and sources</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sources</p>
                <p className="text-3xl font-bold text-primary">{SOURCES.length}</p>
                <p className="text-sm text-gray-500">Available platforms</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Globe className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sources</p>
                <p className="text-3xl font-bold text-green-600">{activeSources}</p>
                <p className="text-sm text-green-600">Currently monitoring</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Mentions</p>
                <p className="text-3xl font-bold text-primary">{totalMentions}</p>
                <p className="text-sm text-gray-500">Across all sources</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                <p className="text-xl font-bold text-primary">
                  {sourceStats.length > 0 
                    ? sourceStats.reduce((max, source) => source.mentions > max.mentions ? source : max).label
                    : "N/A"
                  }
                </p>
                <p className="text-sm text-gray-500">Most mentions</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-yellow-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sources List */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {sourceStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No sources found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sourceStats.map((source) => (
                <div key={source.value} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <i className={`${source.icon} text-lg`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{source.label}</h3>
                        <p className="text-sm text-gray-600">
                          {source.mentions} mentions • {source.reach.toLocaleString()} reach
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Sentiment */}
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getSentimentColor(source.avgSentiment)}`}>
                          {source.mentions > 0 ? `${(source.avgSentiment * 100).toFixed(0)}%` : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">Sentiment</div>
                      </div>

                      {/* Growth */}
                      <div className="text-center">
                        <div className={`text-lg font-bold ${
                          source.growth > 0 ? "text-green-600" : source.growth < 0 ? "text-red-600" : "text-gray-600"
                        }`}>
                          {source.growth > 0 ? "+" : ""}{source.growth}%
                        </div>
                        <div className="text-xs text-gray-500">Growth</div>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <Badge 
                          variant={source.isActive ? "default" : "secondary"}
                          className="mb-1"
                        >
                          {source.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <div className="text-xs text-gray-500">Status</div>
                      </div>

                      {/* Toggle */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={source.isActive}
                          onCheckedChange={() => handleToggleSource(source.value)}
                          disabled={toggleSourceMutation.isPending}
                        />
                        {source.isActive ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {source.mentions > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Average Sentiment:</span>
                          <div className={`inline-block ml-2 px-2 py-1 rounded text-xs ${getSentimentBg(source.avgSentiment)} ${getSentimentColor(source.avgSentiment)}`}>
                            {source.avgSentiment > 0.7 ? "Positive" :
                             source.avgSentiment > 0.4 ? "Neutral" : "Negative"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Reach per Mention:</span>
                          <span className="ml-2 font-medium">
                            {source.mentions > 0 ? Math.round(source.reach / source.mentions) : 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Platform Share:</span>
                          <span className="ml-2 font-medium">
                            {totalMentions > 0 ? ((source.mentions / totalMentions) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
