import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LineChart from "@/components/charts/line-chart";
import { api } from "@/lib/api";
import { Tags, TrendingUp, Hash, Clock } from "lucide-react";

export default function AITopicAnalysisPage() {
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: topicBreakdown = [] } = useQuery({
    queryKey: ["/api/topic-breakdown"],
    queryFn: () => api.getTopicBreakdown(),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["/api/snapshots", "30d"],
    queryFn: () => api.getSnapshots("30d", "day"),
  });

  // Generate topic timeline data (simplified)
  const generateTopicTimeline = (topic: string) => {
    return snapshots.slice(-7).map((snapshot, index) => ({
      date: new Date(snapshot.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mentions: Math.floor(Math.random() * 10) + 1, // Simplified random data
    }));
  };

  // Extract trending topics from comments
  const extractTrendingTopics = () => {
    const topics: Record<string, { count: number; sentiment: number; recent: boolean }> = {};
    const recentThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    // Simplified topic extraction based on keywords
    const topicKeywords = {
      "Service Quality": ["service", "staff", "friendly", "helpful", "rude", "slow"],
      "Food & Drinks": ["coffee", "food", "drink", "taste", "delicious", "bland"],
      "Atmosphere": ["atmosphere", "ambiance", "music", "loud", "quiet", "cozy"],
      "Cleanliness": ["clean", "dirty", "tidy", "messy", "hygienic"],
      "Wait Times": ["wait", "quick", "slow", "fast", "time", "delayed"],
      "Pricing": ["price", "expensive", "cheap", "value", "cost", "affordable"],
    };

    comments.forEach(comment => {
      const text = comment.text.toLowerCase();
      const commentDate = new Date(comment.createdAt || Date.now());
      const isRecent = commentDate > recentThreshold;

      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        const hasKeyword = keywords.some(keyword => text.includes(keyword));
        if (hasKeyword) {
          if (!topics[topic]) {
            topics[topic] = { count: 0, sentiment: 0, recent: false };
          }
          topics[topic].count++;
          topics[topic].sentiment += comment.sentimentScore;
          if (isRecent) topics[topic].recent = true;
        }
      });
    });

    // Calculate average sentiment for each topic
    Object.keys(topics).forEach(topic => {
      if (topics[topic].count > 0) {
        topics[topic].sentiment = topics[topic].sentiment / topics[topic].count;
      }
    });

    return Object.entries(topics)
      .map(([topic, data]) => ({ topic, ...data }))
      .sort((a, b) => b.count - a.count);
  };

  const trendingTopics = extractTrendingTopics();

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.7) return "text-green-600";
    if (sentiment > 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.7) return "default";
    if (sentiment > 0.4) return "secondary";
    return "destructive";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">AI Topic Analysis</h1>
        <p className="text-gray-600">Discover what customers are talking about and track topic trends over time</p>
      </div>

      {/* Topic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Topics</p>
                <p className="text-3xl font-bold text-primary">{trendingTopics.length}</p>
                <p className="text-sm text-green-600">Actively discussed</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Tags className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trending Now</p>
                <p className="text-3xl font-bold text-green-600">
                  {trendingTopics.filter(t => t.recent).length}
                </p>
                <p className="text-sm text-green-600">Hot topics</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Sentiment</p>
                <p className="text-3xl font-bold text-primary">
                  {trendingTopics.length > 0 
                    ? `${((trendingTopics.reduce((sum, t) => sum + t.sentiment, 0) / trendingTopics.length) * 100).toFixed(0)}%`
                    : "N/A"
                  }
                </p>
                <p className="text-sm text-gray-600">Across topics</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Hash className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Topic Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {trendingTopics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tags className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No topic data available.</p>
              <p className="text-sm mt-2">Topics will appear as you receive more mentions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trendingTopics.map((topic) => (
                <div key={topic.topic} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{topic.topic}</h3>
                      {topic.recent && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{topic.count} mentions</span>
                      <Badge variant={getSentimentBadge(topic.sentiment)} className="text-xs">
                        {(topic.sentiment * 100).toFixed(0)}% sentiment
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((topic.count / Math.max(...trendingTopics.map(t => t.count))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Volume: {topic.count} mentions • 
                        <span className={`ml-1 ${getSentimentColor(topic.sentiment)}`}>
                          {topic.sentiment > 0.7 ? "Positive feedback" :
                           topic.sentiment > 0.4 ? "Mixed feedback" : "Needs attention"}
                        </span>
                      </p>
                    </div>
                    
                    <div className="lg:col-span-1">
                      <div className="h-16">
                        <LineChart
                          data={generateTopicTimeline(topic.topic)}
                          xKey="date"
                          yKeys={["mentions"]}
                          colors={["var(--primary)"]}
                          hideGrid={true}
                          hideAxes={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Official Topic Analysis from API */}
      {topicBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Topic Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {topicBreakdown.map((topic) => (
                <div key={topic.label} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="font-medium">{topic.label}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">{topic.count} mentions</span>
                    {topic.score && (
                      <span className={`font-medium ${getSentimentColor(topic.score)}`}>
                        {(topic.score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
