import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LineChart from "@/components/charts/line-chart";
import DonutChart from "@/components/charts/donut-chart";
import { api } from "@/lib/api";
import { BarChart3, TrendingUp, PieChart, Hash } from "lucide-react";

export default function AnalysisPage() {
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["/api/snapshots", "30d"],
    queryFn: () => api.getSnapshots("30d", "day"),
  });

  const { data: topicBreakdown = [] } = useQuery({
    queryKey: ["/api/topic-breakdown"],
    queryFn: () => api.getTopicBreakdown(),
  });

  // Prepare sentiment over time data
  const sentimentOverTime = snapshots.map((snapshot: any) => ({
    date: new Date(snapshot.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    positive: snapshot.pos,
    neutral: snapshot.neu,
    negative: snapshot.neg,
    avgScore: snapshot.avgScore,
  }));

  // Prepare sentiment distribution data
  const totalComments = comments.length;
  const positiveCount = comments.filter((c: any) => c.sentimentLabel === "POSITIVE").length;
  const neutralCount = comments.filter((c: any) => c.sentimentLabel === "NEUTRAL").length;
  const negativeCount = comments.filter((c: any) => c.sentimentLabel === "NEGATIVE").length;

  const sentimentData = [
    { name: "Positive", value: positiveCount, color: "hsl(142, 76%, 36%)" },
    { name: "Neutral", value: neutralCount, color: "hsl(42, 95%, 50%)" },
    { name: "Negative", value: negativeCount, color: "hsl(0, 84%, 60%)" },
  ];

  // Prepare source distribution data
  const sourceCounts = comments.reduce((acc: any, comment: any) => {
    acc[comment.source] = (acc[comment.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceData = Object.entries(sourceCounts).map(([source, count]) => ({
    source: source.charAt(0).toUpperCase() + source.slice(1),
    count,
  }));

  // Generate word cloud data (simplified)
  const generateWordCloudData = () => {
    const words: Record<string, number> = {};
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'a', 'an']);
    
    comments.forEach((comment: any) => {
      const text = comment.text.toLowerCase();
      const wordList = text.split(/\W+/).filter((word: string) => 
        word.length > 3 && !commonWords.has(word)
      );
      
      wordList.forEach((word: string) => {
        words[word] = (words[word] || 0) + 1;
      });
    });

    return Object.entries(words)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
  };

  const wordCloudData = generateWordCloudData();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Sentiment Analysis</h1>
        <p className="text-gray-600">Detailed analysis of sentiment patterns and trends</p>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <DonutChart data={sentimentData} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{positiveCount}</div>
                <div className="text-sm text-gray-600">Positive</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{neutralCount}</div>
                <div className="text-sm text-gray-600">Neutral</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{negativeCount}</div>
                <div className="text-sm text-gray-600">Negative</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Sentiment Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <LineChart
                data={sentimentOverTime}
                xKey="date"
                yKeys={["positive", "neutral", "negative"]}
                colors={["hsl(142, 76%, 36%)", "hsl(42, 95%, 50%)", "hsl(0, 84%, 60%)"]}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Sources Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sourceData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No source data available
                </div>
              ) : (
                sourceData.slice(0, 8).map((item) => {
                  const percentage = totalComments > 0 ? (item.count / totalComments) * 100 : 0;
                  return (
                    <div key={item.source} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.source}</span>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{item.count}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Word Cloud (simplified as list) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hash className="w-5 h-5 mr-2" />
              Top Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wordCloudData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No keyword data available
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {wordCloudData.slice(0, 16).map((item, index) => (
                  <div key={item.word} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700 capitalize">{item.word}</span>
                    <span className="text-xs text-gray-500">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Topic Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {topicBreakdown.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No topic analysis available
            </div>
          ) : (
            <div className="grid gap-4">
              {topicBreakdown.map((topic) => (
                <div key={topic.label} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{topic.label}</h4>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{topic.count} mentions</span>
                      {topic.score && (
                        <span className={`text-sm font-medium ${
                          topic.score > 0.7 ? "text-green-600" :
                          topic.score > 0.4 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {(topic.score * 100).toFixed(0)}% sentiment
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min((topic.count / Math.max(...topicBreakdown.map(t => t.count))) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
