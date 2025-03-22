
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth } from "@/lib/firebase";
import { Shield, AlertTriangle, Check, ArrowRight, FileText, Briefcase, Search } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  education: z.string().min(2, "Please enter your educational background"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof formSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      education: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Create the user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Update the user profile with additional information
      await updateProfile(userCredential.user, {
        displayName: `${data.firstName} ${data.lastName}`,
      });
      
      // Store additional user data if needed
      // In a real app, you might store this in Firestore or another database
      
      console.log("User created successfully:", userCredential.user);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating account:", error);
      
      // Handle specific Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email already in use. Try signing in instead.");
      } else {
        toast.error(`Failed to create account: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-1/4 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-6xl grid md:grid-cols-5 gap-8 items-center relative z-10">
        {/* Left side: Info about the platform */}
        <div className="hidden md:flex md:col-span-2 flex-col text-white space-y-8 p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-10 w-10 text-blue-400 mr-4" />
            <h1 className="text-3xl font-bold">NetZero</h1>
          </div>
          
          <h2 className="text-2xl font-bold">Combat Climate Change Together</h2>
          <p className="text-slate-300">Join our platform to help identify, investigate, and combat climate change.</p>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-start">
              <div className="mt-1 bg-blue-500/20 p-2 rounded-full">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Investigate</h3>
                <p className="text-sm text-slate-400">Access tools and resources to conduct research on corporate activities</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 bg-blue-500/20 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Document</h3>
                <p className="text-sm text-slate-400">Compile evidence and create detailed reports on corporate wrongdoing</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 bg-blue-500/20 p-2 rounded-full">
                <Briefcase className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">Act</h3>
                <p className="text-sm text-slate-400">Collaborate with others to take action against corporate crimes</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side: Sign up form */}
        <Card className="w-full md:col-span-3 border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
            <CardDescription className="text-slate-400">
              Join ECHO to help expose corporate environmental crimes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Education</FormLabel>
                      <FormControl>
                        <Input placeholder="Degree, Field of Study" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
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
                        <Input type="password" placeholder="••••••••" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-slate-700/30 rounded-lg p-3 flex items-start space-x-3 text-sm">
                  <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300">
                    By signing up, you agree to our terms and acknowledge that your activities may be used in legal proceedings against corporate environmental crimes.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="border-white" />
                  ) : (
                    <>
                      Create Account <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center border-t border-slate-700/50 pt-6">
            <div className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-blue-400 underline-offset-4 hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;

