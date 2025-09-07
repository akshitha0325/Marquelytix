import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LineChart from "@/components/charts/line-chart";
import DonutChart from "@/components/charts/donut-chart";
import { api } from "@/lib/api";
import { Heart, Smile, Frown, Angry, Zap, Meh } from "lucide-react";

export default function EmotionAnalysisPage() {
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["/api/snapshots", "30d"],
    queryFn: () => api.getSnapshots("30d", "day"),
  });

  // Map sentiment to emotions (simplified model)
  const mapSentimentToEmotions = (sentimentLabel: string, sentimentScore: number) => {
    const emotions = {
      admiration: 0,
      joy: 0,
      love: 0,
      anger: 0,
      disgust: 0,
      fear: 0,
      sadness: 0,
      surprise: 0,
    };

    if (sentimentLabel === "POSITIVE") {
      if (sentimentScore > 0.8) {
        emotions.admiration = 0.6;
        emotions.joy = 0.8;
        emotions.love = 0.4;
      } else {
        emotions.joy = 0.6;
        emotions.admiration = 0.3;
      }
    } else if (sentimentLabel === "NEGATIVE") {
      if (sentimentScore < 0.3) {
        emotions.anger = 0.7;
        emotions.disgust = 0.5;
        emotions.sadness = 0.6;
      } else {
        emotions.sadness = 0.4;
        emotions.anger = 0.3;
      }
    } else {
      emotions.surprise = 0.2;
    }

    return emotions;
  };

  // Aggregate emotions from all comments
  const aggregateEmotions = () => {
    const totalEmotions = {
      admiration: 0,
      joy: 0,
      love: 0,
      anger: 0,
      disgust: 0,
      fear: 0,
      sadness: 0,
      surprise: 0,
    };

    comments.forEach(comment => {
      const emotions = mapSentimentToEmotions(comment.sentimentLabel, comment.sentimentScore);
      Object.keys(emotions).forEach(emotion => {
        totalEmotions[emotion as keyof typeof totalEmotions] += emotions[emotion as keyof typeof emotions];
      });
    });

    // Normalize by comment count
    if (comments.length > 0) {
      Object.keys(totalEmotions).forEach(emotion => {
        totalEmotions[emotion as keyof typeof totalEmotions] = 
          totalEmotions[emotion as keyof typeof totalEmotions] / comments.length;
      });
    }

    return totalEmotions;
  };

  const emotionTotals = aggregateEmotions();

  // Generate emotion timeline
  const generateEmotionTimeline = () => {
    return snapshots.map(snapshot => {
      const date = new Date(snapshot.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      // Simplified emotion calculation based on sentiment scores
      const joy = Math.max(0, snapshot.avgScore - 0.5) * 2;
      const admiration = Math.max(0, snapshot.avgScore - 0.7) * 3;
      const anger = Math.max(0, 0.5 - snapshot.avgScore) * 2;
      const sadness = Math.max(0, 0.3 - snapshot.avgScore) * 3;
      const love = joy * 0.6;
      const fear = anger * 0.5;

      return {
        date,
        joy: joy * 100,
        admiration: admiration * 100,
        anger: anger * 100,
        sadness: sadness * 100,
        love: love * 100,
        fear: fear * 100,
      };
    });
  };

  const emotionTimeline = generateEmotionTimeline();

  // Prepare emotion distribution data
  const emotionDistribution = [
    { name: "Joy", value: emotionTotals.joy * 100, color: "#10B981" },
    { name: "Admiration", value: emotionTotals.admiration * 100, color: "#3B82F6" },
    { name: "Love", value: emotionTotals.love * 100, color: "#EC4899" },
    { name: "Anger", value: emotionTotals.anger * 100, color: "#EF4444" },
    { name: "Sadness", value: emotionTotals.sadness * 100, color: "#6B7280" },
    { name: "Fear", value: emotionTotals.fear * 100, color: "#7C3AED" },
  ].filter(emotion => emotion.value > 0);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "joy":
        return <Smile className="w-5 h-5" />;
      case "admiration":
        return <Zap className="w-5 h-5" />;
      case "love":
        return <Heart className="w-5 h-5" />;
      case "anger":
        return <Angry className="w-5 h-5" />;
      case "sadness":
        return <Frown className="w-5 h-5" />;
      case "fear":
        return <Meh className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "joy":
        return "text-green-600 bg-green-100";
      case "admiration":
        return "text-blue-600 bg-blue-100";
      case "love":
        return "text-pink-600 bg-pink-100";
      case "anger":
        return "text-red-600 bg-red-100";
      case "sadness":
        return "text-gray-600 bg-gray-100";
      case "fear":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Find dominant emotion
  const dominantEmotion = Object.entries(emotionTotals)
    .reduce((max, [emotion, value]) => value > max.value ? { emotion, value } : max, { emotion: "neutral", value: 0 });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Heart className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Emotion Analysis</h1>
          <Badge variant="secondary">BETA</Badge>
        </div>
        <p className="text-gray-600">Deep emotional insights from customer feedback and sentiment</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dominant Emotion</p>
                <p className="text-2xl font-bold text-primary capitalize">{dominantEmotion.emotion}</p>
                <p className="text-sm text-gray-500">{(dominantEmotion.value * 100).toFixed(1)}% strength</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getEmotionColor(dominantEmotion.emotion)}`}>
                {getEmotionIcon(dominantEmotion.emotion)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Positive Emotions</p>
                <p className="text-3xl font-bold text-green-600">
                  {((emotionTotals.joy + emotionTotals.admiration + emotionTotals.love) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-green-600">Joy, Love, Admiration</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Smile className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Negative Emotions</p>
                <p className="text-3xl font-bold text-red-600">
                  {((emotionTotals.anger + emotionTotals.sadness + emotionTotals.fear) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-red-600">Anger, Sadness, Fear</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Frown className="text-red-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emotional Intensity</p>
                <p className="text-3xl font-bold text-purple-600">
                  {(Object.values(emotionTotals).reduce((sum, val) => sum + val, 0) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-purple-600">Overall engagement</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emotion Timeline */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Emotions Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <LineChart
              data={emotionTimeline}
              xKey="date"
              yKeys={["joy", "admiration", "love", "anger", "sadness", "fear"]}
              colors={["#10B981", "#3B82F6", "#EC4899", "#EF4444", "#6B7280", "#7C3AED"]}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {[
              { key: "joy", label: "Joy", color: "#10B981" },
              { key: "admiration", label: "Admiration", color: "#3B82F6" },
              { key: "love", label: "Love", color: "#EC4899" },
              { key: "anger", label: "Anger", color: "#EF4444" },
              { key: "sadness", label: "Sadness", color: "#6B7280" },
              { key: "fear", label: "Fear", color: "#7C3AED" },
            ].map((emotion) => (
              <div key={emotion.key} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: emotion.color }}
                ></div>
                <span className="text-sm">{emotion.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emotion Distribution and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Emotion Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <DonutChart data={emotionDistribution} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emotion Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(emotionTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([emotion, value]) => (
                  <div key={emotion} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getEmotionColor(emotion)}`}>
                        {getEmotionIcon(emotion)}
                      </div>
                      <span className="font-medium capitalize">{emotion}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(value * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {(value * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emotion Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Emotional Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {emotionTotals.joy > 0.3 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Smile className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">High Joy Levels</h4>
                </div>
                <p className="text-green-800 text-sm">
                  Your customers express significant joy and happiness. This indicates successful products/services and positive experiences.
                </p>
              </div>
            )}

            {emotionTotals.anger > 0.2 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Angry className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-900">Anger Detected</h4>
                </div>
                <p className="text-red-800 text-sm">
                  There are signs of customer frustration. Consider reviewing recent service issues and response times.
                </p>
              </div>
            )}

            {emotionTotals.admiration > 0.25 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Strong Admiration</h4>
                </div>
                <p className="text-blue-800 text-sm">
                  Customers show admiration for your brand. This is excellent for building loyalty and word-of-mouth marketing.
                </p>
              </div>
            )}

            {emotionTotals.love > 0.2 && (
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <h4 className="font-medium text-pink-900">Customer Love</h4>
                </div>
                <p className="text-pink-800 text-sm">
                  You have customers who genuinely love your brand. These are your biggest advocates - consider a referral program.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
