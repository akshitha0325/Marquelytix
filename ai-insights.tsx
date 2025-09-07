import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AlertBanner from "@/components/alert-banner";
import { api } from "@/lib/api";
import { Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function AIInsightsPage() {
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["/api/suggestions"],
    queryFn: () => api.getSuggestions(),
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      // This would call an AI endpoint to generate insights
      return {
        insights: [
          {
            type: "positive",
            title: "Service Quality Improvement Detected",
            description: "Customer satisfaction with service quality has increased by 18% over the past week. Continue current training protocols.",
            confidence: 0.92,
            impact: "high"
          },
          {
            type: "warning", 
            title: "Wait Time Concerns",
            description: "15 mentions of longer wait times in the past 3 days. Consider staffing adjustments during peak hours.",
            confidence: 0.87,
            impact: "medium"
          },
          {
            type: "neutral",
            title: "Menu Variety Feedback",
            description: "Customers are requesting more vegetarian options. 12 mentions in the past week.",
            confidence: 0.76,
            impact: "low"
          }
        ]
      };
    },
  });

  // Calculate sentiment trends
  const recentComments = comments.slice(0, 10);
  const avgSentiment = comments.length > 0 
    ? comments.reduce((sum: number, c: any) => sum + c.sentimentScore, 0) / comments.length
    : 0;

  const positiveCount = comments.filter((c: any) => c.sentimentLabel === "POSITIVE").length;
  const negativeCount = comments.filter((c: any) => c.sentimentLabel === "NEGATIVE").length;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
    }
  };

  const getInsightBorder = (type: string) => {
    switch (type) {
      case "positive":
        return "border-l-4 border-green-500 bg-green-50";
      case "warning":
        return "border-l-4 border-yellow-500 bg-yellow-50";
      default:
        return "border-l-4 border-blue-500 bg-blue-50";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">AI Insights</h1>
        <p className="text-gray-600">AI-powered analysis and recommendations based on your sentiment data</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Sentiment</p>
                <p className="text-3xl font-bold text-primary">{(avgSentiment * 100).toFixed(0)}%</p>
                <p className="text-sm text-green-600">Above average</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Brain className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Positive Trends</p>
                <p className="text-3xl font-bold text-green-600">{positiveCount}</p>
                <p className="text-sm text-green-600">+12% this week</p>
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
                <p className="text-sm font-medium text-gray-600">Issues to Address</p>
                <p className="text-3xl font-bold text-red-600">{negativeCount}</p>
                <p className="text-sm text-red-600">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Generate Button */}
      <div className="mb-6">
        <Button
          onClick={() => generateInsightsMutation.mutate()}
          disabled={generateInsightsMutation.isPending}
          className="brand-gradient text-white hover:opacity-90"
        >
          <Brain className="w-4 h-4 mr-2" />
          {generateInsightsMutation.isPending ? "Analyzing..." : "Generate Fresh Insights"}
        </Button>
      </div>

      {/* AI Generated Insights */}
      {generateInsightsMutation.data && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generateInsightsMutation.data.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-r-lg ${getInsightBorder(insight.type)}`}>
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                          <Badge variant={insight.impact === "high" ? "destructive" : insight.impact === "medium" ? "default" : "secondary"} className="text-xs">
                            {insight.impact} impact
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-700">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No suggestions available.</p>
              <p className="text-sm mt-2">Generate insights to see AI-powered recommendations.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {suggestions.slice(0, 6).map((suggestion: any) => (
                <div key={suggestion.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                        <Badge variant={
                          suggestion.category === "POSITIVE" ? "default" :
                          suggestion.category === "NEGATIVE" ? "destructive" : "secondary"
                        }>
                          {suggestion.category.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{suggestion.body}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Apply
                    </Button>
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
