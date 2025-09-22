import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StorageStats from "@/components/dashboard/StorageStats";
import FileList from "@/components/files/FileList";
import { files, StorageStats as StorageStatsType, FileInfo } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Upload, Files, TrendingUp, Activity } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState<StorageStatsType | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, filesData] = await Promise.all([
        files.getStats(),
        files.list(1, 5), // Get only the 5 most recent files
      ]);
      
      setStats(statsData);
      setRecentFiles(filesData.files);
    } catch (error) {
      toast({
        title: "Failed to load dashboard",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 17) return "Good afternoon!";
    return "Good evening!";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {getWelcomeMessage()}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your File Vault storage and activity.
        </p>
      </div>

      {/* Storage Statistics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Storage Overview</span>
        </h2>
        <StorageStats stats={stats} loading={loading} />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-all duration-200" onClick={() => navigate("/dashboard/upload")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Upload Files</h3>
                  <p className="text-sm text-muted-foreground">Add new files to your vault</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all duration-200" onClick={() => navigate("/dashboard/files")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
                  <Files className="w-6 h-6 text-success-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Browse Files</h3>
                  <p className="text-sm text-muted-foreground">View and manage your files</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all duration-200" onClick={() => navigate("/dashboard/search")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-warning-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Search Files</h3>
                  <p className="text-sm text-muted-foreground">Find files with advanced filters</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Files */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Files className="w-5 h-5" />
            <span>Recent Files</span>
          </h2>
          {recentFiles.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/dashboard/files")}
            >
              View All
            </Button>
          )}
        </div>
        
        {loading ? (
          <FileList files={[]} loading={true} />
        ) : recentFiles.length > 0 ? (
          <FileList 
            files={recentFiles} 
            onFileDeleted={fetchDashboardData}
          />
        ) : (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No files uploaded yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by uploading your first files to File Vault
            </p>
            <Button 
              variant="upload" 
              onClick={() => navigate("/dashboard/upload")}
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </Button>
          </Card>
        )}
      </div>

      {/* Storage Insights */}
      {stats && stats.storage_savings_bytes > 0 && (
        <Card className="border-success/20 bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-success">
              <TrendingUp className="w-5 h-5" />
              <span>Deduplication Impact</span>
            </CardTitle>
            <CardDescription>
              Your files are being efficiently stored with smart deduplication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">
                  {Math.round(stats.storage_savings_percentage)}%
                </div>
                <div className="text-sm text-success/80">Space Saved</div>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">
                  {(stats.storage_savings_bytes / (1024 * 1024)).toFixed(1)}MB
                </div>
                <div className="text-sm text-success/80">Bytes Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;