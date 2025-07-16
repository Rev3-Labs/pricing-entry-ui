"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerSearch, Customer } from "@/components/customer-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, User, Hash, FileText } from "lucide-react";
import { toast } from "sonner";

export default function CustomerSearchPage() {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    toast.success(`Selected customer: ${customer.customerName}`);
  };

  const handleViewPricing = () => {
    if (selectedCustomer) {
      // Navigate to customer pricing view with customer ID
      router.push(`/customer-pricing/${selectedCustomer.customerId}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Customer Search
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Search for customers by name or Oracle Customer ID to access their
              pricing information and manage their account settings.
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/quote-queue")}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>View Quote Queue</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Find Customer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerSearch
              onCustomerSelect={handleCustomerSelect}
              placeholder="Start typing customer name or Oracle Customer ID..."
              className="max-w-2xl"
            />
          </CardContent>
        </Card>

        {/* Selected Customer Display */}
        {selectedCustomer && (
          <Card className="mb-8 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <User className="h-5 w-5" />
                <span>Selected Customer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedCustomer.customerName}
                    </h3>
                    <div className="flex items-center space-x-3 mt-2">
                      {selectedCustomer.oracleCustomerId && (
                        <Badge
                          variant="secondary"
                          className="flex items-center space-x-1"
                        >
                          <Hash className="h-3 w-3" />
                          <span>
                            Oracle: {selectedCustomer.oracleCustomerId}
                          </span>
                        </Badge>
                      )}
                      {selectedCustomer.customerCode && (
                        <Badge
                          variant="outline"
                          className="flex items-center space-x-1"
                        >
                          <span>Code: {selectedCustomer.customerCode}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleViewPricing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Search by Name
                </h4>
                <p className="text-sm text-gray-600">
                  Type the customer's company name to find them quickly. The
                  search is case-insensitive and will match partial names.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Search by Oracle ID
                </h4>
                <p className="text-sm text-gray-600">
                  Enter the Oracle Customer ID to find a specific customer. This
                  is useful when you have the exact ID from another system.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Keyboard Navigation
                </h4>
                <p className="text-sm text-gray-600">
                  Use arrow keys to navigate suggestions, Enter to select, and
                  Escape to close the dropdown.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">View Pricing</h4>
                <p className="text-sm text-gray-600">
                  Once you select a customer, click "View Pricing" to access
                  their pricing information and account settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
