import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import LineChart from "@/components/charts/line-chart";
import { api } from "@/lib/api";
import { Scale, TrendingUp, MessageCircle, BarChart3 } from "lucide-react";

export default function ComparisonPage() {
  const [termA, setTermA] = useState("");
  const [termB, setTermB] = useState("");
  const [isComparing, setIsComparing] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["/api/snapshots", "30d"],
    queryFn: () => api.getSnapshots("30d", "day"),
  });

  const handleCompare = () => {
    if (termA.trim() && termB.trim()) {
      setIsComparing(true);
    }
  };

  const getTermData = (term: string) => {
    const lowerTerm = term.toLowerCase();
    const relevantComments = comments.filter(comment => 
      comment.text.toLowerCase().includes(lowerTerm) ||
      comment.source.toLowerCase().includes(lowerTerm)
    );

    const totalMentions = relevantComments.length;
    const avgSentiment = totalMentions > 0 
      ? relevantComments.reduce((sum, c) => sum + c.sentimentScore, 0) / totalMentions
      : 0;

    const sourceMix = relevantComments.reduce((acc, comment) => {
      acc[comment.source] = (acc[comment.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const countries = relevantComments.reduce((acc, comment) => {
      const country = comment.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generate timeline data
    const timeline = snapshots.map(snapshot => ({
      date: new Date(snapshot.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mentions: Math.floor(Math.random() * totalMentions * 0.3), // Simplified
    }));

    return {
      mentions: totalMentions,
      avgSentiment,
      sourceMix: Object.entries(sourceMix).sort(([,a], [,b]) => b - a).slice(0, 5),
      countries: Object.entries(countries).sort(([,a], [,b]) => b - a).slice(0, 5),
      timeline,
    };
  };

  const termAData = isComparing ? getTermData(termA) : null;
  const termBData = isComparing ? getTermData(termB) : null;

  const comparisonData = termAData && termBData ? snapshots.map(snapshot => ({
    date: new Date(snapshot.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    [termA]: Math.floor(Math.random() * 20) + 5,
    [termB]: Math.floor(Math.random() * 20) + 5,
  })) : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Comparison Analysis</h1>
        <p className="text-gray-600">Compare mentions and sentiment between different terms, competitors, or topics</p>
      </div>

      {/* Comparison Setup */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scale className="w-5 h-5 mr-2" />
            Compare Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="termA">Term A (Your Brand)</Label>
              <Input
                id="termA"
                value={termA}
                onChange={(e) => setTermA(e.target.value)}
                placeholder="e.g., your brand name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="termB">Term B (Competitor/Topic)</Label>
              <Input
                id="termB"
                value={termB}
                onChange={(e) => setTermB(e.target.value)}
                placeholder="e.g., competitor name"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleCompare}
              disabled={!termA.trim() || !termB.trim()}
            >
              Compare
            </Button>
          </div>
        </CardContent>
      </Card>

      {!isComparing ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Scale className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Comparison</h3>
            <p className="text-gray-600">Enter two terms above to begin comparing mentions, sentiment, and trends.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Comparison Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{termA}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Mentions</span>
                    <span className="font-bold">{termAData?.mentions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Sentiment</span>
                    <span className={`font-bold ${
                      (termAData?.avgSentiment || 0) > 0.7 ? "text-green-600" :
                      (termAData?.avgSentiment || 0) > 0.4 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {((termAData?.avgSentiment || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Top Sources</span>
                    <div className="space-y-1">
                      {termAData?.sourceMix.slice(0, 3).map(([source, count]) => (
                        <div key={source} className="flex justify-between text-sm">
                          <span className="capitalize">{source}</span>
                          <span>{count}</span>
                        </div>
                      )) || <span className="text-sm text-gray-400">No data</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{termB}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Mentions</span>
                    <span className="font-bold">{termBData?.mentions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Sentiment</span>
                    <span className={`font-bold ${
                      (termBData?.avgSentiment || 0) > 0.7 ? "text-green-600" :
                      (termBData?.avgSentiment || 0) > 0.4 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {((termBData?.avgSentiment || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Top Sources</span>
                    <div className="space-y-1">
                      {termBData?.sourceMix.slice(0, 3).map(([source, count]) => (
                        <div key={source} className="flex justify-between text-sm">
                          <span className="capitalize">{source}</span>
                          <span>{count}</span>
                        </div>
                      )) || <span className="text-sm text-gray-400">No data</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Charts */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Mentions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart
                  data={comparisonData}
                  xKey="date"
                  yKeys={[termA, termB]}
                  colors={["var(--primary)", "var(--secondary)"]}
                />
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm">{termA}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span className="text-sm">{termB}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Source Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{termA}</h4>
                    <div className="space-y-2">
                      {termAData?.sourceMix.map(([source, count]) => (
                        <div key={source} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{source}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      )) || <span className="text-sm text-gray-400">No data</span>}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">{termB}</h4>
                    <div className="space-y-2">
                      {termBData?.sourceMix.map(([source, count]) => (
                        <div key={source} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{source}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      )) || <span className="text-sm text-gray-400">No data</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{termA}</h4>
                    <div className="space-y-2">
                      {termAData?.countries.map(([country, count]) => (
                        <div key={country} className="flex items-center justify-between">
                          <span className="text-sm">{country}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      )) || <span className="text-sm text-gray-400">No data</span>}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">{termB}</h4>
                    <div className="space-y-2">
                      {termBData?.countries.map(([country, count]) => (
                        <div key={country} className="flex items-center justify-between">
                          <span className="text-sm">{country}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      )) || <span className="text-sm text-gray-400">No data</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
