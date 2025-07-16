"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Building2,
  Search,
  Users,
  DollarSign,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const handleViewPriceQueue = () => {
    router.push("/quote-queue");
  };

  const handleViewCustomerPricing = () => {
    router.push("/customer-pricing/1");
  };

  const handleCustomerSearch = () => {
    router.push("/customer-search");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pricing Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Example Links
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Price Queue Card */}
          <Card
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={handleViewPriceQueue}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">View Price Queue</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Review quotes requiring attention
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
          </Card>

          {/* Customer Pricing Card */}
          <Card
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={handleViewCustomerPricing}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      View Customer Pricing
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage customer pricing
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
