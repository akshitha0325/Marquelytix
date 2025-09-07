import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import MentionsPage from "@/pages/app/mentions";
import SummaryPage from "@/pages/app/summary";
import AIInsightsPage from "@/pages/app/ai-insights";
import AnalysisPage from "@/pages/app/analysis";
import AIBrandAssistantPage from "@/pages/app/ai-brand-assistant";
import AITopicAnalysisPage from "@/pages/app/ai-topic-analysis";
import ComparisonPage from "@/pages/app/comparison";
import SourcesPage from "@/pages/app/sources";
import InfluencersPage from "@/pages/app/influencers";
import EmailReportsPage from "@/pages/app/reports/email";
import PDFReportsPage from "@/pages/app/reports/pdf";
import ExcelReportsPage from "@/pages/app/reports/excel";
import InfographicReportsPage from "@/pages/app/reports/infographic";
import GeoAnalysisPage from "@/pages/app/geo-analysis";
import InfluencerAnalysisPage from "@/pages/app/influencer-analysis";
import HotHoursPage from "@/pages/app/hot-hours";
import EmotionAnalysisPage from "@/pages/app/emotion-analysis";
import SettingsPage from "@/pages/app/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected App Routes */}
      <ProtectedRoute path="/app" component={MentionsPage} />
      <ProtectedRoute path="/app/mentions" component={MentionsPage} />
      <ProtectedRoute path="/app/summary" component={SummaryPage} />
      <ProtectedRoute path="/app/ai-insights" component={AIInsightsPage} />
      <ProtectedRoute path="/app/analysis" component={AnalysisPage} />
      <ProtectedRoute path="/app/ai-brand-assistant" component={AIBrandAssistantPage} />
      <ProtectedRoute path="/app/ai-topic-analysis" component={AITopicAnalysisPage} />
      <ProtectedRoute path="/app/comparison" component={ComparisonPage} />
      <ProtectedRoute path="/app/sources" component={SourcesPage} />
      <ProtectedRoute path="/app/influencers" component={InfluencersPage} />
      
      {/* Reports */}
      <ProtectedRoute path="/app/reports/email" component={EmailReportsPage} />
      <ProtectedRoute path="/app/reports/pdf" component={PDFReportsPage} />
      <ProtectedRoute path="/app/reports/excel" component={ExcelReportsPage} />
      <ProtectedRoute path="/app/reports/infographic" component={InfographicReportsPage} />
      
      {/* Lab (Beta) */}
      <ProtectedRoute path="/app/geo-analysis" component={GeoAnalysisPage} />
      <ProtectedRoute path="/app/influencer-analysis" component={InfluencerAnalysisPage} />
      <ProtectedRoute path="/app/hot-hours" component={HotHoursPage} />
      <ProtectedRoute path="/app/emotion-analysis" component={EmotionAnalysisPage} />
      
      {/* Settings */}
      <ProtectedRoute path="/app/settings" component={SettingsPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
