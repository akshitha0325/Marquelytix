import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { FileText, Download, Settings, Eye } from "lucide-react";

export default function PDFReportsPage() {
  const { toast } = useToast();
  const [reportConfig, setReportConfig] = useState({
    timeRange: "30d",
    includeCharts: true,
    includeSummary: true,
    includeComments: true,
    includeTopics: true,
    includeGeoData: false,
    format: "standard",
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["/api/snapshots", reportConfig.timeRange],
    queryFn: () => api.getSnapshots(reportConfig.timeRange, "day"),
  });

  const generatePDFMutation = useMutation({
    mutationFn: async (config: typeof reportConfig) => {
      const response = await api.generatePDFReport();
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "PDF Generated",
        description: "Your sentiment report PDF has been generated successfully.",
      });
      // In a real app, this would trigger a download
      console.log("PDF generated:", data);
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePDF = () => {
    generatePDFMutation.mutate(reportConfig);
  };

  const calculateReportSize = () => {
    let pages = 1; // Cover page
    if (reportConfig.includeSummary) pages += 1;
    if (reportConfig.includeCharts) pages += 2;
    if (reportConfig.includeComments) pages += Math.ceil(comments.length / 10);
    if (reportConfig.includeTopics) pages += 1;
    if (reportConfig.includeGeoData) pages += 1;
    return pages;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">PDF Reports</h1>
        <p className="text-gray-600">Generate comprehensive PDF reports with charts, data, and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Range */}
              <div>
                <Label htmlFor="timeRange">Time Range</Label>
                <Select 
                  value={reportConfig.timeRange} 
                  onValueChange={(value) => setReportConfig(prev => ({ ...prev, timeRange: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="365d">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Report Format */}
              <div>
                <Label htmlFor="format">Report Format</Label>
                <Select 
                  value={reportConfig.format} 
                  onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Report</SelectItem>
                    <SelectItem value="executive">Executive Summary</SelectItem>
                    <SelectItem value="detailed">Detailed Analysis</SelectItem>
                    <SelectItem value="dashboard">Dashboard View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Options */}
              <div>
                <Label className="text-base font-medium">Report Content</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSummary"
                      checked={reportConfig.includeSummary}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeSummary: !!checked }))
                      }
                    />
                    <Label htmlFor="includeSummary" className="text-sm">
                      Executive Summary & KPIs
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={reportConfig.includeCharts}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeCharts: !!checked }))
                      }
                    />
                    <Label htmlFor="includeCharts" className="text-sm">
                      Charts & Visualizations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeComments"
                      checked={reportConfig.includeComments}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeComments: !!checked }))
                      }
                    />
                    <Label htmlFor="includeComments" className="text-sm">
                      Sample Comments & Mentions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeTopics"
                      checked={reportConfig.includeTopics}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeTopics: !!checked }))
                      }
                    />
                    <Label htmlFor="includeTopics" className="text-sm">
                      Topic Analysis
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeGeoData"
                      checked={reportConfig.includeGeoData}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeGeoData: !!checked }))
                      }
                    />
                    <Label htmlFor="includeGeoData" className="text-sm">
                      Geographic Analysis
                    </Label>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleGeneratePDF}
                  disabled={generatePDFMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {generatePDFMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Info */}
        <div className="space-y-6">
          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Report Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Format:</span>
                  <div className="text-gray-900 capitalize">{reportConfig.format.replace('-', ' ')}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Time Range:</span>
                  <div className="text-gray-900">{reportConfig.timeRange}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Estimated Pages:</span>
                  <div className="text-gray-900">{calculateReportSize()} pages</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Data Points:</span>
                  <div className="text-gray-900">{comments.length} mentions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Contents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Cover Page</span>
                  <span className="text-green-600">✓</span>
                </div>
                {reportConfig.includeSummary && (
                  <div className="flex items-center justify-between">
                    <span>Executive Summary</span>
                    <span className="text-green-600">✓</span>
                  </div>
                )}
                {reportConfig.includeCharts && (
                  <div className="flex items-center justify-between">
                    <span>Charts & Graphs</span>
                    <span className="text-green-600">✓</span>
                  </div>
                )}
                {reportConfig.includeComments && (
                  <div className="flex items-center justify-between">
                    <span>Sample Comments</span>
                    <span className="text-green-600">✓</span>
                  </div>
                )}
                {reportConfig.includeTopics && (
                  <div className="flex items-center justify-between">
                    <span>Topic Analysis</span>
                    <span className="text-green-600">✓</span>
                  </div>
                )}
                {reportConfig.includeGeoData && (
                  <div className="flex items-center justify-between">
                    <span>Geographic Data</span>
                    <span className="text-green-600">✓</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Monthly Report</div>
                    <div className="text-xs text-gray-500">Generated 2 days ago</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Weekly Summary</div>
                    <div className="text-xs text-gray-500">Generated 1 week ago</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Include charts for better visual impact</li>
                <li>• Executive format is best for stakeholders</li>
                <li>• Detailed reports include all raw data</li>
                <li>• Geographic data adds location insights</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
