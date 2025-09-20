import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link2, Plus, LogOut, Copy, ExternalLink, Edit, Trash2, BarChart3 } from "lucide-react";
import { URLTable } from "@/components/URLTable";
import { AnalyticsChart } from "@/components/AnalyticsChart";

interface URLData {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  title?: string;
}

const Dashboard = () => {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<URLData | null>(null);
  const { toast } = useToast();

  const [urls, setUrls] = useState<URLData[]>([
    {
      id: "1",
      originalUrl: "https://github.com/vercel/next.js",
      shortUrl: "https://short.ly/gh-next",
      clicks: 1247,
      createdAt: "2024-01-15T10:30:00Z",
      title: "Next.js Repository"
    },
    {
      id: "2", 
      originalUrl: "https://docs.react.dev/learn",
      shortUrl: "https://short.ly/react-docs",
      clicks: 892,
      createdAt: "2024-01-14T14:22:00Z",
      title: "React Documentation"
    },
    {
      id: "3",
      originalUrl: "https://tailwindcss.com/docs/installation",
      shortUrl: "https://short.ly/tw-install",
      clicks: 564,
      createdAt: "2024-01-13T09:15:00Z",
      title: "Tailwind CSS Installation"
    }
  ]);

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    // Simulate API call
    setTimeout(() => {
      const newUrl: URLData = {
        id: Date.now().toString(),
        originalUrl: longUrl,
        shortUrl: `https://short.ly/${customAlias || Math.random().toString(36).substr(2, 8)}`,
        clicks: 0,
        createdAt: new Date().toISOString(),
        title: customAlias || "New URL"
      };

      setUrls(prev => [newUrl, ...prev]);
      setLongUrl("");
      setCustomAlias("");
      setIsCreating(false);

      toast({
        title: "URL created successfully!",
        description: "Your shortened URL is ready to use.",
      });
    }, 1000);
  };

  const handleDeleteUrl = (id: string) => {
    setUrls(prev => prev.filter(url => url.id !== id));
    if (selectedUrl?.id === id) {
      setSelectedUrl(null);
    }
    toast({
      title: "URL deleted",
      description: "The URL has been removed from your dashboard.",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
    // In real app, clear auth state and redirect
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl glass-card glow-effect">
              <Link2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">URL Shortener</h1>
              <p className="text-muted-foreground">Manage your shortened URLs</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="transition-luxury hover:glow-effect"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* URL Creation Form */}
        <Card className="glass-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create New Short URL
            </CardTitle>
            <CardDescription>
              Transform your long URLs into short, shareable links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUrl} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="longUrl">Long URL</Label>
                  <Input
                    id="longUrl"
                    type="url"
                    placeholder="https://example.com/very-long-url"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    required
                    className="transition-luxury focus:glow-effect"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customAlias">Custom Alias (Optional)</Label>
                  <Input
                    id="customAlias"
                    type="text"
                    placeholder="my-custom-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="transition-luxury focus:glow-effect"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="transition-luxury glow-effect hover:shadow-luxury"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Short URL"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* URLs Table */}
        <Card className="glass-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Your URLs ({urls.length})
            </CardTitle>
            <CardDescription>
              Manage and track your shortened URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <URLTable
              urls={urls}
              onSelectUrl={setSelectedUrl}
              onDeleteUrl={handleDeleteUrl}
              selectedUrl={selectedUrl}
            />
          </CardContent>
        </Card>

        {/* Analytics Chart */}
        {selectedUrl && (
          <Card className="glass-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics for {selectedUrl.title || selectedUrl.shortUrl}
              </CardTitle>
              <CardDescription>
                Click analytics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart selectedUrl={selectedUrl} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;