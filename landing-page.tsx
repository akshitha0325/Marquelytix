import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, 
  Shield, 
  TrendingUp, 
  DollarSign,
  ChevronDown,
  Twitter,
  Linkedin,
  Facebook
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Redirect if already logged in
  if (user) {
    setLocation("/app");
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-primary">Marquelytix</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-600 hover:text-primary transition-colors">About</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Testimonials</a>
              <a href="#faq" className="text-gray-600 hover:text-primary transition-colors">FAQ</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">Contact</a>
            </nav>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <Link href="/auth">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-surface to-white">
        <div className="max-w-7xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            Understand your customers <br />
            <span className="text-secondary">in real time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Perfect for cafés, salons, and local shops. Monitor customer sentiment across all platforms 
            and get AI-powered insights to boost repeat sales and prevent revenue loss.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Goals */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering small businesses with enterprise-level sentiment monitoring tools
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card animate-slide-up">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-brand-success rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">Build Trust</h3>
                <p className="text-gray-600">Monitor and respond to customer feedback across all platforms to build lasting relationships.</p>
              </CardContent>
            </Card>
            <Card className="glass-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-brand-warning rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">Prevent Revenue Loss</h3>
                <p className="text-gray-600">Get instant alerts when sentiment drops, allowing you to address issues before they impact sales.</p>
              </CardContent>
            </Card>
            <Card className="glass-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">Affordable Pricing</h3>
                <p className="text-gray-600">Enterprise features at small business prices. No hidden costs or complicated tiers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple setup, powerful insights in three steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Connect Your Sources</h3>
              <p className="text-gray-600">Link your Google reviews, social media, and other platforms or manually enter feedback.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">AI Analyzes Everything</h3>
              <p className="text-gray-600">Our advanced AI processes all feedback and identifies sentiment, trends, and key insights.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Get Alerts & Take Action</h3>
              <p className="text-gray-600">Receive instant notifications and AI-powered suggestions to improve customer satisfaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 mb-4 italic">"Marquelytix helped us catch a service issue before it affected more customers. Our ratings improved by 40% in just two months!"</p>
                <div className="text-center">
                  <h4 className="font-semibold text-primary">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Owner, Corner Café</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 mb-4 italic">"The AI insights showed us exactly which services customers love most. We've increased our booking rate by 25%."</p>
                <div className="text-center">
                  <h4 className="font-semibold text-primary">Maria Rodriguez</h4>
                  <p className="text-sm text-gray-500">Owner, Bella Hair Studio</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 mb-4 italic">"Finally, a tool that makes sense for small businesses. The alerts saved us from a potential PR crisis."</p>
                <div className="text-center">
                  <h4 className="font-semibold text-primary">David Chen</h4>
                  <p className="text-sm text-gray-500">Owner, Chen's Kitchen</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">How quickly can I get set up?</h3>
                <p className="text-gray-600">Setup takes less than 10 minutes. Just connect your review sources and we'll start analyzing immediately.</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">What platforms do you support?</h3>
                <p className="text-gray-600">We support Google Reviews, Facebook, Instagram, Twitter/X, TikTok, and more. You can also manually add feedback from any source.</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">How accurate is the sentiment analysis?</h3>
                <p className="text-gray-600">Our AI achieves 94% accuracy using advanced language models specifically trained for customer feedback analysis.</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">Is my data secure and private?</h3>
                <p className="text-gray-600">Absolutely. We use enterprise-grade encryption and never share your data with third parties. You own all your data.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-surface">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">Have questions? We'd love to hear from you.</p>
          </div>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-8">
              <form className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" className="mt-2" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={5} placeholder="Tell us how we can help..." className="mt-2" />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-primary w-5 h-5" />
                </div>
                <span className="text-xl font-bold">Marquelytix</span>
              </div>
              <p className="text-gray-300">Real-time customer sentiment monitoring for small businesses.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Marquelytix. All rights reserved. Version 1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
