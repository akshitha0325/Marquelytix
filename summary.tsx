import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KPIStat from "@/components/kpi-stat";
import LineChart from "@/components/charts/line-chart";
import DonutChart from "@/components/charts/donut-chart";
import { api } from "@/lib/api";
import { TrendingUp, TrendingDown, MessageCircle, ThumbsUp, Minus, ThumbsDown } from "lucide-react";

export default function SummaryPage() {
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["/api/snapshots", "30d"],
    queryFn: () => api.getSnapshots("30d", "day"),
  });

  const { data: authors = [] } = useQuery({
    queryKey: ["/api/authors"],
    queryFn: () => api.getAuthors(),
  });

  // Calculate KPIs
  const totalMentions = comments.length;
  const positiveCount = comments.filter((c: any) => c.sentimentLabel === "POSITIVE").length;
  const neutralCount = comments.filter((c: any) => c.sentimentLabel === "NEUTRAL").length;
  const negativeCount = comments.filter((c: any) => c.sentimentLabel === "NEGATIVE").length;

  const positivePercentage = totalMentions > 0 ? (positiveCount / totalMentions) * 100 : 0;
  const neutralPercentage = totalMentions > 0 ? (neutralCount / totalMentions) * 100 : 0;
  const negativePercentage = totalMentions > 0 ? (negativeCount / totalMentions) * 100 : 0;

  // Prepare chart data
  const reachData = snapshots.map((snapshot: any) => ({
    date: new Date(snapshot.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    reach: snapshot.reach,
  }));

  const sentimentData = [
    { name: "Positive", value: positiveCount, color: "hsl(142, 76%, 36%)" },
    { name: "Neutral", value: neutralCount, color: "hsl(42, 95%, 50%)" },
    { name: "Negative", value: negativeCount, color: "hsl(0, 84%, 60%)" },
  ];

  // Top authors and sources
  const topAuthors = authors
    .filter((author: any) => comments.some((c: any) => c.authorId === author.id))
    .map((author: any) => ({
      ...author,
      mentionCount: comments.filter((c: any) => c.authorId === author.id).length,
    }))
    .sort((a: any, b: any) => b.mentionCount - a.mentionCount)
    .slice(0, 5);

  const sourceCounts = comments.reduce((acc: any, comment: any) => {
    acc[comment.source] = (acc[comment.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSources = Object.entries(sourceCounts)
    .sort(([,a], [,b]: any[]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Summary Dashboard</h1>
        <p className="text-gray-600">Overview of your brand's online presence and sentiment</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPIStat
          title="Total Mentions"
          value={totalMentions.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={MessageCircle}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <KPIStat
          title="Positive"
          value={`${Math.round(positivePercentage)}%`}
          change="+3.2%"
          trend="up"
          icon={ThumbsUp}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <KPIStat
          title="Neutral"
          value={`${Math.round(neutralPercentage)}%`}
          change="-1.1%"
          trend="down"
          icon={Minus}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
        <KPIStat
          title="Negative"
          value={`${Math.round(negativePercentage)}%`}
          change="-2.1%"
          trend="down"
          icon={ThumbsDown}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Social Media Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <LineChart
                data={reachData}
                xKey="date"
                yKeys={["reach"]}
                colors={["var(--primary)"]}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <DonutChart data={sentimentData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Public Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Profile</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Platform</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mentions</th>
                  </tr>
                </thead>
                <tbody>
                  {topAuthors.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500">
                        No author data available
                      </td>
                    </tr>
                  ) : (
                    topAuthors.map((author) => (
                      <tr key={author.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm">{author.name}</td>
                        <td className="py-3 px-4 text-sm">{author.platform || "Unknown"}</td>
                        <td className="py-3 px-4 text-sm font-medium">{author.mentionCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Most Influential Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Source</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mentions</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Reach</th>
                  </tr>
                </thead>
                <tbody>
                  {topSources.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500">
                        No source data available
                      </td>
                    </tr>
                  ) : (
                    topSources.map(([source, count]) => (
                      <tr key={source} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm capitalize">{source}</td>
                        <td className="py-3 px-4 text-sm font-medium">{count}</td>
                        <td className="py-3 px-4 text-sm font-medium">{(count * 85).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
