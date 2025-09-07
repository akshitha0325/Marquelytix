import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { FileSpreadsheet, Download, Settings, Table } from "lucide-react";

export default function ExcelReportsPage() {
  const { toast } = useToast();
  const [reportConfig, setReportConfig] = useState({
    timeRange: "30d",
    includeComments: true,
    includeAuthors: true,
    includeSnapshots: true,
    includeSummary: true,
    includeFilters: false,
    format: "detailed",
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: authors = [] } = useQuery({
    queryKey: ["/api/authors"],
    queryFn: () => api.getAuthors(),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["/api/snapshots", reportConfig.timeRange],
    queryFn: () => api.getSnapshots(reportConfig.timeRange, "day"),
  });

  const generateExcelMutation = useMutation({
    mutationFn: async (config: typeof reportConfig) => {
      const response = await api.generateExcelReport();
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Excel Generated",
        description: "Your sentiment data has been exported to Excel successfully.",
      });
      // In a real app, this would trigger a download
      console.log("Excel generated:", data);
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to generate Excel export. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateExcel = () => {
    generateExcelMutation.mutate(reportConfig);
  };

  const calculateDataSize = () => {
    let rows = 0;
    if (reportConfig.includeComments) rows += comments.length;
    if (reportConfig.includeAuthors) rows += authors.length;
    if (reportConfig.includeSnapshots) rows += snapshots.length;
    return rows;
  };

  const getSheetCount = () => {
    let sheets = 0;
    if (reportConfig.includeSummary) sheets += 1;
    if (reportConfig.includeComments) sheets += 1;
    if (reportConfig.includeAuthors) sheets += 1;
    if (reportConfig.includeSnapshots) sheets += 1;
    return Math.max(sheets, 1);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Excel Export</h1>
        <p className="text-gray-600">Export sentiment data to Excel for further analysis and reporting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Export Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Range */}
              <div>
                <Label htmlFor="timeRange">Data Time Range</Label>
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
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Format */}
              <div>
                <Label htmlFor="format">Export Format</Label>
                <Select 
                  value={reportConfig.format} 
                  onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary Only</SelectItem>
                    <SelectItem value="detailed">Detailed Data</SelectItem>
                    <SelectItem value="raw">Raw Data Export</SelectItem>
                    <SelectItem value="pivot">Pivot Table Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data Sheets */}
              <div>
                <Label className="text-base font-medium">Data Sheets to Include</Label>
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
                      Summary Dashboard (KPIs, totals, averages)
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
                      Comments & Mentions (detailed list)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeAuthors"
                      checked={reportConfig.includeAuthors}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeAuthors: !!checked }))
                      }
                    />
                    <Label htmlFor="includeAuthors" className="text-sm">
                      Authors & Influencers (profiles, stats)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSnapshots"
                      checked={reportConfig.includeSnapshots}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeSnapshots: !!checked }))
                      }
                    />
                    <Label htmlFor="includeSnapshots" className="text-sm">
                      Time Series Data (daily/weekly snapshots)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeFilters"
                      checked={reportConfig.includeFilters}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeFilters: !!checked }))
                      }
                    />
                    <Label htmlFor="includeFilters" className="text-sm">
                      Apply Current Filters (export filtered data only)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleGenerateExcel}
                  disabled={generateExcelMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {generateExcelMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Excel...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export to Excel
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Info */}
        <div className="space-y-6">
          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Table className="w-4 h-4 mr-2" />
                Export Preview
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
                  <span className="font-medium text-gray-600">Worksheets:</span>
                  <div className="text-gray-900">{getSheetCount()} sheets</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total Rows:</span>
                  <div className="text-gray-900">{calculateDataSize().toLocaleString()}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">File Size:</span>
                  <div className="text-gray-900">~{Math.ceil(calculateDataSize() / 1000)} KB</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Worksheet Contents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Worksheet Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {reportConfig.includeSummary && (
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="font-medium text-blue-900">Summary</div>
                    <div className="text-blue-700 text-xs">KPIs, totals, sentiment breakdown</div>
                  </div>
                )}
                {reportConfig.includeComments && (
                  <div className="p-2 bg-green-50 rounded">
                    <div className="font-medium text-green-900">Comments</div>
                    <div className="text-green-700 text-xs">{comments.length} mentions with full details</div>
                  </div>
                )}
                {reportConfig.includeAuthors && (
                  <div className="p-2 bg-purple-50 rounded">
                    <div className="font-medium text-purple-900">Authors</div>
                    <div className="text-purple-700 text-xs">{authors.length} influencer profiles</div>
                  </div>
                )}
                {reportConfig.includeSnapshots && (
                  <div className="p-2 bg-orange-50 rounded">
                    <div className="font-medium text-orange-900">Snapshots</div>
                    <div className="text-orange-700 text-xs">{snapshots.length} time series data points</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Column Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sample Columns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div><strong>Comments:</strong> Date, Source, Author, Text, Sentiment, Score, Country, Language</div>
                <div><strong>Authors:</strong> Name, Handle, Platform, Followers, Influence, Mentions</div>
                <div><strong>Snapshots:</strong> Date, Total Mentions, Reach, Avg Sentiment, Positive, Neutral, Negative</div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Excel Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use pivot tables for advanced analysis</li>
                <li>• Filter by date range for specific periods</li>
                <li>• Sort by sentiment score to find extremes</li>
                <li>• Create charts from the time series data</li>
                <li>• Use conditional formatting for sentiment</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
