"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  FileText,
  Eye,
  X,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// Interface for quote queue data
interface QuoteQueueItem {
  quoteId: string;
  quoteName: string;
  customerId: string;
  customerName: string;
  salesRep: string;
  assignedTeamMember: string;
  assignmentNotes?: string;
  status: "New" | "In-Progress" | "Active";
  submittedDate: string;
  effectiveDate: string;
  expirationDate: string;
  totalValue: number;
  itemCount: number;
}

interface FilterState {
  customer: string;
  quote: string;
  status: string;
  submittedDateFrom: string;
  submittedDateTo: string;
  salesRep: string;
  assignedTeamMember: string;
}

interface AssignmentModalState {
  isOpen: boolean;
  quote: QuoteQueueItem | null;
  selectedTeamMember: string;
  notes: string;
}

// Mock service for quote queue
class QuoteQueueService {
  async getQuoteQueue(): Promise<QuoteQueueItem[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
      {
        quoteId: "Q-2024-001",
        quoteName: "Q-2024-001",
        customerId: "CUST-001",
        customerName: "Acme Corporation",
        salesRep: "John Smith",
        assignedTeamMember: "Sarah Johnson",
        assignmentNotes: "High priority customer - needs quick turnaround",
        status: "New",
        submittedDate: "2024-01-15",
        effectiveDate: "2024-02-01",
        expirationDate: "2024-12-31",
        totalValue: 1250.0,
        itemCount: 5,
      },
      {
        quoteId: "Q-2024-002",
        quoteName: "Q-2024-002",
        customerId: "CUST-002",
        customerName: "Tech Solutions Inc",
        salesRep: "Mike Wilson",
        assignedTeamMember: "David Brown",
        assignmentNotes: "Complex pricing structure - review carefully",
        status: "In-Progress",
        submittedDate: "2024-01-20",
        effectiveDate: "2024-03-01",
        expirationDate: "2024-12-31",
        totalValue: 850.0,
        itemCount: 3,
      },
      {
        quoteId: "Q-2024-003",
        quoteName: "Q-2024-003",
        customerId: "CUST-003",
        customerName: "Green Energy Co",
        salesRep: "Lisa Davis",
        assignedTeamMember: "Sarah Johnson",
        status: "In-Progress",
        submittedDate: "2024-01-25",
        effectiveDate: "2024-02-15",
        expirationDate: "2024-12-31",
        totalValue: 2100.0,
        itemCount: 8,
      },
      {
        quoteId: "Q-2024-004",
        quoteName: "Q-2024-004",
        customerId: "CUST-001",
        customerName: "Acme Corporation",
        salesRep: "John Smith",
        assignedTeamMember: "David Brown",
        status: "In-Progress",
        submittedDate: "2024-01-30",
        effectiveDate: "2024-04-01",
        expirationDate: "2024-12-31",
        totalValue: 450.0,
        itemCount: 2,
      },
      {
        quoteId: "Q-2024-005",
        quoteName: "Q-2024-005",
        customerId: "CUST-004",
        customerName: "Industrial Cleanup Ltd",
        salesRep: "Robert Taylor",
        assignedTeamMember: "Sarah Johnson",
        status: "New",
        submittedDate: "2024-02-01",
        effectiveDate: "2024-03-15",
        expirationDate: "2024-12-31",
        totalValue: 1800.0,
        itemCount: 6,
      },
      {
        quoteId: "Q-2024-006",
        quoteName: "Q-2024-006",
        customerId: "CUST-005",
        customerName: "Environmental Services LLC",
        salesRep: "Jennifer Adams",
        assignedTeamMember: "Michael Chen",
        status: "In-Progress",
        submittedDate: "2024-02-05",
        effectiveDate: "2024-03-01",
        expirationDate: "2024-12-31",
        totalValue: 3200.0,
        itemCount: 10,
      },
      {
        quoteId: "Q-2024-007",
        quoteName: "Q-2024-007",
        customerId: "CUST-006",
        customerName: "Waste Management Corp",
        salesRep: "Tom Wilson",
        assignedTeamMember: "",
        status: "New",
        submittedDate: "2024-02-10",
        effectiveDate: "2024-04-01",
        expirationDate: "2024-12-31",
        totalValue: 950.0,
        itemCount: 4,
      },
      {
        quoteId: "Q-2024-008",
        quoteName: "Q-2024-008",
        customerId: "CUST-007",
        customerName: "Clean Energy Solutions",
        salesRep: "Maria Garcia",
        assignedTeamMember: "",
        status: "New",
        submittedDate: "2024-02-12",
        effectiveDate: "2024-03-15",
        expirationDate: "2024-12-31",
        totalValue: 1800.0,
        itemCount: 7,
      },
    ];
  }

  async assignQuote(
    quoteId: string,
    teamMember: string,
    notes?: string
  ): Promise<void> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(
      `Assigning quote ${quoteId} to ${teamMember} with notes: ${notes}`
    );
  }
}

const quoteQueueService = new QuoteQueueService();

// Available team members
const TEAM_MEMBERS = [
  "Sarah Johnson",
  "David Brown",
  "Michael Chen",
  "Emily Rodriguez",
  "Alex Thompson",
];

