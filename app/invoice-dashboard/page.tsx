"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Calendar,
  BarChart3,
  Users,
  Building2,
} from "lucide-react";

// Mock data - in a real app, this would come from an API
// Scale: $800M/year = ~$66.7M/month = ~$2.2M/day
const mockInvoices = [
  {
    id: "INV-001",
    customer: "Acme Corp",
    amount: 125000.0,
    status: "ready",
    dueDate: "2024-01-15",
    invoiceDate: "2024-01-01",
    generator: "Generator A",
    facility: "Facility North",
  },
  {
    id: "INV-002",
    customer: "Tech Solutions Inc",
    amount: 87500.0,
    status: "ready",
    dueDate: "2024-01-20",
    invoiceDate: "2024-01-02",
    generator: "Generator B",
    facility: "Facility South",
  },
  {
    id: "INV-003",
    customer: "Global Industries",
    amount: 210000.0,
    status: "open",
    dueDate: "2024-01-25",
    invoiceDate: "2024-01-03",
    generator: "Generator A",
    facility: "Facility North",
  },
  {
    id: "INV-004",
    customer: "Local Business LLC",
    amount: 45000.0,
    status: "review",
    dueDate: "2024-01-30",
    invoiceDate: "2024-01-04",
    generator: "Generator C",
    facility: "Facility East",
  },
  {
    id: "INV-005",
    customer: "Enterprise Solutions",
    amount: 320000.0,
    status: "open",
    dueDate: "2024-02-05",
    invoiceDate: "2024-01-05",
    generator: "Generator B",
    facility: "Facility South",
  },
  {
    id: "INV-006",
    customer: "Startup Ventures",
    amount: 180000.0,
    status: "review",
    dueDate: "2024-02-10",
    invoiceDate: "2024-01-06",
    generator: "Generator A",
    facility: "Facility North",
  },
  {
    id: "INV-007",
    customer: "Corp International",
    amount: 95000.0,
    status: "open",
    dueDate: "2024-02-15",
    invoiceDate: "2024-01-07",
    generator: "Generator D",
    facility: "Facility West",
  },
  {
    id: "INV-008",
    customer: "Mega Corp",
    amount: 280000.0,
    status: "open",
    dueDate: "2024-02-20",
    invoiceDate: "2024-01-08",
    generator: "Generator E",
    facility: "Facility Central",
  },
  {
    id: "INV-009",
    customer: "Innovation Labs",
    amount: 165000.0,
    status: "review",
    dueDate: "2024-02-25",
    invoiceDate: "2024-01-09",
    generator: "Generator F",
    facility: "Facility Downtown",
  },
  {
    id: "INV-010",
    customer: "Future Systems",
    amount: 220000.0,
    status: "open",
    dueDate: "2024-03-01",
    invoiceDate: "2024-01-10",
    generator: "Generator G",
    facility: "Facility Uptown",
  },
  {
    id: "INV-011",
    customer: "Digital Dynamics",
    amount: 135000.0,
    status: "ready",
    dueDate: "2024-03-05",
    invoiceDate: "2024-01-11",
    generator: "Generator H",
    facility: "Facility Metro",
  },
  {
    id: "INV-012",
    customer: "Cloud Computing Co",
    amount: 195000.0,
    status: "open",
    dueDate: "2024-03-10",
    invoiceDate: "2024-01-12",
    generator: "Generator I",
    facility: "Facility Suburban",
  },
  {
    id: "INV-013",
    customer: "Data Solutions",
    amount: 110000.0,
    status: "review",
    dueDate: "2024-03-15",
    invoiceDate: "2024-01-13",
    generator: "Generator J",
    facility: "Facility Industrial",
  },
  {
    id: "INV-014",
    customer: "Smart Technologies",
    amount: 240000.0,
    status: "open",
    dueDate: "2024-03-20",
    invoiceDate: "2024-01-14",
    generator: "Generator K",
    facility: "Facility Tech",
  },
  {
    id: "INV-015",
    customer: "Next Gen Systems",
    amount: 175000.0,
    status: "ready",
    dueDate: "2024-03-25",
    invoiceDate: "2024-01-15",
    generator: "Generator L",
    facility: "Facility Innovation",
  },
];

const statusBreakdown = [
  {
    status: "ready",
    count: 4,
    label: "Ready to Bill",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    status: "open",
    count: 8,
    label: "Open",
    color: "bg-blue-100 text-blue-800",
  },
  {
    status: "review",
    count: 3,
    label: "In Review",
    color: "bg-amber-100 text-amber-800",
  },
  {
    status: "finalized",
    count: 8,
    label: "Finalized",
    color: "bg-slate-100 text-slate-800",
  },
  {
    status: "void",
    count: 0,
    label: "Void",
    color: "bg-rose-100 text-rose-800",
  },
];

const monthlySummary = [
  { month: "Jan 2024", total: 67500000.0, count: 15 },
  { month: "Dec 2023", total: 61800000.0, count: 12 },
  { month: "Nov 2023", total: 73200000.0, count: 18 },
  { month: "Oct 2023", total: 60900000.0, count: 14 },
];

