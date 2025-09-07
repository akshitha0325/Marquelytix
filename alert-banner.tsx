import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useState } from "react";

interface AlertBannerProps {
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export default function AlertBanner({ 
  type, 
  title, 
  message, 
  dismissible = false, 
  onDismiss 
}: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "bg-green-50 border-green-200 text-green-800",
          icon: CheckCircle,
          iconColor: "text-green-600",
        };
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200 text-yellow-800",
          icon: AlertTriangle,
          iconColor: "text-yellow-600",
        };
      case "error":
        return {
          container: "bg-red-50 border-red-200 text-red-800",
          icon: AlertCircle,
          iconColor: "text-red-600",
        };
      default:
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: Info,
          iconColor: "text-blue-600",
        };
    }
  };

  const styles = getAlertStyles();
  const Icon = styles.icon;

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-6 ${styles.container}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm mt-1">{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
