import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  BarChart3,
  Brain,
  TrendingUp,
  Bot,
  Tags,
  Scale,
  Globe,
  Star,
  Mail,
  FileText,
  FileSpreadsheet,
  Image,
  Map,
  Users,
  Clock,
  Heart,
  Settings,
} from "lucide-react";

const navigation = [
  // Main Navigation
  {
    name: "Mentions",
    href: "/app/mentions",
    icon: MessageCircle,
    current: false,
  },
  {
    name: "Summary",
    href: "/app/summary", 
    icon: BarChart3,
    current: false,
  },
  {
    name: "AI Insights",
    href: "/app/ai-insights",
    icon: Brain,
    current: false,
  },
  {
    name: "Analysis",
    href: "/app/analysis",
    icon: TrendingUp,
    current: false,
  },
  {
    name: "AI Brand Assistant",
    href: "/app/ai-brand-assistant",
    icon: Bot,
    current: false,
    badge: "NEW",
    badgeVariant: "secondary" as const,
  },
  {
    name: "AI Topic Analysis",
    href: "/app/ai-topic-analysis",
    icon: Tags,
    current: false,
  },
  {
    name: "Comparison",
    href: "/app/comparison",
    icon: Scale,
    current: false,
  },
  {
    name: "Sources",
    href: "/app/sources",
    icon: Globe,
    current: false,
  },
  {
    name: "Influencers",
    href: "/app/influencers",
    icon: Star,
    current: false,
  },
];

const reports = [
  {
    name: "Email",
    href: "/app/reports/email",
    icon: Mail,
  },
  {
    name: "PDF",
    href: "/app/reports/pdf",
    icon: FileText,
  },
  {
    name: "Excel",
    href: "/app/reports/excel",
    icon: FileSpreadsheet,
  },
  {
    name: "Infographic",
    href: "/app/reports/infographic",
    icon: Image,
  },
];

const lab = [
  {
    name: "Geo Analysis",
    href: "/app/geo-analysis",
    icon: Map,
  },
  {
    name: "Influencer Analysis", 
    href: "/app/influencer-analysis",
    icon: Users,
  },
  {
    name: "Hot Hours",
    href: "/app/hot-hours",
    icon: Clock,
  },
  {
    name: "Emotion Analysis",
    href: "/app/emotion-analysis",
    icon: Heart,
  },
];

export default function SidebarNav() {
  const [location] = useLocation();

  return (
    <nav className="w-64 bg-white shadow-sm h-screen sticky top-16 overflow-y-auto transform translate-x-0 transition-transform duration-200 ease-in-out z-20">
      <div className="p-4 space-y-2">
        {/* Main Navigation */}
        <div className="mb-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href === "/app/mentions" && location === "/app");
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.badgeVariant}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </a>
              </Link>
            );
          })}
        </div>

        {/* Reports Section */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Reports
          </div>
          {reports.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>

        {/* Lab Beta Section */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center">
            Lab{" "}
            <Badge variant="secondary" className="ml-2 text-xs">
              Beta
            </Badge>
          </div>
          {lab.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
