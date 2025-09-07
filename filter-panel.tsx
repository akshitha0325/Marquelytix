import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterState, SOURCES, SENTIMENT_OPTIONS } from "@/lib/types";

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'sources' | 'sentiment', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  return (
    <div className="space-y-6">
      {/* Time Range */}
      <div>
        <Label htmlFor="timeRange">Time Range</Label>
        <Select 
          value={filters.timeRange} 
          onValueChange={(value) => updateFilter('timeRange', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sources */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Sources</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {SOURCES.map((source) => (
            <label key={source.value} className="flex items-center">
              <Checkbox
                checked={filters.sources.includes(source.value)}
                onCheckedChange={() => toggleArrayFilter('sources', source.value)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">
                {source.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sentiment */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Sentiment</Label>
        <div className="space-y-2">
          {SENTIMENT_OPTIONS.map((sentiment) => (
            <label key={sentiment.value} className="flex items-center">
              <Checkbox
                checked={filters.sentiment.includes(sentiment.value)}
                onCheckedChange={() => toggleArrayFilter('sentiment', sentiment.value)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className={`ml-2 text-sm ${sentiment.color}`}>
                {sentiment.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Influence */}
      <div>
        <Label htmlFor="minInfluence" className="text-sm font-medium text-gray-700 mb-2 block">
          Minimum Influence Score
        </Label>
        <div className="px-3">
          <input
            type="range"
            min="0"
            max="10"
            value={filters.minInfluence}
            onChange={(e) => updateFilter('minInfluence', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span className="font-medium">{filters.minInfluence}</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Author Search */}
      <div>
        <Label htmlFor="authorSearch">Author Search</Label>
        <Input
          id="authorSearch"
          type="text"
          value={filters.authorSearch}
          onChange={(e) => updateFilter('authorSearch', e.target.value)}
          placeholder="Search authors..."
          className="mt-1"
        />
      </div>

      {/* Global Search */}
      <div>
        <Label htmlFor="searchQuery">Search in Comments</Label>
        <Input
          id="searchQuery"
          type="text"
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          placeholder="Search text content..."
          className="mt-1"
        />
      </div>
    </div>
  );
}
