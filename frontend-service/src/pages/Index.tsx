import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link2, Zap, Shield, BarChart3, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl glass-card mb-8 glow-effect">
            <Link2 className="w-10 h-10 text-primary" />
          </div>

          {/* Hero Text */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Shorten URLs
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Track Everything
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your long URLs into powerful, trackable short links with detailed analytics and professional management tools.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6 transition-luxury glow-effect hover:shadow-luxury group">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 transition-luxury hover:glow-effect">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <div className="glass-card p-6 rounded-2xl border border-border/50 transition-luxury hover:glow-effect">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Create shortened URLs instantly with our optimized infrastructure.</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl border border-border/50 transition-luxury hover:glow-effect">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
              <p className="text-muted-foreground">Track clicks, analyze traffic patterns, and measure your success.</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl border border-border/50 transition-luxury hover:glow-effect">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-muted-foreground">Enterprise-grade security with 99.9% uptime guarantee.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
