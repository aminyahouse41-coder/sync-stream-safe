import React, { useState } from "react";
import SearchFilters from "@/components/dashboard/SearchFilters";
import FileList from "@/components/files/FileList";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { files, FileInfo, SearchParams } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Search, Filter } from "lucide-react";

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);

  const handleSearch = async (searchParams: SearchParams) => {
    try {
      setLoading(true);
      setHasSearched(true);
      setLastSearchParams(searchParams);
      
      const response = await files.search(searchParams);
      setSearchResults(response.files);
      
      // Show search results toast
      const hasFilters = Object.values(searchParams).some(value => 
        value !== "" && value !== undefined
      );
      
      if (hasFilters) {
        toast({
          title: "Search completed",
          description: `Found ${response.files.length} file${response.files.length === 1 ? '' : 's'} matching your criteria`,
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDeleted = () => {
    // Re-run the last search to update results
    if (lastSearchParams) {
      handleSearch(lastSearchParams);
    }
  };

  const getSearchSummary = () => {
    if (!lastSearchParams) return null;
    
    const activeFilters = Object.entries(lastSearchParams).filter(([_, value]) => 
      value !== "" && value !== undefined
    );
    
    if (activeFilters.length === 0) {
      return "Showing all files";
    }
    
    return `Search results for ${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
          <Search className="w-8 h-8" />
          <span>Search Files</span>
        </h1>
        <p className="text-muted-foreground">
          Find your files using advanced search filters and criteria
        </p>
      </div>

      {/* Search Filters */}
      <SearchFilters onSearch={handleSearch} loading={loading} />

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold">Search Results</h2>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Filter className="w-3 h-3" />
                <span>{searchResults.length} found</span>
              </Badge>
            </div>
            {lastSearchParams && (
              <p className="text-sm text-muted-foreground">
                {getSearchSummary()}
              </p>
            )}
          </div>

          {loading ? (
            <FileList files={[]} loading={true} />
          ) : searchResults.length > 0 ? (
            <FileList 
              files={searchResults} 
              onFileDeleted={handleFileDeleted}
            />
          ) : (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-muted-foreground">
                {lastSearchParams && Object.values(lastSearchParams).some(v => v !== "" && v !== undefined) 
                  ? "Try adjusting your search criteria or filters"
                  : "Enter search terms or apply filters to find your files"
                }
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!hasSearched && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Use filename search to find files by name</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Filter by file type (images, documents, etc.)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Set date ranges to find files by upload date</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Use size filters to find large or small files</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Combine multiple filters for precise results</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Leave fields empty to search all files</span>
              </li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;