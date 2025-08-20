"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Search,
  ChevronRight,
  AlertTriangle,
  Filter,
  CheckCircle2,
  Clock2,
  FileSpreadsheet,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
} from "recharts";

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
    facility: "Emelle",
    csr: "Sarah Johnson",
  },
  {
    id: "INV-002",
    customer: "Tech Solutions Inc",
    amount: 87500.0,
    status: "ready",
    dueDate: "2024-01-20",
    invoiceDate: "2024-01-02",
    generator: "Generator B",
    facility: "Calvert City",
    csr: "Mike Chen",
  },
  {
    id: "INV-003",
    customer: "Global Industries",
    amount: 210000.0,
    status: "open",
    dueDate: "2024-01-25",
    invoiceDate: "2024-01-03",
    generator: "Generator A",
    facility: "Emelle",
    csr: "Sarah Johnson",
  },
  {
    id: "INV-004",
    customer: "Local Business LLC",
    amount: 45000.0,
    status: "on-hold",
    dueDate: "2024-01-30",
    invoiceDate: "2024-01-04",
    generator: "Generator C",
    facility: "Glencoe",
    csr: "Lisa Rodriguez",
  },
  {
    id: "INV-005",
    customer: "Enterprise Solutions",
    amount: 320000.0,
    status: "open",
    dueDate: "2024-02-05",
    invoiceDate: "2024-01-05",
    generator: "Generator B",
    facility: "Calvert City",
    csr: "Mike Chen",
  },
  {
    id: "INV-006",
    customer: "Startup Ventures",
    amount: 180000.0,
    status: "on-hold",
    dueDate: "2024-02-10",
    invoiceDate: "2024-01-06",
    generator: "Generator A",
    facility: "Emelle",
    csr: "Sarah Johnson",
  },
  {
    id: "INV-007",
    customer: "Corp International",
    amount: 95000.0,
    status: "open",
    dueDate: "2024-02-15",
    invoiceDate: "2024-01-07",
    generator: "Generator D",
    facility: "Detroit",
    csr: "David Thompson",
  },
  {
    id: "INV-008",
    customer: "Mega Corp",
    amount: 280000.0,
    status: "open",
    dueDate: "2024-02-20",
    invoiceDate: "2024-01-08",
    generator: "Generator E",
    facility: "Morris",
    csr: "Lisa Rodriguez",
  },
  {
    id: "INV-009",
    customer: "Innovation Labs",
    amount: 165000.0,
    status: "review",
    dueDate: "2024-02-25",
    invoiceDate: "2024-01-09",
    generator: "Generator F",
    facility: "Chester",
    csr: "David Thompson",
  },
  {
    id: "INV-010",
    customer: "Future Systems",
    amount: 220000.0,
    status: "open",
    dueDate: "2024-03-01",
    invoiceDate: "2024-01-10",
    generator: "Generator G",
    facility: "El Dorado",
    csr: "Sarah Johnson",
  },
  {
    id: "INV-011",
    customer: "Digital Dynamics",
    amount: 135000.0,
    status: "ready",
    dueDate: "2024-03-05",
    invoiceDate: "2024-01-11",
    generator: "Generator H",
    facility: "Westmorland",
    csr: "Mike Chen",
  },
  {
    id: "INV-012",
    customer: "Cloud Computing Co",
    amount: 195000.0,
    status: "open",
    dueDate: "2024-03-10",
    invoiceDate: "2024-01-12",
    generator: "Generator I",
    facility: "Deer Park",
    csr: "Lisa Rodriguez",
  },
  {
    id: "INV-013",
    customer: "Data Solutions",
    amount: 110000.0,
    status: "on-hold",
    dueDate: "2024-03-15",
    invoiceDate: "2024-01-13",
    generator: "Generator J",
    facility: "La Porte",
    csr: "David Thompson",
  },
  {
    id: "INV-014",
    customer: "Smart Technologies",
    amount: 240000.0,
    status: "open",
    dueDate: "2024-03-20",
    invoiceDate: "2024-01-14",
    generator: "Generator K",
    facility: "Pasadena",
    csr: "Sarah Johnson",
  },
  {
    id: "INV-015",
    customer: "Next Gen Systems",
    amount: 175000.0,
    status: "ready",
    dueDate: "2024-03-25",
    invoiceDate: "2024-01-15",
    generator: "Generator L",
    facility: "Channelview",
    csr: "Mike Chen",
  },
  {
    id: "INV-016",
    customer: "Advanced Analytics",
    amount: 185000.0,
    status: "ready",
    dueDate: "2024-04-01",
    invoiceDate: "2024-01-16",
    generator: "Generator M",
    facility: "Baytown",
    csr: "Emily Davis",
  },
  {
    id: "INV-017",
    customer: "Quantum Computing",
    amount: 295000.0,
    status: "open",
    dueDate: "2024-04-05",
    invoiceDate: "2024-01-17",
    generator: "Generator N",
    facility: "Freeport",
    csr: "Emily Davis",
  },
  {
    id: "INV-018",
    customer: "Blockchain Solutions",
    amount: 155000.0,
    status: "review",
    dueDate: "2024-04-10",
    invoiceDate: "2024-01-18",
    generator: "Generator O",
    facility: "Texas City",
    csr: "James Wilson",
  },
  {
    id: "INV-019",
    customer: "AI Innovations",
    amount: 225000.0,
    status: "open",
    dueDate: "2024-04-15",
    invoiceDate: "2024-01-19",
    generator: "Generator P",
    facility: "Richmond",
    csr: "James Wilson",
  },
  {
    id: "INV-020",
    customer: "Robotics Corp",
    amount: 195000.0,
    status: "ready",
    dueDate: "2024-04-20",
    invoiceDate: "2024-01-20",
    generator: "Generator Q",
    facility: "Whiting",
    csr: "Jennifer Lee",
  },
  {
    id: "INV-021",
    customer: "Space Technologies",
    amount: 350000.0,
    status: "open",
    dueDate: "2024-04-25",
    invoiceDate: "2024-01-21",
    generator: "Generator R",
    facility: "Gary",
    csr: "Jennifer Lee",
  },
  {
    id: "INV-022",
    customer: "Green Energy Co",
    amount: 145000.0,
    status: "review",
    dueDate: "2024-05-01",
    invoiceDate: "2024-01-22",
    generator: "Generator S",
    facility: "Commerce City",
    csr: "Robert Martinez",
  },
  {
    id: "INV-023",
    customer: "Sustainable Systems",
    amount: 185000.0,
    status: "open",
    dueDate: "2024-05-05",
    invoiceDate: "2024-01-23",
    generator: "Generator T",
    facility: "Sauget",
    csr: "Robert Martinez",
  },
  {
    id: "INV-024",
    customer: "Medical Devices Inc",
    amount: 275000.0,
    status: "ready",
    dueDate: "2024-05-10",
    invoiceDate: "2024-01-24",
    generator: "Generator U",
    facility: "Aragonite",
    csr: "Amanda Foster",
  },
  {
    id: "INV-025",
    customer: "Pharma Solutions",
    amount: 195000.0,
    status: "open",
    dueDate: "2024-05-15",
    invoiceDate: "2024-01-25",
    generator: "Generator V",
    facility: "Nashville",
    csr: "Amanda Foster",
  },
  {
    id: "INV-026",
    customer: "Financial Services",
    amount: 325000.0,
    status: "review",
    dueDate: "2024-05-20",
    invoiceDate: "2024-01-26",
    generator: "Generator W",
    facility: "Detroit",
    csr: "Christopher Brown",
  },
  {
    id: "INV-027",
    customer: "Investment Group",
    amount: 245000.0,
    status: "open",
    dueDate: "2024-05-25",
    invoiceDate: "2024-01-27",
    generator: "Generator X",
    facility: "Portland",
    csr: "Christopher Brown",
  },
  {
    id: "INV-028",
    customer: "Retail Solutions",
    amount: 165000.0,
    status: "ready",
    dueDate: "2024-06-01",
    invoiceDate: "2024-01-28",
    generator: "Generator Y",
    facility: "Memphis",
    csr: "Michelle Garcia",
  },
  {
    id: "INV-029",
    customer: "E-commerce Platform",
    amount: 225000.0,
    status: "open",
    dueDate: "2024-06-05",
    invoiceDate: "2024-01-29",
    generator: "Generator Z",
    facility: "Oklahoma City",
    csr: "Michelle Garcia",
  },
  {
    id: "INV-030",
    customer: "Logistics Corp",
    amount: 185000.0,
    status: "review",
    dueDate: "2024-06-10",
    invoiceDate: "2024-01-30",
    generator: "Generator AA",
    facility: "Las Vegas",
    csr: "Kevin Taylor",
  },
];

