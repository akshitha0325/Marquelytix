import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Clock, CheckCircle } from "lucide-react";

export default function EmailReportsPage() {
  const { toast } = useToast();
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "Marquelytix Weekly Sentiment Report",
    message: "Please find attached your weekly sentiment analysis report.",
    frequency: "weekly",
    includeCharts: true,
    includeSummary: true,
    includeComments: false,
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: typeof emailData) => {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, message: "Email sent successfully" };
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Your sentiment report has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Email Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scheduleEmailMutation = useMutation({
    mutationFn: async (data: typeof emailData) => {
      // Simulate scheduling
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: "Email scheduled successfully" };
    },
    onSuccess: () => {
      toast({
        title: "Email Scheduled",
        description: `Report scheduled to be sent ${emailData.frequency}.`,
      });
    },
    onError: () => {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendNow = () => {
    if (!emailData.to.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      });
      return;
    }
    sendEmailMutation.mutate(emailData);
  };

  const handleSchedule = () => {
    if (!emailData.to.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      });
      return;
    }
    scheduleEmailMutation.mutate(emailData);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Email Reports</h1>
        <p className="text-gray-600">Send automated sentiment reports to stakeholders via email</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipient */}
              <div>
                <Label htmlFor="to">Recipient Email *</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@company.com"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="Report subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Email message body"
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Frequency */}
              <div>
                <Label htmlFor="frequency">Schedule Frequency</Label>
                <Select 
                  value={emailData.frequency} 
                  onValueChange={(value) => setEmailData(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Report Options */}
              <div>
                <Label className="text-base font-medium">Report Content</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={emailData.includeCharts}
                      onCheckedChange={(checked) => 
                        setEmailData(prev => ({ ...prev, includeCharts: !!checked }))
                      }
                    />
                    <Label htmlFor="includeCharts" className="text-sm">
                      Include charts and visualizations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSummary"
                      checked={emailData.includeSummary}
                      onCheckedChange={(checked) => 
                        setEmailData(prev => ({ ...prev, includeSummary: !!checked }))
                      }
                    />
                    <Label htmlFor="includeSummary" className="text-sm">
                      Include summary statistics
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeComments"
                      checked={emailData.includeComments}
                      onCheckedChange={(checked) => 
                        setEmailData(prev => ({ ...prev, includeComments: !!checked }))
                      }
                    />
                    <Label htmlFor="includeComments" className="text-sm">
                      Include sample comments
                    </Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={handleSendNow}
                  disabled={sendEmailMutation.isPending}
                  className="flex-1"
                >
                  {sendEmailMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Now
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleSchedule}
                  disabled={scheduleEmailMutation.isPending}
                  className="flex-1"
                >
                  {scheduleEmailMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Status */}
        <div className="space-y-6">
          {/* Email Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">To:</span>
                  <div className="text-gray-900">{emailData.to || "recipient@company.com"}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Subject:</span>
                  <div className="text-gray-900">{emailData.subject}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Frequency:</span>
                  <div className="text-gray-900 capitalize">{emailData.frequency}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Message:</span>
                  <div className="text-gray-900 bg-gray-50 p-2 rounded text-xs">
                    {emailData.message}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-green-900">Weekly Report</div>
                    <div className="text-xs text-green-700">stakeholder@company.com</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-blue-900">Monthly Summary</div>
                    <div className="text-xs text-blue-700">manager@company.com</div>
                  </div>
                  <Clock className="w-4 h-4 text-blue-600" />
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
                <li>• Schedule weekly reports for regular stakeholder updates</li>
                <li>• Include charts for visual impact</li>
                <li>• Customize the subject line for better engagement</li>
                <li>• Test with your own email first</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
