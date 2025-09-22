import React from "react";
import FileUploader from "@/components/files/FileUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Recycle } from "lucide-react";

const UploadPage = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Upload Files</h1>
        <p className="text-muted-foreground">
          Securely upload your files with automatic deduplication and smart storage optimization.
        </p>
      </div>

      {/* Upload Component */}
      <FileUploader onUploadComplete={() => window.location.reload()} />

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Secure Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Your files are encrypted and stored securely with enterprise-grade security measures.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Recycle className="w-6 h-6 text-success" />
            </div>
            <CardTitle className="text-lg">Smart Deduplication</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Identical files are automatically detected and stored only once, saving storage space.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-warning" />
            </div>
            <CardTitle className="text-lg">Fast Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Optimized upload process with progress tracking and batch processing support.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Upload Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Tips</CardTitle>
          <CardDescription>Get the most out of your File Vault uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>Maximum file size is 32MB per file</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>You can upload up to 10 files at once using drag & drop</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>Duplicate files are automatically deduplicated to save space</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>All file types are supported - documents, images, videos, and more</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;