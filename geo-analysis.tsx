import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Map, Globe, TrendingUp, Users } from "lucide-react";

export default function GeoAnalysisPage() {
  const { data: geoData = [] } = useQuery({
    queryKey: ["/api/geo"],
    queryFn: () => api.getGeoData(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  // Calculate geographic statistics
  const totalCountries = geoData.length;
  const totalReach = geoData.reduce((sum, geo) => sum + geo.reach, 0);
  const topCountry = geoData.length > 0 
    ? geoData.reduce((max, geo) => geo.mentions > max.mentions ? geo : max)
    : null;

  // Sort countries by different metrics
  const countriesByMentions = [...geoData].sort((a, b) => b.mentions - a.mentions);
  const countriesByReach = [...geoData].sort((a, b) => b.reach - a.reach);
  const countriesByInteractions = [...geoData].sort((a, b) => b.interactions - a.interactions);

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'US': '🇺🇸',
      'UK': '🇬🇧',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'IN': '🇮🇳',
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'JP': '🇯🇵',
      'BR': '🇧🇷',
      'MX': '🇲🇽',
    };
    return flags[countryCode] || '🌍';
  };

  const getCountryName = (countryCode: string) => {
    const names: Record<string, string> = {
      'US': 'United States',
      'UK': 'United Kingdom', 
      'CA': 'Canada',
      'AU': 'Australia',
      'IN': 'India',
      'DE': 'Germany',
      'FR': 'France',
      'JP': 'Japan',
      'BR': 'Brazil',
      'MX': 'Mexico',
    };
    return names[countryCode] || countryCode;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Map className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Geographic Analysis</h1>
          <Badge variant="secondary">BETA</Badge>
        </div>
        <p className="text-gray-600">Analyze mentions and sentiment by geographic location</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-3xl font-bold text-primary">{totalCountries}</p>
                <p className="text-sm text-gray-500">Active regions</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Globe className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-3xl font-bold text-blue-600">
                  {totalReach > 1000000 ? `${(totalReach / 1000000).toFixed(1)}M` :
                   totalReach > 1000 ? `${(totalReach / 1000).toFixed(1)}K` : totalReach}
                </p>
                <p className="text-sm text-blue-600">Global audience</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Country</p>
                <p className="text-2xl font-bold text-green-600">
                  {topCountry ? getCountryFlag(topCountry.country) : '🌍'}
                </p>
                <p className="text-sm text-green-600">
                  {topCountry ? getCountryName(topCountry.country) : 'No data'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mentions</p>
                <p className="text-3xl font-bold text-purple-600">
                  {geoData.reduce((sum, geo) => sum + geo.mentions, 0)}
                </p>
                <p className="text-sm text-purple-600">Global total</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Map className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* World Map Placeholder */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>World Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Map className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 font-medium">Interactive World Map</p>
              <p className="text-sm text-gray-400 mt-2">
                Geographic visualization would be rendered here using a mapping library like Leaflet
              </p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 max-w-md mx-auto">
                {geoData.slice(0, 5).map((geo) => (
                  <div key={geo.country} className="text-center p-2 bg-white rounded border">
                    <div className="text-lg">{getCountryFlag(geo.country)}</div>
                    <div className="text-xs font-medium">{geo.mentions}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Country Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mentions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mentions">By Mentions</TabsTrigger>
              <TabsTrigger value="reach">By Reach</TabsTrigger>
              <TabsTrigger value="interactions">By Interactions</TabsTrigger>
            </TabsList>

            <TabsContent value="mentions" className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Country</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mentions</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Share</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Reach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countriesByMentions.map((geo, index) => {
                      const totalMentions = geoData.reduce((sum, g) => sum + g.mentions, 0);
                      const share = totalMentions > 0 ? (geo.mentions / totalMentions) * 100 : 0;
                      
                      return (
                        <tr key={geo.country} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium">#{index + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{getCountryFlag(geo.country)}</span>
                              <span className="font-medium">{getCountryName(geo.country)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{geo.mentions}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{share.toFixed(1)}%</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{geo.reach.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="reach" className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Country</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Reach</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Avg per Mention</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mentions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countriesByReach.map((geo, index) => {
                      const avgReachPerMention = geo.mentions > 0 ? geo.reach / geo.mentions : 0;
                      
                      return (
                        <tr key={geo.country} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium">#{index + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{getCountryFlag(geo.country)}</span>
                              <span className="font-medium">{getCountryName(geo.country)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{geo.reach.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{Math.round(avgReachPerMention)}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{geo.mentions}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="interactions" className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Country</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Interactions</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Engagement Rate</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Reach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countriesByInteractions.map((geo, index) => {
                      const engagementRate = geo.reach > 0 ? (geo.interactions / geo.reach) * 100 : 0;
                      
                      return (
                        <tr key={geo.country} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium">#{index + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{getCountryFlag(geo.country)}</span>
                              <span className="font-medium">{getCountryName(geo.country)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{geo.interactions.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{engagementRate.toFixed(2)}%</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{geo.reach.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
