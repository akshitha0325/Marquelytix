import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPIStatProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export default function KPIStat({ 
  title, 
  value, 
  change, 
  trend = "neutral", 
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10"
}: KPIStatProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-primary">{value}</p>
            {change && (
              <p className={`text-sm ${getTrendColor()}`}>
                {change} vs last period
              </p>
            )}
          </div>
          {Icon && (
            <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
              <Icon className={`${iconColor} w-6 h-6`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
