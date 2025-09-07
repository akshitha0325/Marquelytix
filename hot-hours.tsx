import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Clock, Activity, TrendingUp, Sun, Moon } from "lucide-react";

export default function HotHoursPage() {
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  // Generate heatmap data
  const generateHeatmapData = () => {
    const heatmap: Record<string, Record<string, { mentions: number; sentiment: number; count: number }>> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Initialize data structure
    days.forEach(day => {
      heatmap[day] = {};
      for (let hour = 0; hour < 24; hour++) {
        heatmap[day][hour] = { mentions: 0, sentiment: 0, count: 0 };
      }
    });

    // Process comments
    comments.forEach((comment: any) => {
      if (comment.createdAt) {
        const date = new Date(comment.createdAt);
        const day = days[date.getDay()];
        const hour = date.getHours();
        
        heatmap[day][hour].mentions += 1;
        heatmap[day][hour].sentiment += comment.sentimentScore;
        heatmap[day][hour].count += 1;
      }
    });

    // Calculate average sentiment
    days.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        if (heatmap[day][hour].count > 0) {
          heatmap[day][hour].sentiment = heatmap[day][hour].sentiment / heatmap[day][hour].count;
        }
      }
    });

    return heatmap;
  };

  const heatmapData = generateHeatmapData();

  // Find peak hours
  const findPeakHours = () => {
    const hourlyTotals: Record<number, number> = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyTotals[hour] = 0;
      Object.keys(heatmapData).forEach(day => {
        hourlyTotals[hour] += heatmapData[day][hour].mentions;
      });
    }

    return Object.entries(hourlyTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hour, mentions]) => ({ hour: parseInt(hour), mentions }));
  };

  const peakHours = findPeakHours();

  // Find best sentiment hours
  const findBestSentimentHours = () => {
    const hourlySentiment: Record<number, { sentiment: number; count: number }> = {};
    
    for (let hour = 0; hour < 24; hour++) {
      hourlySentiment[hour] = { sentiment: 0, count: 0 };
      Object.keys(heatmapData).forEach(day => {
        if (heatmapData[day][hour].count > 0) {
          hourlySentiment[hour].sentiment += heatmapData[day][hour].sentiment;
          hourlySentiment[hour].count += 1;
        }
      });
      
      if (hourlySentiment[hour].count > 0) {
        hourlySentiment[hour].sentiment = hourlySentiment[hour].sentiment / hourlySentiment[hour].count;
      }
    }

    return Object.entries(hourlySentiment)
      .filter(([, data]) => data.count > 0)
      .sort(([,a], [,b]) => b.sentiment - a.sentiment)
      .slice(0, 5)
      .map(([hour, data]) => ({ hour: parseInt(hour), sentiment: data.sentiment }));
  };

  const bestSentimentHours = findBestSentimentHours();

  // Calculate stats
  const totalMentions = comments.length;
  const peakHour = peakHours.length > 0 ? peakHours[0] : null;
  const bestHour = bestSentimentHours.length > 0 ? bestSentimentHours[0] : null;

  const getIntensityColor = (value: number, maxValue: number) => {
    if (maxValue === 0) return "bg-gray-100";
    const intensity = value / maxValue;
    if (intensity === 0) return "bg-gray-100";
    if (intensity < 0.2) return "bg-blue-100";
    if (intensity < 0.4) return "bg-blue-200";
    if (intensity < 0.6) return "bg-blue-300";
    if (intensity < 0.8) return "bg-blue-400";
    return "bg-blue-500";
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.7) return "bg-green-400";
    if (sentiment > 0.4) return "bg-yellow-400";
    return "bg-red-400";
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  const maxMentions = Math.max(...Object.values(heatmapData).flatMap(day => 
    Object.values(day).map(hour => hour.mentions)
  ));

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Hot Hours Analysis</h1>
          <Badge variant="secondary">BETA</Badge>
        </div>
        <p className="text-gray-600">Discover when your audience is most active and engaged</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activity</p>
                <p className="text-3xl font-bold text-primary">{totalMentions}</p>
                <p className="text-sm text-gray-500">Mentions analyzed</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Activity className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Hour</p>
                <p className="text-3xl font-bold text-blue-600">
                  {peakHour ? formatHour(peakHour.hour) : "N/A"}
                </p>
                <p className="text-sm text-blue-600">Most active</p>
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
                <p className="text-sm font-medium text-gray-600">Best Sentiment</p>
                <p className="text-3xl font-bold text-green-600">
                  {bestHour ? formatHour(bestHour.hour) : "N/A"}
                </p>
                <p className="text-sm text-green-600">Most positive</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Sun className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quiet Period</p>
                <p className="text-3xl font-bold text-gray-600">3 AM</p>
                <p className="text-sm text-gray-600">Least active</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Moon className="text-gray-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mentions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mentions">Mentions Volume</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment Quality</TabsTrigger>
            </TabsList>

            <TabsContent value="mentions" className="mt-6">
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Hour labels */}
                  <div className="flex mb-2">
                    <div className="w-20"></div>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="w-8 text-xs text-center text-gray-500">
                        {hour}
                      </div>
                    ))}
                  </div>
                  
                  {/* Heatmap rows */}
                  {Object.keys(heatmapData).map(day => (
                    <div key={day} className="flex mb-1">
                      <div className="w-20 text-sm font-medium text-gray-700 flex items-center">
                        {day.slice(0, 3)}
                      </div>
                      {Array.from({ length: 24 }, (_, hour) => (
                        <div
                          key={hour}
                          className={`w-8 h-8 m-0.5 rounded ${getIntensityColor(heatmapData[day][hour].mentions, maxMentions)} cursor-pointer transition-all hover:scale-110`}
                          title={`${day} ${formatHour(hour)}: ${heatmapData[day][hour].mentions} mentions`}
                        ></div>
                      ))}
                    </div>
                  ))}
                  
                  {/* Legend */}
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <span className="text-xs text-gray-500">Less</span>
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <div className="w-4 h-4 bg-blue-100 rounded"></div>
                    <div className="w-4 h-4 bg-blue-200 rounded"></div>
                    <div className="w-4 h-4 bg-blue-300 rounded"></div>
                    <div className="w-4 h-4 bg-blue-400 rounded"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs text-gray-500">More</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sentiment" className="mt-6">
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Hour labels */}
                  <div className="flex mb-2">
                    <div className="w-20"></div>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="w-8 text-xs text-center text-gray-500">
                        {hour}
                      </div>
                    ))}
                  </div>
                  
                  {/* Heatmap rows */}
                  {Object.keys(heatmapData).map(day => (
                    <div key={day} className="flex mb-1">
                      <div className="w-20 text-sm font-medium text-gray-700 flex items-center">
                        {day.slice(0, 3)}
                      </div>
                      {Array.from({ length: 24 }, (_, hour) => (
                        <div
                          key={hour}
                          className={`w-8 h-8 m-0.5 rounded ${
                            heatmapData[day][hour].count > 0 
                              ? getSentimentColor(heatmapData[day][hour].sentiment)
                              : "bg-gray-100"
                          } cursor-pointer transition-all hover:scale-110`}
                          title={`${day} ${formatHour(hour)}: ${heatmapData[day][hour].count > 0 ? (heatmapData[day][hour].sentiment * 100).toFixed(0) + '% sentiment' : 'No data'}`}
                        ></div>
                      ))}
                    </div>
                  ))}
                  
                  {/* Legend */}
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <span className="text-xs text-gray-500">Negative</span>
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <span className="text-xs text-gray-500">Positive</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Peak Hours Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Peak Activity Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peakHours.map((peak, index) => (
                <div key={peak.hour} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{formatHour(peak.hour)}</div>
                      <div className="text-sm text-gray-600">{peak.mentions} mentions</div>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Sentiment Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestSentimentHours.map((best, index) => (
                <div key={best.hour} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{formatHour(best.hour)}</div>
                      <div className="text-sm text-gray-600">{(best.sentiment * 100).toFixed(0)}% sentiment</div>
                    </div>
                  </div>
                  <Sun className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
