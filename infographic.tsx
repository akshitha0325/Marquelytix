import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Image, Download, Palette, Eye } from "lucide-react";

export default function InfographicReportsPage() {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [infographicConfig, setInfographicConfig] = useState({
    template: "modern",
    colorScheme: "brand",
    size: "social",
    includeKPIs: true,
    includeChart: true,
    includeLogo: true,
    includeTimestamp: true,
    timeRange: "30d",
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["/api/snapshots", infographicConfig.timeRange],
    queryFn: () => api.getSnapshots(infographicConfig.timeRange, "day"),
  });

  const generateInfographicMutation = useMutation({
    mutationFn: async (config: typeof infographicConfig) => {
      const response = await api.generateInfographic();
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Infographic Generated",
        description: "Your sentiment infographic has been created successfully.",
      });
      // In a real app, this would trigger a download
      console.log("Infographic generated:", data);
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate infographic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateInfographic = () => {
    generateInfographicMutation.mutate(infographicConfig);
  };

  // Calculate KPIs for preview
  const totalMentions = comments.length;
  const positiveCount = comments.filter(c => c.sentimentLabel === "POSITIVE").length;
  const avgSentiment = comments.length > 0 
    ? comments.reduce((sum, c) => sum + c.sentimentScore, 0) / comments.length
    : 0;
  const sentimentTrend = snapshots.length > 1 
    ? ((snapshots[snapshots.length - 1]?.avgScore || 0) - (snapshots[0]?.avgScore || 0)) * 100
    : 0;

  const getColorScheme = () => {
    switch (infographicConfig.colorScheme) {
      case "brand":
        return "bg-gradient-to-br from-primary to-secondary";
      case "blue":
        return "bg-gradient-to-br from-blue-600 to-blue-800";
      case "green":
        return "bg-gradient-to-br from-green-600 to-green-800";
      case "purple":
        return "bg-gradient-to-br from-purple-600 to-purple-800";
      default:
        return "bg-gradient-to-br from-gray-600 to-gray-800";
    }
  };

  const getSize = () => {
    switch (infographicConfig.size) {
      case "social":
        return "w-80 h-80"; // 1:1 for social media
      case "story":
        return "w-64 h-96"; // 9:16 for stories
      case "post":
        return "w-96 h-64"; // 16:9 for posts
      case "print":
        return "w-96 h-128"; // A4-like for print
      default:
        return "w-80 h-80";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Infographic Generator</h1>
        <p className="text-gray-600">Create visual infographics perfect for social media and presentations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Design Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template */}
              <div>
                <Label htmlFor="template">Template Style</Label>
                <Select 
                  value={infographicConfig.template} 
                  onValueChange={(value) => setInfographicConfig(prev => ({ ...prev, template: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern Minimal</SelectItem>
                    <SelectItem value="corporate">Corporate Professional</SelectItem>
                    <SelectItem value="creative">Creative Bold</SelectItem>
                    <SelectItem value="elegant">Elegant Classic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color Scheme */}
              <div>
                <Label htmlFor="colorScheme">Color Scheme</Label>
                <Select 
                  value={infographicConfig.colorScheme} 
                  onValueChange={(value) => setInfographicConfig(prev => ({ ...prev, colorScheme: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand">Brand Colors (Blue)</SelectItem>
                    <SelectItem value="blue">Ocean Blue</SelectItem>
                    <SelectItem value="green">Success Green</SelectItem>
                    <SelectItem value="purple">Professional Purple</SelectItem>
                    <SelectItem value="monochrome">Monochrome Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size Format */}
              <div>
                <Label htmlFor="size">Output Size</Label>
                <Select 
                  value={infographicConfig.size} 
                  onValueChange={(value) => setInfographicConfig(prev => ({ ...prev, size: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Media (1:1 - 1080x1080)</SelectItem>
                    <SelectItem value="story">Instagram Story (9:16 - 1080x1920)</SelectItem>
                    <SelectItem value="post">LinkedIn Post (16:9 - 1200x675)</SelectItem>
                    <SelectItem value="print">Print Ready (A4 - 2480x3508)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range */}
              <div>
                <Label htmlFor="timeRange">Data Period</Label>
                <Select 
                  value={infographicConfig.timeRange} 
                  onValueChange={(value) => setInfographicConfig(prev => ({ ...prev, timeRange: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Options */}
              <div>
                <Label className="text-base font-medium">Include Elements</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeKPIs"
                      checked={infographicConfig.includeKPIs}
                      onCheckedChange={(checked) => 
                        setInfographicConfig(prev => ({ ...prev, includeKPIs: !!checked }))
                      }
                    />
                    <Label htmlFor="includeKPIs" className="text-sm">
                      Key Performance Indicators
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeChart"
                      checked={infographicConfig.includeChart}
                      onCheckedChange={(checked) => 
                        setInfographicConfig(prev => ({ ...prev, includeChart: !!checked }))
                      }
                    />
                    <Label htmlFor="includeChart" className="text-sm">
                      Sentiment Chart
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeLogo"
                      checked={infographicConfig.includeLogo}
                      onCheckedChange={(checked) => 
                        setInfographicConfig(prev => ({ ...prev, includeLogo: !!checked }))
                      }
                    />
                    <Label htmlFor="includeLogo" className="text-sm">
                      Company Logo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeTimestamp"
                      checked={infographicConfig.includeTimestamp}
                      onCheckedChange={(checked) => 
                        setInfographicConfig(prev => ({ ...prev, includeTimestamp: !!checked }))
                      }
                    />
                    <Label htmlFor="includeTimestamp" className="text-sm">
                      Date & Timestamp
                    </Label>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleGenerateInfographic}
                  disabled={generateInfographicMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {generateInfographicMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Infographic...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Infographic
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div 
                  ref={previewRef}
                  className={`${getSize()} ${getColorScheme()} rounded-xl p-6 text-white relative overflow-hidden`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-12 translate-y-12"></div>
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between">
                    {/* Header */}
                    <div className="text-center">
                      {infographicConfig.includeLogo && (
                        <div className="w-8 h-8 bg-white rounded mx-auto mb-2"></div>
                      )}
                      <h2 className="text-lg font-bold">Sentiment Report</h2>
                      {infographicConfig.includeTimestamp && (
                        <p className="text-xs opacity-80">
                          {new Date().toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* KPIs */}
                    {infographicConfig.includeKPIs && (
                      <div className="grid grid-cols-2 gap-4 my-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{totalMentions}</div>
                          <div className="text-xs opacity-80">Total Mentions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{(avgSentiment * 100).toFixed(0)}%</div>
                          <div className="text-xs opacity-80">Avg Sentiment</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{positiveCount}</div>
                          <div className="text-xs opacity-80">Positive</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {sentimentTrend > 0 ? '+' : ''}{sentimentTrend.toFixed(1)}%
                          </div>
                          <div className="text-xs opacity-80">Trend</div>
                        </div>
                      </div>
                    )}

                    {/* Chart Area */}
                    {infographicConfig.includeChart && (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white border-dashed flex items-center justify-center">
                          <span className="text-xs">Chart</span>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="text-center">
                      <p className="text-xs opacity-80">Marquelytix</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Controls */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Preview: {infographicConfig.size} • {infographicConfig.template}
                </p>
                <div className="flex justify-center space-x-2">
                  {["social", "story", "post"].map((size) => (
                    <Button
                      key={size}
                      variant={infographicConfig.size === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInfographicConfig(prev => ({ ...prev, size }))}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Template Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {["modern", "corporate", "creative", "elegant"].map((template) => (
                  <div
                    key={template}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      infographicConfig.template === template 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setInfographicConfig(prev => ({ ...prev, template }))}
                  >
                    <div className="w-full h-16 bg-gray-100 rounded mb-2"></div>
                    <p className="text-xs text-center capitalize">{template}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
