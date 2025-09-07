import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  ChevronDown, 
  Plus, 
  Settings,
  LogOut
} from "lucide-react";
import { TIME_RANGES, GROUP_OPTIONS } from "@/lib/types";
import SimulateCommentModal from "./simulate-comment-modal";

export default function HeaderBar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [selectedGroup, setSelectedGroup] = useState("day");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left: Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="text-gray-400 w-5 h-5" />
                </div>
                <Input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2"
                  placeholder="Search mentions, authors & domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Center: Time Range Controls */}
            <div className="flex items-center space-x-4 mx-8">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {TIME_RANGES.slice(0, -1).map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setSelectedTimeRange(range.value)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedTimeRange === range.value
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-600 hover:text-primary"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {GROUP_OPTIONS.map((group) => (
                  <button
                    key={group.value}
                    onClick={() => setSelectedGroup(group.value)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedGroup === group.value
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-600 hover:text-primary"
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Right: Actions & Profile */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowSimulateModal(true)}
                className="bg-brand-warning hover:bg-brand-warning/90 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Simulate Comment
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 bg-brand-surface px-3 py-2 rounded-xl hover:bg-brand-surface/80">
                    <span className="text-sm font-medium text-primary">Marquelytix</span>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.businessName || user?.username}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-gray-500">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/app/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <SimulateCommentModal 
        open={showSimulateModal} 
        onOpenChange={setShowSimulateModal} 
      />
    </>
  );
}
