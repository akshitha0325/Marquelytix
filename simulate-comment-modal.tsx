import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { SOURCES } from "@/lib/types";
import { Plus } from "lucide-react";

interface SimulateCommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SimulateCommentModal({ open, onOpenChange }: SimulateCommentModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    text: "",
    source: "manual",
    authorName: "",
    country: "US",
    lang: "en",
  });

  const simulateCommentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First create author if name provided
      let authorId: string | undefined;
      if (data.authorName.trim()) {
        const author = await api.createComment({
          name: data.authorName,
          platform: data.source,
        });
        authorId = author.id;
      }

      // Create comment
      return api.createComment({
        text: data.text,
        source: data.source,
        authorId,
        country: data.country,
        lang: data.lang,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/snapshots"] });
      toast({
        title: "Comment Simulated",
        description: "Your simulated comment has been added and analyzed.",
      });
      setFormData({
        text: "",
        source: "manual",
        authorName: "",
        country: "US",
        lang: "en",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Simulation Failed",
        description: "Failed to simulate comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter comment text.",
        variant: "destructive",
      });
      return;
    }
    simulateCommentMutation.mutate(formData);
  };

  const sampleComments = [
    "Amazing service! The staff was incredibly helpful and friendly. Will definitely be back!",
    "The coffee here is absolutely delicious. Love the cozy atmosphere and free WiFi.",
    "Had to wait 20 minutes for my order. The food was okay but nothing special.",
    "Terrible experience. Rude staff and overpriced items. Won't be returning.",
    "Great place for meetings. Quiet environment and excellent customer service.",
    "The new menu items are fantastic! Especially loving the seasonal specials.",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Simulate New Comment
          </DialogTitle>
          <DialogDescription>
            Add a simulated comment for testing and demonstration purposes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="text">Comment Text *</Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Enter the comment text..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source">Source</Label>
              <Select 
                value={formData.source} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="authorName">Author Name</Label>
              <Input
                id="authorName"
                value={formData.authorName}
                onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lang">Language</Label>
              <Select 
                value={formData.lang} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, lang: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm text-gray-600">Quick Templates:</Label>
            <div className="grid grid-cols-1 gap-1 mt-2">
              {sampleComments.slice(0, 3).map((comment, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, text: comment }))}
                  className="text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded border text-gray-700 transition-colors"
                >
                  {comment.slice(0, 60)}...
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={simulateCommentMutation.isPending}
              className="flex-1"
            >
              {simulateCommentMutation.isPending ? "Analyzing..." : "Simulate Comment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
