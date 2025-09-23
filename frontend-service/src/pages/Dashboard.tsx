import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Link2,
  Plus,
  LogOut,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  BarChart3,
} from "lucide-react";
import { URLTable } from "@/components/URLTable";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
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
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<URLData | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editUrlValue, setEditUrlValue] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [refresh, setRefresh] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [urls, setUrls] = useState<URLData[]>([
    {
      id: "1",
      originalUrl: "",
      shortUrl: "",
      clicks: 0,
      createdAt: "2024-01-15T10:30:00Z",
      title: "",
    },
  ]);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await axios.get(`${API_URL}/url/get-urls`, {
          withCredentials: true,
        });
        console.log("Response : ", response.data);
        const urlData = response.data.message;
        const sortedUrlData = urlData.sort(
          (a: URLData, b: URLData) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setUrls(sortedUrlData);
      } catch (e) {
        console.log("Error : ", e.message);
      }
    };

    fetchUrls();
  }, [refresh]);

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    console.log(customAlias);

    // Simulate API call
    try {
      let payload, url;
      if (customAlias === "") {
        console.log("No custom alias");
        payload = {
          url: longUrl,
          title: title,
        };
        url = `${API_URL}/url`;
      } else {
        console.log("Create custom alias");
        payload = {
          redirectUrl: longUrl,
          title: title,
          customId: customAlias,
        };
        url = `${API_URL}/url/custom`;
      }
      const response = await axios.post(url, payload, {
        withCredentials: true,
      });
      console.log(response.data);
      if (response.data.success) {
        setRefresh((prev) => !prev);
        toast({
          title: "URL created successfully!",
          description: "Your shortened URL is ready to use.",
        });
      } else {
        toast({
          title: "Failed to shorten the URL",
          description: response.data.error.message,
          variant: "destructive",
        });
      }
      setIsCreating(false);
    } catch (e) {
      console.log("Error : ", e.message);
    }
    setCustomAlias("");
    setTitle("");
    setLongUrl("");
  };

  const handleEditUrl = async (id: string) => {
    console.log("Edit Url - ", id);
    setOpenEditModal(true);
    setSelectedId(id);
  };

  const handleUpdateUrl = async (url: string) => {
    console.log("Want to edit = ", selectedId, url);
    try {
      const response = await axios.put(
        `${API_URL}/url/updateUrl`,
        {
          shortId: selectedId,
          newUrl: url,
        },
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setRefresh((prev) => !prev);
        toast({
          title: "URL updated",
          description: "The Original URL is updated",
        });
      } else {
        toast({
          title: "Failed to update",
          description: "The Original URL is not updated",
          variant: "destructive",
        });
      }
      console.log(response.data);
      setOpenEditModal(false);
    } catch (e) {
      console.log("Error : ", e.message);
    }
  };

  const handleRemoveUrl = (id: string) => {
    console.log("Removing");
    setOpenDeleteModal(true);
    setSelectedId(id);
  };

  const handleDeleteUrl = async () => {
    console.log("Deleting call");
    try {
      const response = await axios.delete(`${API_URL}/url/delete`, {
        data: {
          shortId: selectedId,
        },
        withCredentials: true,
      });
      if (response.data.success) {
        setUrls((prev) => prev.filter((url) => url.id !== selectedId));
        if (selectedUrl?.id === selectedId) {
          setSelectedUrl(null);
        }
        setRefresh((prev) => !prev);
        toast({
          title: "URL deleted",
          description: "The URL has been removed from your dashboard.",
        });
      } else {
        toast({
          title: "URL deletion failed",
          description: response.data.error.message,
          variant: "destructive",
        });
      }
      setOpenDeleteModal(false);
    } catch (e) {
      console.log("Error : ", e.message);
    }
  };

  const handleLogout = () => {
    // In real app, clear auth state and redirect
    const logoutRequest = async () => {
      try {
        const response = await axios.post(`${API_URL}/auth/logout`);
        if (response.data.success) {
          toast({
            title: "Logged out successfully",
            description: "See you next time!",
          });
          navigate("/login");
        }
      } catch (e) {
        console.log("Error : ", e.message);
      }
    };
    logoutRequest();
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
              <p className="text-muted-foreground">
                Manage your shortened URLs
              </p>
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
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="My LinkedIn Profile"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="transition-luxury focus:glow-effect"
                    required
                  />
                </div>
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
              </div>
              <div className="space-y-2 w-[40vh]">
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
              onEditUrl={handleEditUrl}
              onDeleteUrl={handleRemoveUrl}
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
              <CardDescription>Click analytics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart selectedUrl={selectedUrl} />
            </CardContent>
          </Card>
        )}
      </div>
      {openEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-black border border-grey-500 rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Edit URL</h2>
            <div className="mb-4">
              <label htmlFor="editUrl" className="block mb-1 font-small">
                Original URL
              </label>
              <input
                id="editUrl"
                type="text"
                value={editUrlValue}
                onChange={(e) => setEditUrlValue(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-black focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOpenEditModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => editUrlValue && handleUpdateUrl(editUrlValue)}
                className="px-4 py-2 border border-white bg-black text-white rounded hover:bg-white hover:text-black"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      {openDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-black border border-grey-500 rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Delete URL</h2>
            <div className="mb-4">
              <p>Are you sure in deleting this URl?</p>
              <p>This action is irreversible.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOpenDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUrl()}
                className="px-4 py-2 border border-white bg-red-500 text-white rounded hover:bg-red-700 hover:text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
