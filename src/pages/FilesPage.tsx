import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FileList from "@/components/files/FileList";
import { files, FileInfo, FileListResponse } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FilesPage = () => {
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const navigate = useNavigate();
  
  const pageSize = 20;

  const fetchFiles = async (page: number = 1) => {
    try {
      setLoading(true);
      const response: FileListResponse = await files.list(page, pageSize);
      setFileList(response.files);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalFiles(response.pagination.totalFiles);
    } catch (error) {
      toast({
        title: "Failed to load files",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchFiles(newPage);
    }
  };

  const handleFileDeleted = () => {
    // If we're on a page that might now be empty, go back to page 1
    if (fileList.length === 1 && currentPage > 1) {
      fetchFiles(1);
    } else {
      fetchFiles(currentPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">My Files</h1>
          <p className="text-muted-foreground">
            {totalFiles > 0 
              ? `${totalFiles} file${totalFiles > 1 ? 's' : ''} in your vault`
              : "Your file vault is empty"
            }
          </p>
        </div>
        
        <Button 
          variant="upload" 
          onClick={() => navigate("/dashboard/upload")}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Files</span>
        </Button>
      </div>

      {/* File List */}
      <FileList 
        files={fileList} 
        onFileDeleted={handleFileDeleted}
        loading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to{" "}
              {Math.min(currentPage * pageSize, totalFiles)} of {totalFiles} files
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State for no pagination */}
      {totalFiles === 0 && !loading && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No files uploaded yet</h3>
          <p className="text-muted-foreground mb-6">
            Start building your secure file vault by uploading your first files
          </p>
          <Button 
            variant="upload" 
            onClick={() => navigate("/dashboard/upload")}
          >
            <Upload className="w-4 h-4" />
            Upload Your First File
          </Button>
        </Card>
      )}
    </div>
  );
};

export default FilesPage;