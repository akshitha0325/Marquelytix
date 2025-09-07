import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Bot, Send, Sparkles, TrendingUp, AlertCircle, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIBrandAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI Brand Assistant. I can help you understand your brand performance, analyze sentiment trends, and provide actionable insights. What would you like to know about your brand today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ["/api/snapshots", "7d"],
    queryFn: () => api.getSnapshots("7d", "day"),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // Simulate AI response based on the message and current data
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes("sentiment") || lowerMessage.includes("feeling")) {
        const avgSentiment = comments.length > 0 
          ? comments.reduce((sum, c) => sum + c.sentimentScore, 0) / comments.length
          : 0;
        
        return `Your brand sentiment is currently at ${(avgSentiment * 100).toFixed(1)}%. ${
          avgSentiment > 0.7 ? "That's excellent! Your customers are very satisfied." :
          avgSentiment > 0.5 ? "That's good, but there's room for improvement." :
          "This needs attention. I recommend reviewing recent negative feedback."
        } You have ${comments.filter(c => c.sentimentLabel === "POSITIVE").length} positive mentions and ${comments.filter(c => c.sentimentLabel === "NEGATIVE").length} negative mentions.`;
      }
      
      if (lowerMessage.includes("mentions") || lowerMessage.includes("volume")) {
        return `You currently have ${comments.length} total mentions. ${
          comments.length > 50 ? "Your brand has good visibility online!" :
          comments.length > 20 ? "You're building good online presence." :
          "Consider increasing your marketing efforts to boost mentions."
        }`;
      }
      
      if (lowerMessage.includes("improve") || lowerMessage.includes("recommendation")) {
        const negativeComments = comments.filter(c => c.sentimentLabel === "NEGATIVE");
        if (negativeComments.length > 0) {
          return "Based on your negative feedback, I recommend: 1) Respond quickly to complaints within 2 hours, 2) Address common issues like wait times or service quality, 3) Follow up with dissatisfied customers personally. Would you like specific examples?";
        }
        return "Your brand is performing well! To maintain this: 1) Continue your current customer service approach, 2) Engage with positive reviewers to build loyalty, 3) Share success stories on social media.";
      }
      
      if (lowerMessage.includes("trends") || lowerMessage.includes("pattern")) {
        const recentPositive = comments.slice(0, 10).filter(c => c.sentimentLabel === "POSITIVE").length;
        const recentNegative = comments.slice(0, 10).filter(c => c.sentimentLabel === "NEGATIVE").length;
        
        return `Looking at recent trends: ${
          recentPositive > recentNegative ? "Positive sentiment is increasing! 📈" :
          recentNegative > recentPositive ? "Negative sentiment is rising. Let's address this. ⚠️" :
          "Sentiment is stable. Good consistency! 📊"
        } Most mentions come from ${comments.reduce((acc, c) => {
          acc[c.source] = (acc[c.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)}`;
      }
      
      // Default response with current stats
      return `I can help you with various brand insights! Here's a quick overview: You have ${comments.length} mentions with ${(comments.filter(c => c.sentimentLabel === "POSITIVE").length / Math.max(comments.length, 1) * 100).toFixed(0)}% positive sentiment. Ask me about sentiment analysis, mention trends, improvement suggestions, or specific time periods.`;
    },
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    try {
      const response = await sendMessageMutation.mutateAsync(inputValue.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I'm sorry, I'm having trouble processing your request right now. Please try asking about your brand sentiment, mentions, or performance trends.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How is my brand sentiment?",
    "What are the recent trends?",
    "How can I improve?",
    "Show me mention statistics",
    "What should I focus on?",
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Bot className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">AI Brand Assistant</h1>
          <Badge className="bg-green-100 text-green-800">NEW</Badge>
        </div>
        <p className="text-gray-600">Get instant insights about your brand performance and actionable recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-3xl px-4 py-2 rounded-lg ${
                        message.type === "user"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {sendMessageMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <p className="text-sm">AI is thinking...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your brand performance..."
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || sendMessageMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Questions */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputValue(question)}
                      disabled={sendMessageMutation.isPending}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Mentions</span>
                <span className="font-bold">{comments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Positive</span>
                <span className="font-bold text-green-600">
                  {comments.filter(c => c.sentimentLabel === "POSITIVE").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Negative</span>
                <span className="font-bold text-red-600">
                  {comments.filter(c => c.sentimentLabel === "NEGATIVE").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Sentiment</span>
                <span className="font-bold">
                  {comments.length > 0 
                    ? `${((comments.reduce((sum, c) => sum + c.sentimentScore, 0) / comments.length) * 100).toFixed(0)}%`
                    : "N/A"
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Sentiment Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Trend Detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span>Issue Identification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>Recommendations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
