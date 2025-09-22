import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { FileInfo, files, formatFileSize, getFileTypeFromMime, downloadFile } from "@/lib/api";
import { 
  File, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Code,
  FileText,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  Calendar,
  HardDrive
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileListProps {
  files: FileInfo[];
  onFileDeleted?: () => void;
  loading?: boolean;
}

const FileList: React.FC<FileListProps> = ({ files: fileList, onFileDeleted, loading }) => {
  const [deletingFiles, setDeletingFiles] = useState<Set<number>>(new Set());

  const getFileIcon = (mimeType: string) => {
    const type = getFileTypeFromMime(mimeType);
    const iconClass = "w-5 h-5";
    
    switch (type) {
      case "image":
        return <Image className={cn(iconClass, "text-file-image")} />;
      case "video":
        return <Video className={cn(iconClass, "text-file-video")} />;
      case "audio":
        return <Music className={cn(iconClass, "text-file-audio")} />;
      case "archive":
        return <Archive className={cn(iconClass, "text-file-archive")} />;
      case "code":
        return <Code className={cn(iconClass, "text-file-code")} />;
      case "document":
        return <FileText className={cn(iconClass, "text-file-document")} />;
      default:
        return <File className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  const getFileTypeLabel = (mimeType: string) => {
    const type = getFileTypeFromMime(mimeType);
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (fileId: number, filename: string) => {
    if (deletingFiles.has(fileId)) return;

    setDeletingFiles(prev => new Set(prev).add(fileId));

    try {
      await files.delete(fileId);
      toast({
        title: "File deleted",
        description: `${filename} has been removed from your vault`,
      });
      onFileDeleted?.();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handlePreview = async (fileId: number, filename: string) => {
    try {
      const blob = await files.preview(fileId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      
      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);
    } catch (error) {
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Unable to preview file",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="w-8 h-8 bg-muted rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (fileList.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <File className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No files yet</h3>
        <p className="text-muted-foreground">
          Upload your first files to get started with File Vault
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {fileList.map((file) => (
        <Card key={file.id} className="p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-4">
            {/* File Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                {getFileIcon(file.mime_type)}
              </div>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium truncate text-foreground">{file.filename}</h3>
                <Badge variant="secondary" className="text-xs">
                  {getFileTypeLabel(file.mime_type)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <HardDrive className="w-4 h-4" />
                  <span>{formatFileSize(file.size_bytes)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(file.created_at)}</span>
                </div>
                {file.download_count !== undefined && file.download_count > 0 && (
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{file.download_count} downloads</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => downloadFile(file.id, file.filename)}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handlePreview(file.id, file.filename)}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleDelete(file.id, file.filename)}
                    disabled={deletingFiles.has(file.id)}
                    className="flex items-center space-x-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deletingFiles.has(file.id) ? "Deleting..." : "Delete"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FileList;