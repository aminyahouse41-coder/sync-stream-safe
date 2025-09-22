import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StorageStats as StorageStatsType, formatFileSize } from "@/lib/api";
import { HardDrive, TrendingUp, Recycle, Gauge } from "lucide-react";

interface StorageStatsProps {
  stats: StorageStatsType | null;
  loading?: boolean;
}

const StorageStats: React.FC<StorageStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-8 bg-muted rounded w-3/4 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Unable to load storage statistics</p>
      </Card>
    );
  }

  const storageUsedMB = stats.total_storage_used_bytes / (1024 * 1024);
  const quotaUsedPercentage = Math.round(stats.quota_used_percentage);
  const savingsPercentage = Math.round(stats.storage_savings_percentage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Storage Used */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatFileSize(stats.total_storage_used_bytes)}
          </div>
          <p className="text-xs text-muted-foreground">
            of {stats.storage_quota_mb}MB quota
          </p>
          <Progress 
            value={quotaUsedPercentage} 
            className="mt-3" 
            // Add color based on usage
            // @ts-ignore - custom prop for styling
            variant={quotaUsedPercentage > 90 ? "destructive" : quotaUsedPercentage > 70 ? "warning" : "default"}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{quotaUsedPercentage}% used</span>
            <Badge variant={quotaUsedPercentage > 90 ? "destructive" : "secondary"} className="text-xs">
              {quotaUsedPercentage > 90 ? "Almost Full" : "Available"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Storage Savings */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Space Saved</CardTitle>
          <Recycle className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {formatFileSize(stats.storage_savings_bytes)}
          </div>
          <p className="text-xs text-muted-foreground">
            {savingsPercentage}% deduplication savings
          </p>
          <div className="mt-3 p-2 bg-success/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-success">Efficiency</span>
              <span className="text-xs font-bold text-success">{savingsPercentage}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Original Size */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Original Size</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatFileSize(stats.original_storage_used_bytes)}
          </div>
          <p className="text-xs text-muted-foreground">
            Before deduplication
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Reduced to</span>
              <span className="font-medium">
                {formatFileSize(stats.total_storage_used_bytes)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quota Status */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quota Status</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.storage_quota_mb}MB
          </div>
          <p className="text-xs text-muted-foreground">
            Total allowance
          </p>
          <div className="mt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Remaining</span>
              <span className="text-xs font-medium">
                {formatFileSize((stats.storage_quota_mb * 1024 * 1024) - stats.total_storage_used_bytes)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageStats;