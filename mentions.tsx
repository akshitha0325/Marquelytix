import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterPanel from "@/components/filter-panel";
import CommentCard from "@/components/comment-card";
import LineChart from "@/components/charts/line-chart";
import AlertBanner from "@/components/alert-banner";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { FilterState } from "@/lib/types";
import { Sparkles } from "lucide-react";

export default function MentionsPage() {
  const [filters, setFilters] = useState<FilterState>({
    timeRange: "30d",
    sources: [],
    sentiment: [],
    minInfluence: 0,
    countriesExclude: [],
    languagesExclude: [],
    authorSearch: "",
    searchQuery: "",
  });

  const [activeTab, setActiveTab] = useState("mentions");

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/comments", filters],
    queryFn: () => api.getComments(filters),
  });

  // Fetch snapshots for chart
  const { data: snapshots = [], isLoading: snapshotsLoading } = useQuery({
    queryKey: ["/api/snapshots", filters.timeRange],
    queryFn: () => api.getSnapshots(filters.timeRange, "day"),
  });

  // AI Summarize mutation
  const summarizeMutation = useMutation({
    mutationFn: async () => {
      // This would call an AI endpoint to generate a summary
      return {
        summary: "Your mentions have increased by 15% this week, with 72% positive sentiment. Key topics include service quality (+8%) and product satisfaction (+12%). Consider promoting your top-rated items more prominently."
      };
    },
  });

  // Check for sentiment alerts
  const avgSentiment = comments.length > 0 
    ? comments.reduce((sum: number, c: any) => sum + c.sentimentScore, 0) / comments.length
    : 0;

  const showAlert = avgSentiment < 0.4;

  // Prepare chart data
  const chartData = snapshots.map((snapshot: any) => ({
    date: new Date(snapshot.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mentions: snapshot.mentions,
    reach: snapshot.reach,
  }));

  return (
    <div className="p-6">
      <div className="flex gap-6">
        {/* Chart Area */}
        <div className="flex-1">
          {/* Alert Banner */}
          {showAlert && (
            <AlertBanner
              type="warning"
              title="Sentiment Alert"
              message={`Average sentiment dropped to ${(avgSentiment * 100).toFixed(0)}%. Consider reviewing recent feedback.`}
            />
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="mentions">Mentions & Reach</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Chart Container */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mentions & Reach Over Time</span>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span>Mentions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span>Reach</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart
                  data={chartData}
                  xKey="date"
                  yKeys={["mentions", "reach"]}
                  colors={["var(--primary)", "var(--secondary)"]}
                  loading={snapshotsLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Comments Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Mentions</CardTitle>
            </CardHeader>
            <CardContent>
              {commentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No mentions found matching your filters.</p>
                  <p className="text-sm mt-2">Try adjusting your search criteria or time range.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Filter Panel */}
        <div className="w-80">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Summarize */}
              <div>
                <Button
                  onClick={() => summarizeMutation.mutate()}
                  disabled={summarizeMutation.isPending}
                  className="w-full brand-gradient text-white hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {summarizeMutation.isPending ? "Analyzing..." : "Summarize with AI"}
                </Button>
                
                {summarizeMutation.data && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {summarizeMutation.data.summary}
                    </p>
                  </div>
                )}
              </div>

              <FilterPanel filters={filters} onFiltersChange={setFilters} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
