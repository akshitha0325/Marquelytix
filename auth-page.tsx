import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Redirect if already logged in
  if (user) {
    setLocation("/app");
    return null;
  }

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      businessName: "",
    },
  });

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        setLocation("/app");
      },
    });
  };

  const onRegister = (data: RegisterForm) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        setLocation("/app");
      },
    });
  };

  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Left Column - Forms */}
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-primary">Marquelytix</span>
              </div>
              <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
              <p className="text-gray-600">Monitor customer sentiment in real-time</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          {...loginForm.register("email")}
                          className="mt-1"
                        />
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-destructive mt-1">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          {...loginForm.register("password")}
                          className="mt-1"
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-destructive mt-1">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Login
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Get started with Marquelytix today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div>
                        <Label htmlFor="register-business">Business Name</Label>
                        <Input
                          id="register-business"
                          placeholder="Your business name"
                          {...registerForm.register("businessName")}
                          className="mt-1"
                        />
                        {registerForm.formState.errors.businessName && (
                          <p className="text-sm text-destructive mt-1">
                            {registerForm.formState.errors.businessName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="register-username">Username</Label>
                        <Input
                          id="register-username"
                          placeholder="Choose a username"
                          {...registerForm.register("username")}
                          className="mt-1"
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-destructive mt-1">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          {...registerForm.register("email")}
                          className="mt-1"
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-destructive mt-1">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          {...registerForm.register("password")}
                          className="mt-1"
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-destructive mt-1">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="register-confirm-password">Confirm Password</Label>
                        <Input
                          id="register-confirm-password"
                          type="password"
                          placeholder="••••••••"
                          {...registerForm.register("confirmPassword")}
                          className="mt-1"
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-destructive mt-1">
                            {registerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Create Account
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Hero */}
          <div className="hidden lg:block">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-primary mb-6">
                Transform Customer Feedback Into Business Growth
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of small businesses using AI-powered sentiment analysis 
                to improve customer satisfaction and boost sales.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-brand-success mb-2">94%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Monitoring</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-secondary mb-2">10min</div>
                  <div className="text-sm text-gray-600">Setup Time</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-brand-warning mb-2">12+</div>
                  <div className="text-sm text-gray-600">Platforms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
