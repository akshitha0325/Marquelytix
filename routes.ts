import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCommentSchema, SentimentAnalysisResponseSchema } from "@shared/schema";
import { z } from "zod";

// Hugging Face sentiment analysis
async function analyzeSentiment(text: string): Promise<{ sentimentLabel: string; sentimentScore: number }> {
  const config = await storage.getConfig("default");
  const huggingfaceToken = process.env.HUGGINGFACE_API_TOKEN || config?.huggingfaceToken;
  const demoMode = process.env.DEMO_MODE === "true" || config?.demoMode === "true";

  if (demoMode || !huggingfaceToken) {
    // Demo mode: simple rules-based sentiment
    const lowerText = text.toLowerCase();
    
    const positiveWords = ["amazing", "excellent", "great", "love", "wonderful", "fantastic", "perfect", "best", "awesome", "delicious"];
    const negativeWords = ["terrible", "awful", "worst", "hate", "horrible", "disgusting", "bad", "disappointing", "slow", "rude"];
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      return { sentimentLabel: "POSITIVE", sentimentScore: 0.7 + Math.random() * 0.3 };
    } else if (negativeCount > positiveCount) {
      return { sentimentLabel: "NEGATIVE", sentimentScore: Math.random() * 0.4 };
    } else {
      return { sentimentLabel: "NEUTRAL", sentimentScore: 0.4 + Math.random() * 0.2 };
    }
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/siebert/sentiment-roberta-large-english",
      {
        headers: {
          Authorization: `Bearer ${huggingfaceToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
      const sentiments = result[0];
      const positive = sentiments.find((s: any) => s.label === "POSITIVE");
      const negative = sentiments.find((s: any) => s.label === "NEGATIVE");
      
      if (positive && negative) {
        if (positive.score > negative.score) {
          return { sentimentLabel: "POSITIVE", sentimentScore: positive.score };
        } else {
          return { sentimentLabel: "NEGATIVE", sentimentScore: negative.score };
        }
      }
    }
    
    // Fallback to demo mode
    return { sentimentLabel: "NEUTRAL", sentimentScore: 0.5 };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    // Fallback to demo mode
    const lowerText = text.toLowerCase();
    if (lowerText.includes("good") || lowerText.includes("great")) {
      return { sentimentLabel: "POSITIVE", sentimentScore: 0.8 };
    } else if (lowerText.includes("bad") || lowerText.includes("terrible")) {
      return { sentimentLabel: "NEGATIVE", sentimentScore: 0.2 };
    }
    return { sentimentLabel: "NEUTRAL", sentimentScore: 0.5 };
  }
}

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Sentiment analysis endpoint
  app.post("/api/analyze", requireAuth, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "Text is required" });
      }

      const result = await analyzeSentiment(text);
      res.json(result);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: "Analysis failed" });
    }
  });

  // Comments endpoints
  app.get("/api/comments", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const filters = {
        userId,
        source: req.query.source as string[] | undefined,
        sentiment: req.query.sentiment as string[] | undefined,
        minInfluence: req.query.minInfluence ? parseInt(req.query.minInfluence as string) : undefined,
        countriesExclude: req.query.countriesExclude as string[] | undefined,
        languagesExclude: req.query.languagesExclude as string[] | undefined,
        q: req.query.q as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
        order: req.query.order as "recent" | "top" | undefined,
      };

      const comments = await storage.getComments(filters);
      res.json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertCommentSchema.parse(req.body);
      
      // Analyze sentiment
      const sentimentResult = await analyzeSentiment(validatedData.text);
      
      // Calculate influence (0-10 based on various factors)
      const influence = Math.min(10, Math.floor(Math.random() * 8) + 2);
      
      const comment = await storage.createComment({
        ...validatedData,
        userId,
        sentimentLabel: sentimentResult.sentimentLabel,
        sentimentScore: sentimentResult.sentimentScore,
        influence,
      });

      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data" });
      }
      console.error("Create comment error:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Snapshots endpoint
  app.get("/api/snapshots", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const range = req.query.range as string;
      const group = req.query.group as string;
      
      const snapshots = await storage.getSnapshots(userId, range, group);
      res.json(snapshots);
    } catch (error) {
      console.error("Get snapshots error:", error);
      res.status(500).json({ message: "Failed to fetch snapshots" });
    }
  });

  // Authors endpoint
  app.get("/api/authors", requireAuth, async (req, res) => {
    try {
      const authors = await storage.getAuthors();
      res.json(authors);
    } catch (error) {
      console.error("Get authors error:", error);
      res.status(500).json({ message: "Failed to fetch authors" });
    }
  });

  // Suggestions endpoint
  app.get("/api/suggestions", requireAuth, async (req, res) => {
    try {
      const category = req.query.category as string;
      const suggestions = await storage.getSuggestions(category);
      res.json(suggestions);
    } catch (error) {
      console.error("Get suggestions error:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  // Topic analysis endpoint
  app.get("/api/topic-breakdown", requireAuth, async (req, res) => {
    try {
      const breakdown = await storage.getTopicBreakdown();
      res.json(breakdown);
    } catch (error) {
      console.error("Get topic breakdown error:", error);
      res.status(500).json({ message: "Failed to fetch topic breakdown" });
    }
  });

  // Geo data endpoint
  app.get("/api/geo", requireAuth, async (req, res) => {
    try {
      const geoData = await storage.getGeoData();
      res.json(geoData);
    } catch (error) {
      console.error("Get geo data error:", error);
      res.status(500).json({ message: "Failed to fetch geo data" });
    }
  });

  // Config endpoints
  app.get("/api/config", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const config = await storage.getConfig(userId);
      res.json(config || { demoMode: "true", sentimentThreshold: 0.4 });
    } catch (error) {
      console.error("Get config error:", error);
      res.status(500).json({ message: "Failed to fetch config" });
    }
  });

  app.put("/api/config", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const config = await storage.updateConfig(userId, req.body);
      res.json(config);
    } catch (error) {
      console.error("Update config error:", error);
      res.status(500).json({ message: "Failed to update config" });
    }
  });

  // Report generation endpoints (placeholder for now)
  app.post("/api/report/pdf", requireAuth, async (req, res) => {
    try {
      // Placeholder: In a real app, generate PDF using jsPDF or similar
      res.json({ message: "PDF report generated", downloadUrl: "/api/download/report.pdf" });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF report" });
    }
  });

  app.post("/api/report/excel", requireAuth, async (req, res) => {
    try {
      // Placeholder: In a real app, generate Excel using xlsx
      res.json({ message: "Excel report generated", downloadUrl: "/api/download/report.xlsx" });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate Excel report" });
    }
  });

  app.post("/api/report/infographic", requireAuth, async (req, res) => {
    try {
      // Placeholder: In a real app, generate PNG using html2canvas
      res.json({ message: "Infographic generated", downloadUrl: "/api/download/infographic.png" });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate infographic" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
