import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth, db } from "@/lib/firebase";
import { Shield, LockKeyhole, Mail, ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof formSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      // Update user status in Firestore if profile exists
      if (userDoc.exists()) {
        await updateDoc(doc(db, "users", user.uid), {
          lastActive: serverTimestamp(),
          isOnline: true
        });
      }
      
      // Success message
      console.log("Sign in successful");
      toast.success("Signed in successfully!");
      
      // Wait longer to ensure auth state is fully processed
      setTimeout(() => {
        // Navigate to dashboard
        navigate("/dashboard");
        setIsLoading(false);
      }, 1500);
      
    } catch (error: any) {
      console.error("Error signing in:", error);
      setIsLoading(false);
      
      // Handle specific Firebase error codes
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error("Invalid email or password");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many failed login attempts. Please try again later");
      } else if (error.code === 'auth/network-request-failed') {
        toast.error("Network error. Please check your internet connection");
      } else {
        toast.error("Failed to sign in. Please check your credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-1/4 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <Shield className="h-12 w-12 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mt-4">NetZero</h1>
          <p className="text-slate-400 mt-2">Combat Climate Change Together</p>
        </div>
        
        <Card className="w-full border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Sign in</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input 
                            type="email" 
                            placeholder="john.doe@example.com" 
                            className="bg-slate-700/50 border-slate-600 text-white pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="bg-slate-700/50 border-slate-600 text-white pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="border-white" />
                  ) : (
                    <>
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-slate-700/50 pt-6">
            <div className="text-sm text-slate-400 text-center">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-blue-400 underline-offset-4 hover:underline">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;

