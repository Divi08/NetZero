
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-8 flex items-center justify-between border-b">
        <div className="text-2xl font-bold text-primary">NetZero</div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/sign-in">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Combat Climate Change Together
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl">
          Join our community of investigators working to identify and solve critical global warming issues with the help of AI-powered tools.
        </p>
        <div className="space-y-4 w-full max-w-md">
          <Button size="lg" className="w-full py-6 text-lg" asChild>
            <Link to="/sign-up">Start Now</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Join thousands of investigators already making a difference
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="rounded-lg p-6 border bg-card shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Investigate Cases</h3>
            <p className="text-muted-foreground">Collaborate on real climate issues using data from global sources.</p>
          </div>
          <div className="rounded-lg p-6 border bg-card shadow-sm">
            <h3 className="text-xl font-semibold mb-2">AI Assistance</h3>
            <p className="text-muted-foreground">Get insights from AI trained on climate policies and scientific data.</p>
          </div>
          <div className="rounded-lg p-6 border bg-card shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Make An Impact</h3>
            <p className="text-muted-foreground">Turn your investigations into actionable evidence for real change.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 border-t mt-20">
        <div className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NetZero Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;

