import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { files } from "@/lib/api";
import { Upload, File, X, CheckCircle2, AlertCircle, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  response?: any;
  error?: string;
}

interface FileUploaderProps {
  onUploadComplete?: () => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  maxFiles = 10,
  maxSize = 32 * 1024 * 1024, // 32MB default
}) => {
  const [uploadQueue, setUploadQueue] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((rejection) => {
        const errors = rejection.errors.map((e: any) => e.message).join(", ");
        toast({
          title: `File rejected: ${rejection.file.name}`,
          description: errors,
          variant: "destructive",
        });
      });
    }

    // Add accepted files to queue
    if (acceptedFiles.length > 0) {
      const newUploads: FileUploadStatus[] = acceptedFiles.map((file) => ({
        file,
        status: "pending",
        progress: 0,
      }));

      setUploadQueue(prev => [...prev, ...newUploads]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    multiple: true,
  });

  const removeFromQueue = (index: number) => {
    setUploadQueue(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (uploadQueue.length === 0) return;

    setIsUploading(true);
    const filesToUpload = uploadQueue.filter(item => item.status === "pending");

    try {
      // Update all pending files to uploading
      setUploadQueue(prev => 
        prev.map(item => 
          item.status === "pending" 
            ? { ...item, status: "uploading" as const, progress: 10 }
            : item
        )
      );

      // Create FileList from files
      const fileList = new FileList();
      const dt = new DataTransfer();
      filesToUpload.forEach(item => dt.items.add(item.file));
      const files_to_upload = dt.files;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadQueue(prev => 
          prev.map(item => 
            item.status === "uploading" && item.progress < 90
              ? { ...item, progress: Math.min(90, item.progress + 10) }
              : item
          )
        );
      }, 200);

      const results = await files.upload(files_to_upload);
      clearInterval(progressInterval);

      // Update status based on results
      setUploadQueue(prev => {
        const updated = [...prev];
        let resultIndex = 0;

        for (let i = 0; i < updated.length; i++) {
          if (updated[i].status === "uploading") {
            const result = results[resultIndex];
            updated[i] = {
              ...updated[i],
              status: "success",
              progress: 100,
              response: result,
            };
            resultIndex++;
          }
        }
        return updated;
      });

      const successCount = results.length;
      const deduplicatedCount = results.filter(r => r.deduplicated).length;
      
      toast({
        title: "Upload completed!",
        description: `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully${
          deduplicatedCount > 0 ? ` (${deduplicatedCount} deduplicated)` : ''
        }`,
      });

      onUploadComplete?.();
      
      // Clear successful uploads after a delay
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => item.status !== "success"));
      }, 3000);

    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });

      // Mark all uploading files as error
      setUploadQueue(prev => 
        prev.map(item => 
          item.status === "uploading"
            ? { 
                ...item, 
                status: "error" as const, 
                error: error instanceof Error ? error.message : "Upload failed" 
              }
            : item
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const clearQueue = () => {
    setUploadQueue(prev => prev.filter(item => item.status === "uploading"));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <Card 
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
          "hover:shadow-upload hover:border-primary/50",
          isDragActive && !isDragReject && "border-primary bg-upload-zone-active shadow-upload",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && "border-upload-zone-border bg-upload-zone-bg"
        )}
      >
        <input {...getInputProps()} />
        <div className="p-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
              isDragActive && !isDragReject ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground",
              isDragReject && "bg-destructive text-destructive-foreground"
            )}>
              {isDragReject ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <Cloud className="w-8 h-8" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              {isDragActive && !isDragReject
                ? "Drop files here"
                : isDragReject
                ? "Some files are invalid"
                : "Drag & drop files here"
              }
            </h3>
            <p className="text-muted-foreground">
              {isDragReject 
                ? "Please check file size and type requirements"
                : `or click to browse • Max ${maxFiles} files • Up to ${formatFileSize(maxSize)} each`
              }
            </p>
          </div>

          <Button variant="outline" size="lg" type="button">
            <Upload className="w-4 h-4" />
            Choose Files
          </Button>
        </div>
      </Card>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upload Queue ({uploadQueue.length})</h3>
            <div className="flex gap-2">
              {uploadQueue.some(item => item.status === "pending") && (
                <Button 
                  onClick={uploadFiles}
                  disabled={isUploading}
                  variant="upload"
                  size="sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload All
                </Button>
              )}
              <Button 
                onClick={clearQueue}
                variant="ghost"
                size="sm"
                disabled={isUploading}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {uploadQueue.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    item.status === "success" && "bg-success text-success-foreground",
                    item.status === "error" && "bg-destructive text-destructive-foreground",
                    item.status === "uploading" && "bg-primary text-primary-foreground",
                    item.status === "pending" && "bg-muted text-muted-foreground"
                  )}>
                    {item.status === "success" && <CheckCircle2 className="w-5 h-5" />}
                    {item.status === "error" && <AlertCircle className="w-5 h-5" />}
                    {(item.status === "uploading" || item.status === "pending") && <File className="w-5 h-5" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatFileSize(item.file.size)}
                    </span>
                  </div>
                  
                  {item.status === "uploading" && (
                    <Progress value={item.progress} className="mt-2 h-2" />
                  )}
                  
                  {item.status === "success" && item.response && (
                    <p className="text-xs text-success mt-1">
                      Uploaded successfully{item.response.deduplicated ? " (deduplicated)" : ""}
                    </p>
                  )}
                  
                  {item.status === "error" && (
                    <p className="text-xs text-destructive mt-1">{item.error}</p>
                  )}
                </div>

                {(item.status === "pending" || item.status === "error") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromQueue(index)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FileUploader;