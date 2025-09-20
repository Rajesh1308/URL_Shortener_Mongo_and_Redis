import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Edit, Trash2, MousePointer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface URLData {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  title?: string;
}

interface URLTableProps {
  urls: URLData[];
  onSelectUrl: (url: URLData) => void;
  onDeleteUrl: (id: string) => void;
  selectedUrl: URLData | null;
}

export const URLTable = ({ urls, onSelectUrl, onDeleteUrl, selectedUrl }: URLTableProps) => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const formatUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50 border-border/50">
              <TableHead>Title</TableHead>
              <TableHead>Original URL</TableHead>
              <TableHead>Short URL</TableHead>
              <TableHead className="text-center">Clicks</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {urls.map((url) => (
              <TableRow
                key={url.id}
                className={`cursor-pointer transition-luxury hover:bg-muted/50 border-border/50 ${
                  selectedUrl?.id === url.id ? 'bg-accent/30 ring-1 ring-border glow-effect' : ''
                }`}
                onClick={() => onSelectUrl(url)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                    <span>{url.title || "Untitled"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground text-sm">
                      {formatUrl(url.originalUrl)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUrl(url.originalUrl);
                      }}
                      className="h-6 w-6 p-0 hover:bg-accent"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-muted/50 px-2 py-1 rounded">
                      {formatUrl(url.shortUrl, 30)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(url.shortUrl);
                      }}
                      className="h-6 w-6 p-0 hover:bg-accent"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="bg-accent/50 text-accent-foreground">
                    <MousePointer className="h-3 w-3 mr-1" />
                    {url.clicks.toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(url.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality would go here
                        toast({
                          title: "Edit URL",
                          description: "Edit functionality coming soon!",
                        });
                      }}
                      className="h-8 w-8 p-0 hover:bg-accent"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteUrl(url.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {urls.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-card flex items-center justify-center">
            <MousePointer className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No URLs yet</h3>
          <p className="text-muted-foreground">Create your first shortened URL to get started</p>
        </div>
      )}
    </div>
  );
};