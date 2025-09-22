import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SearchParams } from "@/lib/api";
import { Search, Filter, X, Calendar, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchParams>({
    filename: "",
    mime_type: "",
    min_size_bytes: undefined,
    max_size_bytes: undefined,
    start_date: "",
    end_date: "",
  });

  const handleInputChange = (field: keyof SearchParams, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchParams = {
      filename: "",
      mime_type: "",
      min_size_bytes: undefined,
      max_size_bytes: undefined,
      start_date: "",
      end_date: "",
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== "" && value !== undefined
  );

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== "" && value !== undefined
    ).length;
  };

  const formatBytes = (bytes: string) => {
    if (!bytes) return "";
    const num = parseInt(bytes);
    if (isNaN(num)) return bytes;
    
    if (num >= 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)}MB`;
    if (num >= 1024) return `${(num / 1024).toFixed(1)}KB`;
    return `${num}B`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <CardTitle>Search & Filter</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="w-4 h-4" />
            {isExpanded ? "Simple" : "Advanced"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Search by filename..."
              value={filters.filename || ""}
              onChange={(e) => handleInputChange("filename", e.target.value)}
              className="bg-background/50"
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={loading}
            variant="upload"
          >
            <Search className="w-4 h-4" />
            Search
          </Button>
          {hasActiveFilters && (
            <Button 
              onClick={clearFilters} 
              variant="ghost"
              size="icon"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        <div className={cn(
          "space-y-4 transition-all duration-300 overflow-hidden",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Type Filter */}
            <div className="space-y-2">
              <Label>File Type</Label>
              <Select 
                value={filters.mime_type || ""} 
                onValueChange={(value) => handleInputChange("mime_type", value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="All file types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All file types</SelectItem>
                  <SelectItem value="image/">Images</SelectItem>
                  <SelectItem value="video/">Videos</SelectItem>
                  <SelectItem value="audio/">Audio</SelectItem>
                  <SelectItem value="text/">Text files</SelectItem>
                  <SelectItem value="application/pdf">PDF documents</SelectItem>
                  <SelectItem value="application/zip">Archives</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Upload Date</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="From"
                  value={filters.start_date || ""}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                  className="bg-background/50 text-sm"
                />
                <Input
                  type="date"
                  placeholder="To"
                  value={filters.end_date || ""}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                  className="bg-background/50 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Size Filters */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <HardDrive className="w-4 h-4" />
              <span>File Size Range</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Input
                  type="number"
                  placeholder="Min size (bytes)"
                  value={filters.min_size_bytes || ""}
                  onChange={(e) => handleInputChange("min_size_bytes", e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-background/50"
                />
                {filters.min_size_bytes && (
                  <p className="text-xs text-muted-foreground">
                    Min: {formatBytes(filters.min_size_bytes.toString())}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  placeholder="Max size (bytes)"
                  value={filters.max_size_bytes || ""}
                  onChange={(e) => handleInputChange("max_size_bytes", e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-background/50"
                />
                {filters.max_size_bytes && (
                  <p className="text-xs text-muted-foreground">
                    Max: {formatBytes(filters.max_size_bytes.toString())}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Size Filters */}
          <div className="space-y-2">
            <Label>Quick Size Filters</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    min_size_bytes: undefined,
                    max_size_bytes: 1024 * 1024, // 1MB
                  }));
                }}
              >
                Under 1MB
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    min_size_bytes: 1024 * 1024, // 1MB
                    max_size_bytes: 10 * 1024 * 1024, // 10MB
                  }));
                }}
              >
                1MB - 10MB
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    min_size_bytes: 10 * 1024 * 1024, // 10MB
                    max_size_bytes: undefined,
                  }));
                }}
              >
                Over 10MB
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.filename && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Name: {filters.filename}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleInputChange("filename", "")}
                />
              </Badge>
            )}
            {filters.mime_type && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {filters.mime_type.replace("/", "")}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleInputChange("mime_type", "")}
                />
              </Badge>
            )}
            {filters.min_size_bytes && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Min: {formatBytes(filters.min_size_bytes.toString())}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleInputChange("min_size_bytes", undefined)}
                />
              </Badge>
            )}
            {filters.max_size_bytes && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Max: {formatBytes(filters.max_size_bytes.toString())}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleInputChange("max_size_bytes", undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;