// Calculate top customers by active invoice amount
const getTopCustomersByActiveInvoices = () => {
  const customerTotals = mockInvoices
    .filter((inv) => inv.status !== "finalized" && inv.status !== "void")
    .reduce((acc, inv) => {
      acc[inv.customer] = (acc[inv.customer] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(customerTotals)
    .map(([customer, total]) => ({ customer, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
};

// Calculate top generators by active invoice amount
const getTopGeneratorsByActiveInvoices = () => {
  const generatorTotals = mockInvoices
    .filter((inv) => inv.status !== "finalized" && inv.status !== "void")
    .reduce((acc, inv) => {
      acc[inv.generator] = (acc[inv.generator] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(generatorTotals)
    .map(([generator, total]) => ({ generator, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
};

// Calculate top facilities by active invoice amount
const getTopFacilitiesByActiveInvoices = () => {
  const facilityTotals = mockInvoices
    .filter((inv) => inv.status !== "finalized" && inv.status !== "void")
    .reduce((acc, inv) => {
      acc[inv.facility] = (acc[inv.facility] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(facilityTotals)
    .map(([facility, total]) => ({ facility, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
};

const topCustomers = getTopCustomersByActiveInvoices();
const topGenerators = getTopGeneratorsByActiveInvoices();
const topFacilities = getTopFacilitiesByActiveInvoices();

const getStatusBadge = (status: string) => {
  const statusConfig = {
    ready: {
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    open: {
      variant: "secondary" as const,
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    review: {
      variant: "outline" as const,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    finalized: {
      variant: "outline" as const,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    void: {
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.open;

  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function InvoiceDashboard() {
  const totalReadyToBill = mockInvoices.filter(
    (inv) => inv.status === "ready"
  ).length;
  const totalReadyAmount = mockInvoices
    .filter((inv) => inv.status === "ready")
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Calculate total amount of invoices in active statuses (not finalized or void)
  const totalActiveAmount = mockInvoices
    .filter((inv) => inv.status !== "finalized" && inv.status !== "void")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Invoice Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and manage your invoice pipeline
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Ready to Bill
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalReadyToBill}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${totalReadyAmount.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Invoices
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalActiveAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Not finalized/void</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Invoices
                  </p>
                  <p className="text-2xl font-bold text-gray-900">32</p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">$67.5M</p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="mb-8">
          <Card className="bg-white max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Invoice Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusBreakdown.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          item.color.split(" ")[0]
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Summary */}
        <div className="mt-8">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-1" />
                Monthly Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {monthlySummary.map((month) => (
                  <div
                    key={month.month}
                    className="text-center p-4 border border-gray-200 rounded-lg"
                  >
                    <p className="text-sm font-medium text-gray-600">
                      {month.month}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${month.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {month.count} invoices
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Charts Grid */}
        <div className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Customers by Active Invoices */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-0" />
                  Top Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => {
                    const maxAmount = topCustomers[0]?.total || 1;
                    const percentage = (customer.total / maxAmount) * 100;

                    // Simplified color scheme - more muted and professional
                    const getBarColor = (percent: number) => {
                      if (percent >= 80) return "from-blue-600 to-blue-500";
                      if (percent >= 60) return "from-blue-500 to-blue-400";
                      if (percent >= 40) return "from-slate-500 to-slate-400";
                      if (percent >= 20) return "from-slate-400 to-slate-300";
                      return "from-gray-400 to-gray-300";
                    };

                    return (
                      <div key={customer.customer} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700 min-w-0 flex-1">
                            {index + 1}. {customer.customer}
                          </span>
                          <span className="font-bold text-gray-900 ml-4">
                            ${customer.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${getBarColor(
                              percentage
                            )} h-3 rounded-full transition-all duration-500 shadow-sm`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Generators by Active Invoices */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary-1" />
                  Top Generators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topGenerators.map((generator, index) => {
                    const maxAmount = topGenerators[0]?.total || 1;
                    const percentage = (generator.total / maxAmount) * 100;

                    // Simplified color scheme - more muted and professional
                    const getBarColor = (percent: number) => {
                      if (percent >= 80) return "from-blue-600 to-blue-500";
                      if (percent >= 60) return "from-blue-500 to-blue-400";
                      if (percent >= 40) return "from-slate-500 to-slate-400";
                      if (percent >= 20) return "from-slate-400 to-slate-300";
                      return "from-gray-400 to-gray-300";
                    };

                    return (
                      <div key={generator.generator} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700 min-w-0 flex-1">
                            {index + 1}. {generator.generator}
                          </span>
                          <span className="font-bold text-gray-900 ml-4">
                            ${generator.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${getBarColor(
                              percentage
                            )} h-3 rounded-full transition-all duration-500 shadow-sm`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Facilities by Active Invoices */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  Top Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topFacilities.map((facility, index) => {
                    const maxAmount = topFacilities[0]?.total || 1;
                    const percentage = (facility.total / maxAmount) * 100;

                    // Simplified color scheme - more muted and professional
                    const getBarColor = (percent: number) => {
                      if (percent >= 80) return "from-blue-600 to-blue-500";
                      if (percent >= 60) return "from-blue-500 to-blue-400";
                      if (percent >= 40) return "from-slate-500 to-slate-400";
                      if (percent >= 20) return "from-slate-400 to-slate-300";
                      return "from-gray-400 to-gray-300";
                    };

                    return (
                      <div key={facility.facility} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700 min-w-0 flex-1">
                            {index + 1}. {facility.facility}
                          </span>
                          <span className="font-bold text-gray-900 ml-4">
                            ${facility.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${getBarColor(
                              percentage
                            )} h-3 rounded-full transition-all duration-500 shadow-sm`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