export default function QuoteQueuePage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    customer: "",
    quote: "",
    status: "all",
    submittedDateFrom: "",
    submittedDateTo: "",
    salesRep: "",
    assignedTeamMember: "all",
  });

  // Assignment modal state
  const [assignmentModal, setAssignmentModal] = useState<AssignmentModalState>({
    isOpen: false,
    quote: null,
    selectedTeamMember: "",
    notes: "",
  });

  useEffect(() => {
    const loadQuotes = async () => {
      setIsLoading(true);
      try {
        const data = await quoteQueueService.getQuoteQueue();
        setQuotes(data);
      } catch (error) {
        console.error("Failed to load quote queue:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotes();
  }, []);

  // Filter quotes based on current filters
  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const matchesCustomer =
        !filters.customer ||
        quote.customerName
          .toLowerCase()
          .includes(filters.customer.toLowerCase());
      const matchesQuote =
        !filters.quote ||
        quote.quoteName.toLowerCase().includes(filters.quote.toLowerCase());
      const matchesStatus =
        filters.status === "all" || quote.status === filters.status;
      const matchesSalesRep =
        !filters.salesRep ||
        quote.salesRep.toLowerCase().includes(filters.salesRep.toLowerCase());
      const matchesAssignedTeamMember =
        !filters.assignedTeamMember ||
        filters.assignedTeamMember === "all" ||
        (filters.assignedTeamMember === "Me" &&
          quote.assignedTeamMember === "Sarah Johnson") ||
        (filters.assignedTeamMember !== "Me" &&
          filters.assignedTeamMember !== "all" &&
          quote.assignedTeamMember
            .toLowerCase()
            .includes(filters.assignedTeamMember.toLowerCase()));

      // Date filtering
      let matchesSubmittedDate = true;
      if (filters.submittedDateFrom) {
        const submittedDate = new Date(quote.submittedDate);
        const fromDate = new Date(filters.submittedDateFrom);
        matchesSubmittedDate =
          matchesSubmittedDate && submittedDate >= fromDate;
      }
      if (filters.submittedDateTo) {
        const submittedDate = new Date(quote.submittedDate);
        const toDate = new Date(filters.submittedDateTo);
        matchesSubmittedDate = matchesSubmittedDate && submittedDate <= toDate;
      }

      return (
        matchesCustomer &&
        matchesQuote &&
        matchesStatus &&
        matchesSalesRep &&
        matchesAssignedTeamMember &&
        matchesSubmittedDate
      );
    });
  }, [quotes, filters]);

  const handleBack = () => {
    router.back();
  };

  const handleQuoteClick = (quote: QuoteQueueItem) => {
    // Navigate to the pricing group page
    router.push(`/customer-pricing/${quote.customerId}/group/${quote.quoteId}`);
  };

  const handleAssignClick = (e: React.MouseEvent, quote: QuoteQueueItem) => {
    e.stopPropagation();
    setAssignmentModal({
      isOpen: true,
      quote,
      selectedTeamMember: quote.assignedTeamMember || "",
      notes: quote.assignmentNotes || "",
    });
  };

  const handleAssignmentSubmit = async () => {
    if (!assignmentModal.quote || !assignmentModal.selectedTeamMember) return;

    try {
      await quoteQueueService.assignQuote(
        assignmentModal.quote.quoteId,
        assignmentModal.selectedTeamMember,
        assignmentModal.notes || undefined
      );

      // Update local state
      setQuotes((prev) =>
        prev.map((quote) =>
          quote.quoteId === assignmentModal.quote!.quoteId
            ? {
                ...quote,
                assignedTeamMember: assignmentModal.selectedTeamMember,
                assignmentNotes: assignmentModal.notes || undefined,
              }
            : quote
        )
      );

      // Show appropriate success message
      const action = assignmentModal.quote!.assignedTeamMember
        ? "reassigned"
        : "assigned";
      toast.success(`Quote ${action} to ${assignmentModal.selectedTeamMember}`);

      // Close modal
      setAssignmentModal({
        isOpen: false,
        quote: null,
        selectedTeamMember: "",
        notes: "",
      });
    } catch (error) {
      console.error("Failed to assign quote:", error);
      // You could add a toast notification here
    }
  };

  const handleAssignmentCancel = () => {
    setAssignmentModal({
      isOpen: false,
      quote: null,
      selectedTeamMember: "",
      notes: "",
    });
  };

  const clearFilters = () => {
    setFilters({
      customer: "",
      quote: "",
      status: "all",
      submittedDateFrom: "",
      submittedDateTo: "",
      salesRep: "",
      assignedTeamMember: "all",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      New: {
        variant: "secondary" as const,
        label: "New",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      "In-Progress": {
        variant: "outline" as const,
        label: "In-Progress",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      Active: {
        variant: "default" as const,
        label: "Active",
        className: "bg-green-100 text-green-800 border-green-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      label: status,
      className: "",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full max-w-[1800px] mx-auto px-2">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quote queue...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-[1800px] mx-auto px-2">
        {/* Header */}
        <div className="mb-8">
          {/* <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button> */}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quote Queue
              </h1>
              <div className="flex items-center space-x-4 my-2">
                <Badge
                  variant="default"
                  className="bg-green-600 text-white border-green-600 shadow-sm font-medium px-3 py-1"
                >
                  {
                    quotes.filter(
                      (q) => q.assignedTeamMember === "Sarah Johnson"
                    ).length
                  }{" "}
                  assigned to me
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800 border-gray-300 shadow-sm font-medium px-3 py-1"
                >
                  {quotes.length} total in queue
                </Badge>
              </div>
              <p className="text-gray-600">
                Review and manage quotes with "New" or "In-Progress" status
                across all customers
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            {/* <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>Quote Queue</span>
                <Badge variant="outline">{filteredQuotes.length} quotes</Badge>
              </CardTitle>
            </div> */}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end mb-4 mt-4">
              {/* Customer Filter */}
              <div>
                <Label>Customer</Label>
                <Input
                  placeholder="Search customers..."
                  value={filters.customer}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, customer: e.target.value }))
                  }
                  className="w-48"
                />
              </div>

              {/* Quote Filter */}
              <div>
                <Label>Quote</Label>
                <Input
                  placeholder="Search quotes..."
                  value={filters.quote}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, quote: e.target.value }))
                  }
                  className="w-48"
                />
              </div>

              {/* Status Filter */}
              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters((f) => ({ ...f, status: value }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In-Progress">In-Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned Team Member Filter */}
              <div>
                <Label>Assigned To</Label>
                <Select
                  value={filters.assignedTeamMember}
                  onValueChange={(value) =>
                    setFilters((f) => ({ ...f, assignedTeamMember: value }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All team members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All team members</SelectItem>
                    <SelectItem value="Me">Me</SelectItem>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="David Brown">David Brown</SelectItem>
                    <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sales Rep Filter */}
              <div>
                <Label>Sales Rep</Label>
                <Input
                  placeholder="Search sales rep..."
                  value={filters.salesRep}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, salesRep: e.target.value }))
                  }
                  className="w-48"
                />
              </div>

              {/* Submitted Date Range Filter */}
              <div>
                <Label>Submitted Date</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.submittedDateFrom}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        submittedDateFrom: e.target.value,
                      }))
                    }
                    className="w-36"
                  />
                  <span className="self-center">to</span>
                  <Input
                    type="date"
                    value={filters.submittedDateTo}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        submittedDateTo: e.target.value,
                      }))
                    }
                    className="w-36"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Chips */}
            {Object.entries(filters).some(
              ([key, value]) =>
                ["all", "", undefined, null].indexOf(value as any) === -1
            ) && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 items-center p-3 rounded-md bg-primary-0-shaded-6 border border-primary-1/20">
                  {Object.entries(filters)
                    .filter(
                      ([key, value]) =>
                        ["all", "", undefined, null].indexOf(value as any) ===
                        -1
                    )
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center bg-white text-neutral-0 rounded px-2 py-1 text-xs font-medium shadow-sm"
                      >
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                        : {value}
                        <button
                          className="ml-1 text-neutral-0 hover:text-neutral-1"
                          onClick={() =>
                            setFilters((f) => ({
                              ...f,
                              [key]:
                                key === "status" || key === "assignedTeamMember"
                                  ? "all"
                                  : "",
                            }))
                          }
                          aria-label={`Remove filter ${key}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-neutral-0 hover:text-neutral-1 h-6 px-2"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No quotes in queue found
                </h3>
                <p className="text-gray-600">
                  {Object.entries(filters).some(
                    ([key, value]) =>
                      ["all", "", undefined, null].indexOf(value as any) === -1
                  )
                    ? "Try adjusting your filters to see more results."
                    : "All quotes are either active or there are no new/in-progress quotes."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Sales Rep</TableHead>
                      <TableHead>Assigned Team Member</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Effective Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => (
                      <TableRow
                        key={quote.quoteId}
                        className={`cursor-pointer transition-colors ${
                          quote.status === "New"
                            ? "hover:bg-blue-50"
                            : quote.status === "In-Progress"
                            ? "hover:bg-yellow-50 "
                            : quote.status === "Active"
                            ? "hover:bg-green-50 "
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleQuoteClick(quote)}
                      >
                        <TableCell>
                          <div className="font-medium text-blue-600 hover:text-blue-800">
                            {quote.quoteName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{quote.customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{quote.salesRep}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {quote.assignedTeamMember ? (
                              <>
                                <User className="h-4 w-4 text-gray-500" />
                                <span>{quote.assignedTeamMember}</span>
                                {quote.assignedTeamMember ===
                                  "Sarah Johnson" && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-green-600 text-white"
                                  >
                                    Me
                                  </Badge>
                                )}
                                {quote.assignmentNotes && (
                                  <div className="relative group">
                                    <MessageSquare className="h-4 w-4 text-blue-500 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                      {quote.assignmentNotes}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 italic">
                                Unassigned
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(quote.status)}</TableCell>
                        <TableCell>{formatDate(quote.submittedDate)}</TableCell>
                        <TableCell>{formatDate(quote.effectiveDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
