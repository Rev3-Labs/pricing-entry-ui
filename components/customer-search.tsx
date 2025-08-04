"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Building2, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Customer {
  customerId: string;
  customerName: string;
  oracleCustomerId?: string;
  customerCode?: string;
  status?: string;
}

interface CustomerSearchProps {
  onCustomerSelect: (customer: Customer) => void;
  placeholder?: string;
  className?: string;
}

export function CustomerSearch({
  onCustomerSelect,
  placeholder = "Search by customer name or Oracle Customer ID...",
  className,
}: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const searchCustomers = async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Import the service dynamically to avoid SSR issues
      const { customerService } = await import("@/services/customer.service");
      const response = await customerService.searchCustomers(term);

      if (response.success) {
        setSuggestions(response.data);
      } else {
        setSuggestions([]);
        console.error("Search failed:", response.message);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCustomers(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleCustomerSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSearchTerm(customer.customerName);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onCustomerSelect(customer);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pl-10 pr-4 py-3 text-base"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((customer, index) => (
            <div
              key={customer.customerId}
              className={cn(
                "p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                selectedIndex === index &&
                  "bg-blue-50 border-l-4 border-blue-500"
              )}
              onClick={() => handleCustomerSelect(customer)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {customer.customerName}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {customer.oracleCustomerId && (
                        <Badge variant="secondary" className="text-xs">
                          Oracle: {customer.oracleCustomerId}
                        </Badge>
                      )}
                      {customer.customerCode && (
                        <Badge variant="outline" className="text-xs">
                          Code: {customer.customerCode}
                        </Badge>
                      )}
                      {customer.status === "inactive" && (
                        <Badge variant="destructive" className="text-xs">
                          (Inactive)
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions &&
        searchTerm &&
        suggestions.length === 0 &&
        !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-500 text-center">
              No customers found matching "{searchTerm}"
            </p>
          </div>
        )}
    </div>
  );
}