const statusBreakdown = [
  {
    status: "ready",
    count: 7,
    label: "Ready to Bill",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    status: "open",
    count: 15,
    label: "Open",
    color: "bg-blue-100 text-blue-800",
  },
  {
    status: "review",
    count: 5,
    label: "In Progress",
    color: "bg-amber-100 text-amber-800",
  },
  {
    status: "on-hold",
    count: 3,
    label: "On Hold",
    color: "bg-orange-100 text-orange-800",
  },
  {
    status: "finalized",
    count: 0,
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
  { month: "Jan 2024", total: 67500000.0, count: 30 },
  { month: "Dec 2023", total: 61800000.0, count: 25 },
  { month: "Nov 2023", total: 73200000.0, count: 28 },
  { month: "Oct 2023", total: 60900000.0, count: 22 },
];

// Monthly invoice data for running totals summary
const monthlyInvoiceData = [
  { month: "Jan 2024", total: 67500000.0, count: 30 },
  { month: "Dec 2023", total: 61800000.0, count: 25 },
  { month: "Nov 2023", total: 73200000.0, count: 28 },
  { month: "Oct 2023", total: 60900000.0, count: 22 },
  { month: "Sep 2023", total: 58700000.0, count: 21 },
  { month: "Aug 2023", total: 65400000.0, count: 24 },
  { month: "Jul 2023", total: 59800000.0, count: 23 },
  { month: "Jun 2023", total: 62300000.0, count: 22 },
  { month: "May 2023", total: 58900000.0, count: 20 },
  { month: "Apr 2023", total: 61200000.0, count: 21 },
  { month: "Mar 2023", total: 57800000.0, count: 19 },
  { month: "Feb 2023", total: 53400000.0, count: 18 },
];

// Draft invoices data - orders with draft invoices not yet finalized
const draftInvoices = [
  {
    id: "INV-DRAFT-001",
    customer: "Acme Corp",
    amount: 125000.0,
    status: "draft",
    dueDate: "2024-02-15",
    invoiceDate: "2024-01-15",
    generator: "Generator A",
    facility: "Emelle",
    csr: "Sarah Johnson",
  },
  {
    id: "INV-DRAFT-002",
    customer: "Tech Solutions Inc",
    amount: 87500.0,
    status: "draft",
    dueDate: "2024-02-20",
    invoiceDate: "2024-01-16",
    generator: "Generator B",
    facility: "Calvert City",
    csr: "Mike Chen",
  },
  {
    id: "INV-DRAFT-003",
    customer: "Global Industries",
    amount: 210000.0,
    status: "draft",
    dueDate: "2024-01-25",
    invoiceDate: "2024-01-10",
    generator: "Generator A",
    facility: "Emelle",
    csr: "Sarah Johnson",
  },
  {
    id: "INV-DRAFT-004",
    customer: "Local Business LLC",
    amount: 45000.0,
    status: "draft",
    dueDate: "2024-01-30",
    invoiceDate: "2024-01-12",
    generator: "Generator C",
    facility: "Glencoe",
    csr: "Lisa Rodriguez",
  },
  {
    id: "INV-DRAFT-005",
    customer: "Enterprise Solutions",
    amount: 320000.0,
    status: "draft",
    dueDate: "2024-02-05",
    invoiceDate: "2024-01-18",
    generator: "Generator B",
    facility: "Calvert City",
    csr: "Mike Chen",
  },
];

export default function InvoiceDashboard() {
  const router = useRouter();

  // Filter state
  const [filters, setFilters] = React.useState({
    customer: "all",
    facility: "all",
    csr: "all",
  });

  // Get unique values for filter dropdowns
  const uniqueCustomers = [
    ...new Set(mockInvoices.map((inv) => inv.customer)),
  ].sort();
  const uniqueFacilities = [
    ...new Set(mockInvoices.map((inv) => inv.facility)),
  ].sort();
  const uniqueCSRs = [...new Set(mockInvoices.map((inv) => inv.csr))].sort();

  // Apply filters to invoices
  const filteredInvoices = mockInvoices.filter((invoice) => {
    return (
      (filters.customer === "all" || invoice.customer === filters.customer) &&
      (filters.facility === "all" || invoice.facility === filters.facility) &&
      (filters.csr === "all" || invoice.csr === filters.csr)
    );
  });

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      customer: "all",
      facility: "all",
      csr: "all",
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.customer !== "all" ||
    filters.facility !== "all" ||
    filters.csr !== "all";

  // Calculate top customers by active invoice amount
  const getTopCustomersByActiveInvoices = (invoices: typeof mockInvoices) => {
    const customerTotals = invoices
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
  const getTopGeneratorsByActiveInvoices = (invoices: typeof mockInvoices) => {
    const generatorTotals = invoices
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
  const getTopFacilitiesByActiveInvoices = (invoices: typeof mockInvoices) => {
    const facilityTotals = invoices
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

  // Calculate CSR breakdown for "Ready to Bill" orders
  const getCSRBreakdownForReadyToBill = (invoices: typeof mockInvoices) => {
    const csrTotals = invoices
      .filter((inv) => inv.status === "ready")
      .reduce((acc, inv) => {
        acc[inv.csr] = (acc[inv.csr] || 0) + inv.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(csrTotals)
      .map(([csr, total]) => ({ csr, total }))
      .sort((a, b) => b.total - a.total);
  };

  // Calculate Facility breakdown for "Ready to Bill" orders with Pareto data
  const getFacilityBreakdownForReadyToBill = (
    invoices: typeof mockInvoices
  ) => {
    const facilityTotals = invoices
      .filter((inv) => inv.status === "ready")
      .reduce((acc, inv) => {
        acc[inv.facility] = (acc[inv.facility] || 0) + inv.amount;
        return acc;
      }, {} as Record<string, number>);

    const sortedFacilities = Object.entries(facilityTotals)
      .map(([facility, total]) => ({ facility, total }))
      .sort((a, b) => b.total - a.total);

    // Calculate cumulative percentages for Pareto analysis
    const totalAmount = sortedFacilities.reduce(
      (sum, item) => sum + item.total,
      0
    );
    let cumulativeAmount = 0;

    return sortedFacilities.map((item) => {
      cumulativeAmount += item.total;
      const cumulativePercentage = (cumulativeAmount / totalAmount) * 100;
      return {
        ...item,
        cumulativeAmount,
        cumulativePercentage: Math.round(cumulativePercentage * 100) / 100,
      };
    });
  };

  // Calculate breakdown for "Open", "In Progress", and "On Hold" orders
  const getActiveOrdersBreakdown = (invoices: typeof mockInvoices) => {
    const activeOrders = invoices.filter(
      (inv) =>
        inv.status === "open" ||
        inv.status === "review" ||
        inv.status === "on-hold"
    );

    const statusTotals = activeOrders.reduce((acc, inv) => {
      let statusLabel = inv.status;
      if (inv.status === "review") statusLabel = "In Progress";
      if (inv.status === "on-hold") statusLabel = "On Hold";

      acc[statusLabel] = (acc[statusLabel] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusTotals)
      .map(([status, total]) => ({ status, total }))
      .sort((a, b) => b.total - a.total);
  };

  // Calculate data using the functions
  const topCustomers = getTopCustomersByActiveInvoices(filteredInvoices);
  const topGenerators = getTopGeneratorsByActiveInvoices(filteredInvoices);
  const topFacilities = getTopFacilitiesByActiveInvoices(filteredInvoices);
  const csrBreakdown = getCSRBreakdownForReadyToBill(filteredInvoices);
  const facilityBreakdown =
    getFacilityBreakdownForReadyToBill(filteredInvoices);
  const activeOrdersBreakdown = getActiveOrdersBreakdown(filteredInvoices);

  const totalReadyToBill = filteredInvoices.filter(
    (inv) => inv.status === "ready"
  ).length;
  const totalReadyAmount = filteredInvoices
    .filter((inv) => inv.status === "ready")
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Calculate total amount of invoices in active statuses (not finalized or void)
  const totalActiveAmount = filteredInvoices
    .filter((inv) => inv.status !== "finalized" && inv.status !== "void")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ready: {
        variant: "default" as const,
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      },
      open: {
        variant: "secondary" as const,
        className: "bg-blue-50 text-blue-700 border-blue-200 font-medium",
        icon: <Clock2 className="h-3 w-3 mr-1" />,
      },
      review: {
        variant: "secondary" as const,
        className: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
        icon: <FileSpreadsheet className="h-3 w-3 mr-1" />,
      },
      finalized: {
        variant: "secondary" as const,
        className: "bg-slate-50 text-slate-700 border-slate-200 font-medium",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      void: {
        variant: "destructive" as const,
        className: "bg-red-50 text-red-700 border-red-200 font-medium",
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
      draft: {
        variant: "secondary" as const,
        className: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
        icon: <FileText className="h-3 w-3 mr-1" />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.open;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Invoice Management Dashboard
              </h1>
              <p className="text-slate-600 text-lg">
                Comprehensive overview of invoice pipeline and financial metrics
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Filter Button with Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {[
                          filters.customer !== "all" ? 1 : 0,
                          filters.facility !== "all" ? 1 : 0,
                          filters.csr !== "all" ? 1 : 0,
                        ].reduce((sum, count) => sum + count, 0)}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">
                        Filter Options
                      </h4>
                      {hasActiveFilters && (
                        <Button
                          variant="secondary"
                          onClick={resetFilters}
                          className="text-xs text-slate-600 hover:text-slate-800"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>

                    {/* Customer Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Customer
                      </label>
                      <Select
                        value={filters.customer}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, customer: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Customers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Customers</SelectItem>
                          {uniqueCustomers.map((customer) => (
                            <SelectItem key={customer} value={customer}>
                              {customer}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Facility Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Facility
                      </label>
                      <Select
                        value={filters.facility}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, facility: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Facilities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Facilities</SelectItem>
                          {uniqueFacilities.map((facility) => (
                            <SelectItem key={facility} value={facility}>
                              {facility}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* CSR Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Customer Service Rep
                      </label>
                      <Select
                        value={filters.csr}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, csr: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All CSRs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All CSRs</SelectItem>
                          {uniqueCSRs.map((csr) => (
                            <SelectItem key={csr} value={csr}>
                              {csr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-600 mb-2">
                          Active filters:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {filters.customer !== "all" && (
                            <Badge variant="secondary" className="text-xs">
                              {filters.customer}
                            </Badge>
                          )}
                          {filters.facility !== "all" && (
                            <Badge variant="secondary" className="text-xs">
                              {filters.facility}
                            </Badge>
                          )}
                          {filters.csr !== "all" && (
                            <Badge variant="secondary" className="text-xs">
                              {filters.csr}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Results Summary */}
        {hasActiveFilters && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Filtered Results: {filteredInvoices.length} of{" "}
                    {mockInvoices.length} invoices
                  </p>
                  <p className="text-xs text-blue-700">
                    Total Value: $
                    {filteredInvoices
                      .reduce((sum, inv) => sum + inv.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={resetFilters}
                className="text-blue-700 hover:text-blue-900"
              >
                View All
              </Button>
            </div>
          </div>
        )}
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Ready to Bill
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    {totalReadyToBill}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">
                    ${totalReadyAmount.toLocaleString()}
                  </p>
                </div>
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Active Invoices
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    ${(totalActiveAmount / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-slate-500 font-medium">
                    Not finalized/void
                  </p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Total Invoices
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mb-1">32</p>
                  <p className="text-sm text-slate-500 font-medium">
                    This month
                  </p>
                </div>
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Monthly Revenue
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    $67.5M
                  </p>
                  <p className="text-sm text-slate-500 font-medium">
                    This month
                  </p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts Section */}
        <div className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CSR Distribution Chart */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div>CSR Distribution</div>
                    <div className="text-sm font-normal text-slate-500">
                      Ready to Bill Orders
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={csrBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ csr, percent }) =>
                          `${csr} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="csr"
                      >
                        {csrBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#6366F1", // indigo-500
                                "#10B981", // emerald-500
                                "#8B5CF6", // violet-500
                                "#F59E0B", // amber-500
                                "#EC4899", // pink-500
                                "#3B82F6", // blue-500
                              ][index % 6]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `$${value.toLocaleString()}`,
                          "Amount",
                        ]}
                        labelFormatter={(label) => `CSR: ${label}`}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "8px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      $
                      {csrBreakdown
                        .reduce((sum, item) => sum + item.total, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      Total Ready to Bill
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Orders Status Chart */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div>Order Status Distribution</div>
                    <div className="text-sm font-normal text-slate-500">
                      Active Orders
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeOrdersBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percent }) =>
                          `${status} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="status"
                      >
                        {activeOrdersBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#3B82F6", // blue-500 for Open
                                "#F59E0B", // amber-500 for In Progress
                                "#EF4444", // red-500 for On Hold
                              ][index % 3]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `$${value.toLocaleString()}`,
                          "Amount",
                        ]}
                        labelFormatter={(label) => `Status: ${label}`}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "8px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      $
                      {activeOrdersBreakdown
                        .reduce((sum, item) => sum + item.total, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      Total Active Orders
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Facility Performance Analysis */}
        <div className="mb-10">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div>Facility Performance Analysis</div>
                  <div className="text-sm font-normal text-slate-500">
                    Ready to Bill Orders with Pareto Analysis
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={facilityBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="facility"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      interval={0}
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      axisLine={{ stroke: "#CBD5E1" }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}K`
                      }
                      tick={{ fontSize: 12, fill: "#64748B" }}
                      axisLine={{ stroke: "#CBD5E1" }}
                      label={{
                        value: "Amount ($K)",
                        angle: -90,
                        position: "insideLeft",
                        style: { fill: "#64748B", fontSize: 12 },
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => `${value.toFixed(0)}%`}
                      tick={{ fontSize: 12, fill: "#64748B" }}
                      axisLine={{ stroke: "#CBD5E1" }}
                      label={{
                        value: "Cumulative %",
                        angle: 90,
                        position: "insideRight",
                        style: { fill: "#64748B", fontSize: 12 },
                      }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "total"
                          ? `$${value.toLocaleString()}`
                          : `${value.toFixed(1)}%`,
                        name === "total" ? "Amount" : "Cumulative %",
                      ]}
                      labelFormatter={(label) => `Facility: ${label}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill="#3B82F6"
                      yAxisId="left"
                      name="total"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulativePercentage"
                      stroke="#EF4444"
                      strokeWidth={3}
                      yAxisId="right"
                      name="cumulativePercentage"
                      dot={{ fill: "#EF4444", strokeWidth: 2, r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {facilityBreakdown.length}
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    Active Facilities
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance Trends */}
        <div className="mb-10">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div>Monthly Performance Trends</div>
                  <div className="text-sm font-normal text-slate-500">
                    Invoice Volume and Revenue Analysis
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyInvoiceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#64748B" }}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                      tickLine={false}
                      axisLine={{ stroke: "#CBD5E1" }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      label={{
                        value: "Invoice Count",
                        angle: -90,
                        position: "insideLeft",
                        style: { fill: "#64748B", fontSize: 12 },
                      }}
                      tickLine={false}
                      axisLine={{ stroke: "#CBD5E1" }}
                      tick={{ fontSize: 12, fill: "#64748B" }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{
                        value: "Total Amount ($M)",
                        angle: 90,
                        position: "insideRight",
                        style: { fill: "#64748B", fontSize: 12 },
                      }}
                      tickLine={false}
                      axisLine={{ stroke: "#CBD5E1" }}
                      tick={{ fontSize: 12, fill: "#64748B" }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "count"
                          ? `${value} invoices`
                          : `$${(value / 1000000).toFixed(1)}M`,
                        name === "count" ? "Invoice Count" : "Total Amount",
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="count"
                      fill="#8B5CF6"
                      name="Invoice Count"
                      radius={[6, 6, 0, 0]}
                      opacity={0.8}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="total"
                      stroke="#10B981"
                      strokeWidth={4}
                      name="Total Amount"
                      dot={{ fill: "#10B981", strokeWidth: 3, r: 6 }}
                      connectNulls={false}
                      fill="none"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-xl font-semibold text-slate-900">
                      {monthlyInvoiceData
                        .reduce((sum, item) => sum + item.count, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      Total Invoices
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-slate-900">
                      $
                      {(
                        monthlyInvoiceData.reduce(
                          (sum, item) => sum + item.total,
                          0
                        ) / 1000000
                      ).toFixed(1)}
                      M
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      Total Revenue
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-slate-900">
                      {monthlyInvoiceData.length}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      Months Tracked
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Draft Invoice Management */}
        <div className="mb-10">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div>Draft Invoice Management</div>
                  <div className="text-sm font-normal text-slate-500">
                    Orders with draft invoices pending finalization
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">
                        Invoice ID
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">
                        Customer
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">
                        Amount
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">
                        Due Date
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">
                        CSR
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">
                        Facility
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-blue-600 text-sm">
                          {invoice.id}
                        </td>
                        <td className="py-4 px-4 text-slate-900 font-medium text-sm">
                          {invoice.customer}
                        </td>
                        <td className="py-4 px-4 text-slate-900 font-semibold text-sm">
                          ${invoice.amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="py-4 px-4 text-slate-600 text-sm">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-slate-700 text-sm">
                          {invoice.csr}
                        </td>
                        <td className="py-4 px-4 text-slate-700 text-sm">
                          {invoice.facility}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-xl font-semibold text-slate-900">
                      {draftInvoices.length}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      Draft Invoices
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-slate-900">
                      $
                      {draftInvoices
                        .reduce((sum, inv) => sum + inv.amount, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      Total Amount
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-slate-900">
                      {
                        draftInvoices.filter(
                          (inv) => new Date(inv.dueDate) < new Date()
                        ).length
                      }
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      Past Due
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analytics Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Customers Analysis */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div>Top Customers</div>
                    <div className="text-sm font-normal text-slate-500">
                      By Active Invoice Volume
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topCustomers}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        type="category"
                        dataKey="customer"
                        tick={{ fontSize: 11, fill: "#64748B" }}
                        angle={-15}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis
                        type="number"
                        tickFormatter={(value) =>
                          `$${(value / 1000000).toFixed(1)}M`
                        }
                        tick={{ fontSize: 12, fill: "#64748B" }}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `$${value.toLocaleString()}`,
                          "Amount",
                        ]}
                        labelFormatter={(label) => `Customer: ${label}`}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "8px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Generators Analysis */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <div>Top Generators</div>
                    <div className="text-sm font-normal text-slate-500">
                      By Active Invoice Volume
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topGenerators}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        type="category"
                        dataKey="generator"
                        tick={{ fontSize: 11, fill: "#64748B" }}
                        angle={-15}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis
                        type="number"
                        tickFormatter={(value) =>
                          `$${(value / 1000000).toFixed(1)}M`
                        }
                        tick={{ fontSize: 12, fill: "#64748B" }}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `$${value.toLocaleString()}`,
                          "Amount",
                        ]}
                        labelFormatter={(label) => `Generator: ${label}`}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "8px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#8B5CF6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
