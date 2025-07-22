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
  Plus,
  Upload,
  Paperclip,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// Interface for price change request data
interface PriceChangeRequest {
  requestId: string;
  subject: string;
  description: string;
  requestType: "Customer" | "Multiple Customers" | "General/Global";
  customerId?: string;
  customerName?: string;
  assignedTo: string;
  status:
    | "Draft"
    | "Submitted"
    | "In Review"
    | "Approved"
    | "In Progress"
    | "Completed"
    | "Rejected";
  submittedBy: string;
  submittedDate: string;
  attachments: string[];
  notes?: string;
}

interface FilterState {
  subject: string;
  requestType: string;
  status: string;
  assignedTo: string;
  submittedDateFrom: string;
  submittedDateTo: string;
  customer: string;
}

interface CreateRequestModalState {
  isOpen: boolean;
  subject: string;
  description: string;
  requestType: "Customer" | "Multiple Customers" | "General/Global";
  customerId: string;
  assignedTo: string;
  attachments: File[];
}

// Mock service for price change requests
class PriceChangeRequestService {
  async getPriceChangeRequests(): Promise<PriceChangeRequest[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
      {
        requestId: "PCR-2024-001",
        subject: "Annual Rate Increase for Acme Corporation",
        description:
          "Implement 5% annual rate increase across all services for Acme Corporation effective March 1, 2024. This increase aligns with our annual pricing review and market conditions.",
        requestType: "Customer",
        customerId: "CUST-001",
        customerName: "Acme Corporation",
        assignedTo: "Sarah Johnson",
        status: "In Progress",
        submittedBy: "John Smith",
        submittedDate: "2024-01-15",
        attachments: ["rate_increase_proposal.pdf", "customer_approval.pdf"],
        notes: "Customer approved the increase on 1/20/2024",
      },
      {
        requestId: "PCR-2024-002",
        subject: "Utah State Contract Pricing Update",
        description:
          "Update pricing structure for all Utah state contracts to reflect new regulatory requirements and competitive market positioning.",
        requestType: "Multiple Customers",
        assignedTo: "David Brown",
        status: "In Review",
        submittedBy: "Mike Wilson",
        submittedDate: "2024-01-20",
        attachments: ["utah_contracts.xlsx", "regulatory_changes.pdf"],
      },
      {
        requestId: "PCR-2024-003",
        subject: "Global Fuel Surcharge Adjustment",
        description:
          "Implement new fuel surcharge calculation methodology across all customers to better reflect current fuel costs and market volatility.",
        requestType: "General/Global",
        assignedTo: "Michael Chen",
        status: "Approved",
        submittedBy: "Lisa Davis",
        submittedDate: "2024-01-25",
        attachments: ["fuel_analysis.xlsx", "approval_document.pdf"],
      },
      {
        requestId: "PCR-2024-004",
        subject: "Tech Solutions Inc - New Service Pricing",
        description:
          "Create pricing for new hazardous waste disposal service for Tech Solutions Inc. This is a new service offering that requires custom pricing structure.",
        requestType: "Customer",
        customerId: "CUST-002",
        customerName: "Tech Solutions Inc",
        assignedTo: "Sarah Johnson",
        status: "Submitted",
        submittedBy: "Robert Taylor",
        submittedDate: "2024-01-30",
        attachments: ["service_specifications.pdf", "pricing_proposal.docx"],
      },
      {
        requestId: "PCR-2024-005",
        subject: "Environmental Services LLC - Volume Discount",
        description:
          "Implement tiered volume discount structure for Environmental Services LLC based on their increased waste volume projections.",
        requestType: "Customer",
        customerId: "CUST-005",
        customerName: "Environmental Services LLC",
        assignedTo: "Emily Rodriguez",
        status: "Draft",
        submittedBy: "Jennifer Adams",
        submittedDate: "2024-02-01",
        attachments: ["volume_analysis.xlsx"],
      },
      {
        requestId: "PCR-2024-006",
        subject: "Industry-Wide Compliance Fee Update",
        description:
          "Update compliance fees across all customers to reflect new EPA regulations and increased compliance costs.",
        requestType: "General/Global",
        assignedTo: "Alex Thompson",
        status: "In Review",
        submittedBy: "Tom Wilson",
        submittedDate: "2024-02-05",
        attachments: ["epa_regulations.pdf", "cost_analysis.xlsx"],
      },
      {
        requestId: "PCR-2024-007",
        subject: "Waste Management Corp - Emergency Service Pricing",
        description:
          "Establish emergency response service pricing for Waste Management Corp for after-hours and weekend emergency cleanups.",
        requestType: "Customer",
        customerId: "CUST-006",
        customerName: "Waste Management Corp",
        assignedTo: "David Brown",
        status: "Completed",
        submittedBy: "Maria Garcia",
        submittedDate: "2024-02-10",
        attachments: ["emergency_service_agreement.pdf"],
        notes: "Successfully implemented on 2/15/2024",
      },
      {
        requestId: "PCR-2024-008",
        subject: "Clean Energy Solutions - Renewable Energy Credit Pricing",
        description:
          "Develop pricing structure for renewable energy credit trading services for Clean Energy Solutions.",
        requestType: "Customer",
        customerId: "CUST-007",
        customerName: "Clean Energy Solutions",
        assignedTo: "Michael Chen",
        status: "Submitted",
        submittedBy: "Alex Thompson",
        submittedDate: "2024-02-12",
        attachments: [
          "renewable_energy_analysis.pdf",
          "credit_trading_proposal.docx",
        ],
      },
    ];
  }

  async createPriceChangeRequest(
    request: Omit<PriceChangeRequest, "requestId" | "submittedDate" | "status">
  ): Promise<PriceChangeRequest> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newRequest: PriceChangeRequest = {
      ...request,
      requestId: `PCR-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 1000)
      ).padStart(3, "0")}`,
      submittedDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };

    console.log("Created new price change request:", newRequest);
    return newRequest;
  }
}

