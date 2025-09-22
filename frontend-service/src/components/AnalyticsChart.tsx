import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface URLData {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  title?: string;
}

interface AnalyticsChartProps {
  selectedUrl: URLData;
}

export const AnalyticsChart = ({ selectedUrl }: AnalyticsChartProps) => {
  const [analyticsData, setAnalyticsData] = useState<
    {
      date: string;
      fullDate: string;
      clicks: number;
      cumulativeClicks: number;
    }[]
  >([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/url/analytics/${selectedUrl.id}`,
          { withCredentials: true }
        );

        const { analytics } = response.data;

        // Group clicks by day
        const grouped: Record<string, number> = {};
        analytics.forEach((a: any) => {
          const day = format(new Date(a.timestamp), "yyyy-MM-dd");
          grouped[day] = (grouped[day] || 0) + 1;
        });

        // Convert to chart data
        const sortedDates = Object.keys(grouped).sort();
        let cumulative = 0;
        const chartData = sortedDates.map((day) => {
          cumulative += grouped[day];
          return {
            date: format(new Date(day), "MMM dd"),
            fullDate: day,
            clicks: grouped[day],
            cumulativeClicks: cumulative,
          };
        });

        setAnalyticsData(chartData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
    };

    fetchAnalytics();
  }, [selectedUrl]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-border/50 shadow-card">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            Clicks: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-lg border border-border/50">
          <div className="text-2xl font-bold text-primary">
            {selectedUrl.clicks.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Clicks</div>
        </div>
        <div className="glass-card p-4 rounded-lg border border-border/50">
          <div className="text-2xl font-bold text-primary">
            {analyticsData.length > 0
              ? Math.round(selectedUrl.clicks / analyticsData.length)
              : 0}
          </div>
          <div className="text-sm text-muted-foreground">Daily Average</div>
        </div>
        <div className="glass-card p-4 rounded-lg border border-border/50">
          <div className="text-2xl font-bold text-primary">
            {analyticsData.length > 0
              ? Math.max(...analyticsData.map((d) => d.clicks))
              : 0}
          </div>
          <div className="text-sm text-muted-foreground">Peak Day</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={analyticsData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#clicksGradient)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* URL Details */}
      <div className="glass-card p-4 rounded-lg border border-border/50 space-y-2">
        <div className="text-sm font-medium">URL Details</div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Short URL:</span>
            <code className="ml-2 bg-muted/50 px-2 py-1 rounded text-xs">
              {selectedUrl.shortUrl}
            </code>
          </div>
          <div>
            <span className="font-medium">Original URL:</span>
            <code className="ml-2 bg-muted/50 px-2 py-1 rounded text-xs break-all">
              {selectedUrl.originalUrl}
            </code>
          </div>
          <div>
            <span className="font-medium">Created:</span>
            <span className="ml-2">
              {format(new Date(selectedUrl.createdAt), "PPP")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
