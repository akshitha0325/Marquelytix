import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Settings, User, Bell, Shield, Database, Palette } from "lucide-react";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const { data: config } = useQuery({
    queryKey: ["/api/config"],
    queryFn: () => api.getConfig(),
  });

  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    businessName: user?.businessName || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [configData, setConfigData] = useState({
    demoMode: config?.demoMode === "true",
    sentimentThreshold: config?.sentimentThreshold || 0.4,
    huggingfaceToken: config?.huggingfaceToken || "",
    emailNotifications: true,
    weeklyReports: true,
    alertThreshold: 0.3,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (data: Partial<typeof configData>) => {
      return api.updateConfig({
        demoMode: data.demoMode ? "true" : "false",
        sentimentThreshold: data.sentimentThreshold,
        huggingfaceToken: data.huggingfaceToken,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Settings Updated",
        description: "Your configuration has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    updateConfigMutation.mutate(configData);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={profileData.businessName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, businessName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <Button className="w-full">Update Profile</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <Button variant="outline" className="w-full">Change Password</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive email alerts for important updates</p>
                </div>
                <Switch
                  checked={configData.emailNotifications}
                  onCheckedChange={(checked) => setConfigData(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weekly Reports</h4>
                  <p className="text-sm text-gray-600">Receive weekly summary reports</p>
                </div>
                <Switch
                  checked={configData.weeklyReports}
                  onCheckedChange={(checked) => setConfigData(prev => ({ ...prev, weeklyReports: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="alertThreshold">Sentiment Alert Threshold</Label>
                <Select 
                  value={configData.alertThreshold.toString()} 
                  onValueChange={(value) => setConfigData(prev => ({ ...prev, alertThreshold: parseFloat(value) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">10% - Very Sensitive</SelectItem>
                    <SelectItem value="0.2">20% - Sensitive</SelectItem>
                    <SelectItem value="0.3">30% - Balanced</SelectItem>
                    <SelectItem value="0.4">40% - Conservative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Integrations & API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Demo Mode</h4>
                  <p className="text-sm text-gray-600">Use simulated data for testing and demonstrations</p>
                </div>
                <Switch
                  checked={configData.demoMode}
                  onCheckedChange={(checked) => setConfigData(prev => ({ ...prev, demoMode: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="huggingfaceToken">Hugging Face API Token</Label>
                <Input
                  id="huggingfaceToken"
                  type="password"
                  value={configData.huggingfaceToken}
                  onChange={(e) => setConfigData(prev => ({ ...prev, huggingfaceToken: e.target.value }))}
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Optional: Add your Hugging Face token for enhanced sentiment analysis
                </p>
              </div>

              <div>
                <Label htmlFor="sentimentThreshold">Sentiment Analysis Threshold</Label>
                <div className="mt-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={configData.sentimentThreshold}
                    onChange={(e) => setConfigData(prev => ({ ...prev, sentimentThreshold: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.0 (Strict)</span>
                    <span className="font-medium">{configData.sentimentThreshold.toFixed(1)}</span>
                    <span>1.0 (Lenient)</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSaveConfig}
                disabled={updateConfigMutation.isPending}
                className="w-full"
              >
                {updateConfigMutation.isPending ? "Saving..." : "Save Integration Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">Account Status</h4>
                  <p className="text-sm text-green-800">Your account is secure and verified</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account</p>
                  <Button variant="outline" className="w-full">Enable 2FA</Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Session Management</h4>
                  <p className="text-sm text-gray-600 mb-3">Manage your active sessions</p>
                  <Button variant="outline" className="w-full">View Active Sessions</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-1">Export Data</h4>
                  <p className="text-sm text-red-800 mb-3">Download all your data before account deletion</p>
                  <Button variant="outline" size="sm">Export My Data</Button>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-1">Delete Account</h4>
                  <p className="text-sm text-red-800 mb-3">Permanently delete your account and all data</p>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full"
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
