import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  User, 
  InsertUser, 
  Comment, 
  InsertComment, 
  Author, 
  InsertAuthor, 
  Snapshot, 
  Config,
  SentimentAnalysisResponse,
  Suggestion,
  TopicBreakdown,
  GeoPoint
} from "@shared/schema";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getComments(filters?: {
    userId?: string;
    source?: string[];
    sentiment?: string[];
    minInfluence?: number;
    countriesExclude?: string[];
    languagesExclude?: string[];
    q?: string;
    dateFrom?: string;
    dateTo?: string;
    order?: "recent" | "top";
  }): Promise<Comment[]>;
  
  createComment(comment: InsertComment & { userId: string; sentimentLabel: string; sentimentScore: number; influence: number }): Promise<Comment>;
  
  getAuthors(): Promise<Author[]>;
  createAuthor(author: InsertAuthor): Promise<Author>;
  
  getSnapshots(userId: string, range?: string, group?: string): Promise<Snapshot[]>;
  
  getConfig(userId: string): Promise<Config | undefined>;
  updateConfig(userId: string, config: Partial<Config>): Promise<Config>;
  
  getSuggestions(category?: string): Promise<Suggestion[]>;
  getTopicBreakdown(): Promise<TopicBreakdown[]>;
  getGeoData(): Promise<GeoPoint[]>;
  
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private comments: Map<string, Comment>;
  private authors: Map<string, Author>;
  private snapshots: Map<string, Snapshot>;
  private configs: Map<string, Config>;
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.comments = new Map();
    this.authors = new Map();
    this.snapshots = new Map();
    this.configs = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    this.loadSeedData();
  }

  private loadSeedData() {
    try {
      const seedPath = join(process.cwd(), "data", "seed.json");
      if (existsSync(seedPath)) {
        const seedData = JSON.parse(readFileSync(seedPath, "utf-8"));
        
        // Load authors
        if (seedData.authors) {
          seedData.authors.forEach((author: Author) => {
            this.authors.set(author.id, author);
          });
        }
        
        // Load comments
        if (seedData.comments) {
          seedData.comments.forEach((comment: Comment) => {
            this.comments.set(comment.id, comment);
          });
        }
      }
    } catch (error) {
      console.log("No seed data found or error loading seed data");
    }
  }

  private saveData() {
    try {
      const dataDir = join(process.cwd(), "data");
      const dataPath = join(dataDir, "storage.json");
      
      const data = {
        users: Array.from(this.users.values()),
        comments: Array.from(this.comments.values()),
        authors: Array.from(this.authors.values()),
        snapshots: Array.from(this.snapshots.values()),
        configs: Array.from(this.configs.values()),
      };
      
      writeFileSync(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    this.saveData();
    return user;
  }

  async getComments(filters?: {
    userId?: string;
    source?: string[];
    sentiment?: string[];
    minInfluence?: number;
    countriesExclude?: string[];
    languagesExclude?: string[];
    q?: string;
    dateFrom?: string;
    dateTo?: string;
    order?: "recent" | "top";
  }): Promise<Comment[]> {
    let comments = Array.from(this.comments.values());

    if (filters) {
      if (filters.userId) {
        comments = comments.filter(c => c.userId === filters.userId);
      }
      if (filters.source && filters.source.length > 0) {
        comments = comments.filter(c => filters.source!.includes(c.source));
      }
      if (filters.sentiment && filters.sentiment.length > 0) {
        comments = comments.filter(c => filters.sentiment!.includes(c.sentimentLabel));
      }
      if (filters.minInfluence !== undefined) {
        comments = comments.filter(c => (c.influence || 0) >= filters.minInfluence!);
      }
      if (filters.countriesExclude && filters.countriesExclude.length > 0) {
        comments = comments.filter(c => !filters.countriesExclude!.includes(c.country || ""));
      }
      if (filters.languagesExclude && filters.languagesExclude.length > 0) {
        comments = comments.filter(c => !filters.languagesExclude!.includes(c.lang || ""));
      }
      if (filters.q) {
        const query = filters.q.toLowerCase();
        comments = comments.filter(c => 
          c.text.toLowerCase().includes(query) ||
          (c.authorId && this.authors.get(c.authorId)?.name.toLowerCase().includes(query))
        );
      }
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        comments = comments.filter(c => c.createdAt && new Date(c.createdAt) >= fromDate);
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        comments = comments.filter(c => c.createdAt && new Date(c.createdAt) <= toDate);
      }
    }

    // Sort comments
    if (filters?.order === "top") {
      comments.sort((a, b) => (b.influence || 0) - (a.influence || 0));
    } else {
      comments.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });
    }

    return comments;
  }

  async createComment(comment: InsertComment & { 
    userId: string; 
    sentimentLabel: string; 
    sentimentScore: number; 
    influence: number 
  }): Promise<Comment> {
    const id = randomUUID();
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, newComment);
    this.saveData();
    return newComment;
  }

  async getAuthors(): Promise<Author[]> {
    return Array.from(this.authors.values());
  }

  async createAuthor(insertAuthor: InsertAuthor): Promise<Author> {
    const id = randomUUID();
    const author: Author = { ...insertAuthor, id };
    this.authors.set(id, author);
    this.saveData();
    return author;
  }

  async getSnapshots(userId: string, range?: string, group?: string): Promise<Snapshot[]> {
    // Generate snapshots from comments data
    const userComments = await this.getComments({ userId });
    const snapshots: Snapshot[] = [];
    
    // Group comments by time period
    const now = new Date();
    const days = range === "1d" ? 1 : range === "7d" ? 7 : 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayComments = userComments.filter(c => {
        if (!c.createdAt) return false;
        const commentDate = new Date(c.createdAt);
        commentDate.setHours(0, 0, 0, 0);
        return commentDate.getTime() === date.getTime();
      });

      const mentions = dayComments.length;
      const reach = dayComments.reduce((sum, c) => sum + (c.influence || 0) * 100, 0);
      const avgScore = mentions > 0 ? dayComments.reduce((sum, c) => sum + c.sentimentScore, 0) / mentions : 0;
      const pos = dayComments.filter(c => c.sentimentLabel === "POSITIVE").length;
      const neu = dayComments.filter(c => c.sentimentLabel === "NEUTRAL").length;
      const neg = dayComments.filter(c => c.sentimentLabel === "NEGATIVE").length;

      snapshots.push({
        id: randomUUID(),
        userId,
        ts: date,
        mentions,
        reach,
        avgScore,
        pos,
        neu,
        neg,
      });
    }

    return snapshots;
  }

  async getConfig(userId: string): Promise<Config | undefined> {
    return Array.from(this.configs.values()).find(c => c.userId === userId);
  }

  async updateConfig(userId: string, configUpdate: Partial<Config>): Promise<Config> {
    const existing = await this.getConfig(userId);
    const config: Config = {
      id: existing?.id || randomUUID(),
      userId,
      huggingfaceToken: configUpdate.huggingfaceToken || existing?.huggingfaceToken || null,
      demoMode: configUpdate.demoMode || existing?.demoMode || "true",
      sentimentThreshold: configUpdate.sentimentThreshold || existing?.sentimentThreshold || 0.4,
    };
    
    this.configs.set(config.id, config);
    this.saveData();
    return config;
  }

  async getSuggestions(category?: string): Promise<Suggestion[]> {
    const allSuggestions: Suggestion[] = [
      {
        id: "1",
        category: "POSITIVE",
        title: "Amplify Success",
        body: "Share customer success stories on social media to build momentum."
      },
      {
        id: "2",
        category: "POSITIVE",
        title: "Reward Loyalty",
        body: "Create a loyalty program for customers who leave positive reviews."
      },
      {
        id: "3",
        category: "NEUTRAL",
        title: "Follow Up",
        body: "Reach out to neutral customers with a personalized thank you and feedback request."
      },
      {
        id: "4",
        category: "NEUTRAL",
        title: "Improve Experience",
        body: "Analyze neutral feedback for specific areas of improvement."
      },
      {
        id: "5",
        category: "NEGATIVE",
        title: "Immediate Response",
        body: "Respond to negative feedback within 2 hours with a genuine apology and solution."
      },
      {
        id: "6",
        category: "NEGATIVE",
        title: "Process Improvement",
        body: "Review internal processes that may be causing customer dissatisfaction."
      },
    ];

    if (category) {
      return allSuggestions.filter(s => s.category === category);
    }
    return allSuggestions;
  }

  async getTopicBreakdown(): Promise<TopicBreakdown[]> {
    return [
      { label: "Service Quality", count: 45, score: 0.82 },
      { label: "Product Quality", count: 38, score: 0.76 },
      { label: "Staff Friendliness", count: 32, score: 0.89 },
      { label: "Wait Times", count: 28, score: 0.34 },
      { label: "Cleanliness", count: 22, score: 0.91 },
      { label: "Value for Money", count: 19, score: 0.67 },
    ];
  }

  async getGeoData(): Promise<GeoPoint[]> {
    return [
      { country: "US", mentions: 342, reach: 15600, interactions: 1240 },
      { country: "UK", mentions: 89, reach: 4200, interactions: 380 },
      { country: "CA", mentions: 67, reach: 3100, interactions: 290 },
      { country: "AU", mentions: 45, reach: 2200, interactions: 180 },
      { country: "IN", mentions: 156, reach: 7800, interactions: 620 },
    ];
  }
}

export const storage = new MemStorage();
