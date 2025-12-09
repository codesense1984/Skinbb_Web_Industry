import { useState, useEffect, useRef } from "react";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/utils";
import axios from "axios";
import { basePythonApiUrl } from "@/core/config/baseUrls";
import { Check, X } from "lucide-react";

interface IngredientOption {
  id: string;
  name: string;
  inci: string;
  all_inci: string[];
  category?: string;
  cost_per_kg?: number;
}

interface IngredientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (ingredient: IngredientOption) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const IngredientAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Type ingredient name...",
  label,
  className,
  disabled = false
}: IngredientAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<IngredientOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientOption | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search ingredients
  const searchIngredients = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${basePythonApiUrl}/api/ingredients/search`,
        { 
          params: { query: query.trim(), limit: 10 },
          timeout: 10000
        }
      );
      const results = response.data.results || [];
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      
      // If exact match found, auto-select it
      const exactMatch = results.find((r: IngredientOption) => 
        r.name.toLowerCase() === query.trim().toLowerCase()
      );
      if (exactMatch && onSelect) {
        handleSelect(exactMatch);
      }
    } catch (error: any) {
      console.error("❌ Error searching ingredients:", error);
      console.error("Error details:", error.response?.data || error.message);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setSelectedIngredient(null);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce search
    timeoutRef.current = setTimeout(() => {
      searchIngredients(newValue);
    }, 300);
  };

  // Handle selection
  const handleSelect = (ingredient: IngredientOption) => {
    onChange(ingredient.name);
    setSelectedIngredient(ingredient);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(ingredient);
    }
  };

  // Clear selection
  const handleClear = () => {
    onChange("");
    setSelectedIngredient(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {label && <Label className="text-xs mb-1 block">{label}</Label>}
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-8"
        />
        {value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && (
            <div className="p-2 text-sm text-muted-foreground">Searching...</div>
          )}
          {suggestions.map((ingredient) => (
            <button
              key={ingredient.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none"
              onClick={() => handleSelect(ingredient)}
            >
              <div className="font-medium">{ingredient.name}</div>
              {ingredient.inci && (
                <div className="text-xs text-muted-foreground">INCI: {ingredient.inci}</div>
              )}
              {ingredient.cost_per_kg && (
                <div className="text-xs text-muted-foreground">
                  ₹{ingredient.cost_per_kg.toLocaleString()}/kg
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected ingredient info */}
      {selectedIngredient && (
        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
          <Check className="h-3 w-3 text-green-600" />
          <span>
            INCI: {selectedIngredient.inci || "Not available"} | 
            Cost: ₹{selectedIngredient.cost_per_kg?.toLocaleString() || "N/A"}/kg
          </span>
        </div>
      )}
    </div>
  );
};