const priceChangeRequestService = new PriceChangeRequestService();

// Available team members
const TEAM_MEMBERS = [
  "Sarah Johnson",
  "David Brown",
  "Michael Chen",
  "Emily Rodriguez",
  "Alex Thompson",
];

// Available customers
const CUSTOMERS = [
  { id: "CUST-001", name: "Acme Corporation" },
  { id: "CUST-002", name: "Tech Solutions Inc" },
  { id: "CUST-003", name: "Green Energy Co" },
  { id: "CUST-004", name: "Industrial Cleanup Ltd" },
  { id: "CUST-005", name: "Environmental Services LLC" },
  { id: "CUST-006", name: "Waste Management Corp" },
  { id: "CUST-007", name: "Clean Energy Solutions" },
];

export default function PriceChangeRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<PriceChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    subject: "",
    requestType: "all",
    status: "all",
    assignedTo: "all",
    submittedDateFrom: "",
    submittedDateTo: "",
    customer: "",
  });

  // Create request modal state
  const [createModal, setCreateModal] = useState<CreateRequestModalState>({
    isOpen: false,
    subject: "",
    description: "",
    requestType: "Customer",
    customerId: "",
    assignedTo: "",
    attachments: [],
  });

  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const data = await priceChangeRequestService.getPriceChangeRequests();
        setRequests(data);
      } catch (error) {
        console.error("Failed to load price change requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  // Filter requests based on current filters
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSubject =
        !filters.subject ||
        request.subject.toLowerCase().includes(filters.subject.toLowerCase());
      const matchesRequestType =
        filters.requestType === "all" ||
        request.requestType === filters.requestType;
      const matchesStatus =
        filters.status === "all" || request.status === filters.status;
      const matchesAssignedTo =
        filters.assignedTo === "all" ||
        request.assignedTo === filters.assignedTo;
      const matchesCustomer =
        !filters.customer ||
        (request.customerName &&
          request.customerName
            .toLowerCase()
            .includes(filters.customer.toLowerCase()));

      // Date filtering
      let matchesSubmittedDate = true;
      if (filters.submittedDateFrom) {
        const submittedDate = new Date(request.submittedDate);
        const fromDate = new Date(filters.submittedDateFrom);
        matchesSubmittedDate =
          matchesSubmittedDate && submittedDate >= fromDate;
      }
      if (filters.submittedDateTo) {
        const submittedDate = new Date(request.submittedDate);
        const toDate = new Date(filters.submittedDateTo);
        matchesSubmittedDate = matchesSubmittedDate && submittedDate <= toDate;
      }

      return (
        matchesSubject &&
        matchesRequestType &&
        matchesStatus &&
        matchesAssignedTo &&
        matchesCustomer &&
        matchesSubmittedDate
      );
    });
  }, [requests, filters]);

  const handleBack = () => {
    router.back();
  };

  const handleRequestClick = (request: PriceChangeRequest) => {
    // Navigate to the request details page
    router.push(`/change-requests/${request.requestId}`);
  };

  const handleCreateRequest = () => {
    setCreateModal({
      isOpen: true,
      subject: "",
      description: "",
      requestType: "Customer",
      customerId: "",
      assignedTo: "",
      attachments: [],
    });
  };

  const handleCreateSubmit = async () => {
    if (!createModal.subject.trim() || !createModal.assignedTo) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (createModal.requestType === "Customer" && !createModal.customerId) {
      toast.error("Please select a customer for customer-specific requests");
      return;
    }

    try {
      const customer = CUSTOMERS.find((c) => c.id === createModal.customerId);
      const newRequest =
        await priceChangeRequestService.createPriceChangeRequest({
          subject: createModal.subject,
          description: createModal.description,
          requestType: createModal.requestType,
          customerId: createModal.customerId || undefined,
          customerName: customer?.name || undefined,
          assignedTo: createModal.assignedTo,
          submittedBy: "Current User", // This would come from auth context
          attachments: createModal.attachments.map((f) => f.name),
          notes: undefined,
        });

      // Add to local state
      setRequests((prev) => [newRequest, ...prev]);

      toast.success("Price change request created successfully");

      // Close modal
      setCreateModal({
        isOpen: false,
        subject: "",
        description: "",
        requestType: "Customer",
        customerId: "",
        assignedTo: "",
        attachments: [],
      });
    } catch (error) {
      console.error("Failed to create price change request:", error);
      toast.error("Failed to create price change request");
    }
  };

  const handleCreateCancel = () => {
    setCreateModal({
      isOpen: false,
      subject: "",
      description: "",
      requestType: "Customer",
      customerId: "",
      assignedTo: "",
      attachments: [],
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setCreateModal((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setCreateModal((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const clearFilters = () => {
    setFilters({
      subject: "",
      requestType: "all",
      status: "all",
      assignedTo: "all",
      submittedDateFrom: "",
      submittedDateTo: "",
      customer: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Draft: {
        variant: "outline" as const,
        label: "Draft",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
      Submitted: {
        variant: "secondary" as const,
        label: "Submitted",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      "In Review": {
        variant: "outline" as const,
        label: "In Review",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      Approved: {
        variant: "default" as const,
        label: "Approved",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      "In Progress": {
        variant: "outline" as const,
        label: "In Progress",
        className: "bg-orange-100 text-orange-800 border-orange-200",
      },
      Completed: {
        variant: "default" as const,
        label: "Completed",
        className: "bg-green-600 text-white border-green-600",
      },
      Rejected: {
        variant: "destructive" as const,
        label: "Rejected",
        className: "bg-red-100 text-red-800 border-red-200",
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

  const getRequestTypeBadge = (type: string) => {
    const typeConfig = {
      Customer: {
        variant: "secondary" as const,
        label: "Customer",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      "Multiple Customers": {
        variant: "outline" as const,
        label: "Multiple",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      "General/Global": {
        variant: "outline" as const,
        label: "Global",
        className: "bg-orange-100 text-orange-800 border-orange-200",
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      variant: "outline" as const,
      label: type,
      className: "",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
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
              <p className="text-gray-600">Loading price change requests...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Price Change Requests
              </h1>
              <div className="flex items-center space-x-4 my-2">
                <Badge
                  variant="default"
                  className="bg-green-600 text-white border-green-600 shadow-sm font-medium px-3 py-1"
                >
                  {
                    requests.filter((r) => r.assignedTo === "Sarah Johnson")
                      .length
                  }{" "}
                  assigned to me
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800 border-gray-300 shadow-sm font-medium px-3 py-1"
                >
                  {requests.length} total requests
                </Badge>
              </div>
              <p className="text-gray-600">
                Create and manage formal requests for pricing changes across
                customers and services
              </p>
            </div>
            <Button
              onClick={handleCreateRequest}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Request</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end mb-4 mt-4">
              {/* Subject Filter */}
              <div>
                <Label>Subject</Label>
                <Input
                  placeholder="Search subjects..."
                  value={filters.subject}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, subject: e.target.value }))
                  }
                  className="w-48"
                />
              </div>

              {/* Request Type Filter */}
              <div>
                <Label>Request Type</Label>
                <Select
                  value={filters.requestType}
                  onValueChange={(value) =>
                    setFilters((f) => ({ ...f, requestType: value }))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Multiple Customers">Multiple</SelectItem>
                    <SelectItem value="General/Global">Global</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned To Filter */}
              <div>
                <Label>Assigned To</Label>
                <Select
                  value={filters.assignedTo}
                  onValueChange={(value) =>
                    setFilters((f) => ({ ...f, assignedTo: value }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All team members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All team members</SelectItem>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="David Brown">David Brown</SelectItem>
                    <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                    <SelectItem value="Emily Rodriguez">
                      Emily Rodriguez
                    </SelectItem>
                    <SelectItem value="Alex Thompson">Alex Thompson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                                key === "status" ||
                                key === "assignedTo" ||
                                key === "requestType"
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
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No price change requests found
                </h3>
                <p className="text-gray-600">
                  {Object.entries(filters).some(
                    ([key, value]) =>
                      ["all", "", undefined, null].indexOf(value as any) === -1
                  )
                    ? "Try adjusting your filters to see more results."
                    : "No price change requests have been created yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Attachments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow
                        key={request.requestId}
                        className="cursor-pointer transition-colors hover:bg-gray-50"
                        onClick={() => handleRequestClick(request)}
                      >
                        <TableCell>
                          <div className="font-medium text-blue-600 hover:text-blue-800">
                            {request.requestId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-900 truncate">
                              {request.subject}
                            </div>
                            {request.description && (
                              <div className="text-sm text-gray-500 truncate">
                                {request.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRequestTypeBadge(request.requestType)}
                        </TableCell>
                        <TableCell>
                          {request.customerName ? (
                            <div className="flex items-center space-x-2">
                              <span>{request.customerName}</span>
                              <Badge
                                variant="secondary"
                                className="uppercase text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-gray-300"
                              >
                                {request.customerId}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">
                              {request.requestType === "Multiple Customers"
                                ? "Multiple"
                                : "Global"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{request.assignedTo}</span>
                            {request.assignedTo === "Sarah Johnson" && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-600 text-white"
                              >
                                Me
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {formatDate(request.submittedDate)}
                        </TableCell>
                        <TableCell>
                          {request.attachments.length > 0 ? (
                            <div className="flex items-center space-x-1">
                              <Paperclip className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {request.attachments.length}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Request Modal */}
        <Dialog
          open={createModal.isOpen}
          onOpenChange={(open) =>
            setCreateModal((prev) => ({ ...prev, isOpen: open }))
          }
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Price Change Request</DialogTitle>
              <DialogDescription>
                Create a formal request for pricing changes. All fields marked
                with * are required.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Subject */}
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief summary of the change request"
                  value={createModal.subject}
                  onChange={(e) =>
                    setCreateModal((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed explanation of the request and reasoning"
                  value={createModal.description}
                  onChange={(e) =>
                    setCreateModal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>

              {/* Request Type */}
              <div>
                <Label htmlFor="requestType">Request Type *</Label>
                <Select
                  value={createModal.requestType}
                  onValueChange={(
                    value: "Customer" | "Multiple Customers" | "General/Global"
                  ) =>
                    setCreateModal((prev) => ({
                      ...prev,
                      requestType: value,
                      customerId: value !== "Customer" ? "" : prev.customerId,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Multiple Customers">
                      Multiple Customers
                    </SelectItem>
                    <SelectItem value="General/Global">
                      General/Global
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer (only show if Request Type is Customer) */}
              {createModal.requestType === "Customer" && (
                <div>
                  <Label htmlFor="customer">Customer *</Label>
                  <Select
                    value={createModal.customerId}
                    onValueChange={(value) =>
                      setCreateModal((prev) => ({ ...prev, customerId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOMERS.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Assigned To */}
              <div>
                <Label htmlFor="assignedTo">Assigned To *</Label>
                <Select
                  value={createModal.assignedTo}
                  onValueChange={(value) =>
                    setCreateModal((prev) => ({ ...prev, assignedTo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_MEMBERS.map((member) => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Attachments */}
              <div>
                <Label>Attachments</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-gray-500" />
                  </div>

                  {createModal.attachments.length > 0 && (
                    <div className="space-y-1">
                      {createModal.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700">
                            {file.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCreateCancel}>
                Cancel
              </Button>
              <Button onClick={handleCreateSubmit}>Create Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
