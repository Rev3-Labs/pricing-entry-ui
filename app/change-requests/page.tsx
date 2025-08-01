"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

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
        label: "Draft",
        className: "bg-[rgba(158,158,158,0.1)] text-[#616161]",
      },
      Submitted: {
        label: "Submitted",
        className: "bg-[rgba(25,118,210,0.1)] text-[#1976d2]",
      },
      "In Review": {
        label: "In Review",
        className: "bg-[rgba(255,152,0,0.1)] text-[#f57c00]",
      },
      Approved: {
        label: "Approved",
        className: "bg-[rgba(76,175,80,0.1)] text-[#2e7d32]",
      },
      "In Progress": {
        label: "In Progress",
        className: "bg-[rgba(255,111,0,0.1)] text-[#ef6c00]",
      },
      Completed: {
        label: "Completed",
        className: "bg-[#65b230] text-white",
      },
      Rejected: {
        label: "Rejected",
        className: "bg-[rgba(244,67,54,0.1)] text-[#d32f2f]",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-[rgba(158,158,158,0.1)] text-[#616161]",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-['Roboto:Medium',_sans-serif] font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const getRequestTypeBadge = (type: string) => {
    const typeConfig = {
      Customer: {
        label: "Customer",
        className: "bg-[rgba(25,118,210,0.1)] text-[#1976d2]",
      },
      "Multiple Customers": {
        label: "Multiple",
        className: "bg-[rgba(156,39,176,0.1)] text-[#7b1fa2]",
      },
      "General/Global": {
        label: "Global",
        className: "bg-[rgba(255,152,0,0.1)] text-[#f57c00]",
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      label: type,
      className: "bg-[rgba(158,158,158,0.1)] text-[#616161]",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-['Roboto:Medium',_sans-serif] font-medium ${config.className}`}
      >
        {config.label}
      </span>
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
      <div className="min-h-screen bg-[#fffbfe] py-8">
        <div className="w-full max-w-[1800px] mx-auto px-2">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#65b230] mx-auto mb-4"></div>
              <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
                Loading price change requests...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbfe] py-8">
      <div className="w-full max-w-[1800px] mx-auto px-2">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Roboto:Medium',_sans-serif] font-medium text-[32px] leading-[40px] text-[#1c1b1f] mb-2">
                Price Change Requests
              </h1>
              <div className="flex items-center space-x-4 my-2">
                <span className="inline-flex items-center bg-[rgba(101,178,48,0.1)] text-[#2e7d32] rounded-full px-3 py-1 text-sm font-['Roboto:Medium',_sans-serif] font-medium">
                  {
                    requests.filter((r) => r.assignedTo === "Sarah Johnson")
                      .length
                  }{" "}
                  assigned to me
                </span>
                <span className="inline-flex items-center bg-[rgba(25,118,210,0.1)] text-[#1976d2] rounded-full px-3 py-1 text-sm font-['Roboto:Medium',_sans-serif] font-medium">
                  {requests.length} total requests
                </span>
              </div>
              <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]">
                Create and manage formal requests for pricing changes across
                customers and services
              </p>
            </div>
            <button
              onClick={handleCreateRequest}
              className="flex items-center space-x-2 bg-[#65b230] hover:bg-[#4a8a1f] text-white font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[20px] px-4 py-2 rounded-full shadow-sm transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>New Request</span>
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0]">
          {/* Filters Header */}
          <div className="p-6 border-b border-[#e0e0e0]">
            <h2 className="font-['Roboto:Medium',_sans-serif] font-medium text-[20px] leading-[28px] text-[#1c1b1f] mb-4">
              Filters
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end mb-4">
              {/* Subject Filter */}
              <div className="w-48">
                <TextField
                  label="Subject"
                  variant="outlined"
                  fullWidth
                  value={filters.subject}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      subject: e.target.value,
                    }))
                  }
                  InputProps={{
                    style: {
                      fontVariationSettings: "'wdth' 100",
                    },
                  }}
                />
              </div>

              {/* Request Type Filter */}
              <div className="w-40">
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="request-type-label">Request Type</InputLabel>
                  <Select
                    labelId="request-type-label"
                    value={filters.requestType}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        requestType: e.target.value as string,
                      }))
                    }
                    label="Request Type"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Customer">Customer</MenuItem>
                    <MenuItem value="Multiple Customers">
                      Multiple Customers
                    </MenuItem>
                    <MenuItem value="General/Global">General/Global</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Status Filter */}
              <div className="w-40">
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        status: e.target.value as string,
                      }))
                    }
                    label="Status"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Submitted">Submitted</MenuItem>
                    <MenuItem value="In Review">In Review</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Assigned To Filter */}
              <div className="w-48">
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="assigned-to-label">Assigned To</InputLabel>
                  <Select
                    labelId="assigned-to-label"
                    value={filters.assignedTo}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        assignedTo: e.target.value as string,
                      }))
                    }
                    label="Assigned To"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    <MenuItem value="all">All team members</MenuItem>
                    <MenuItem value="Sarah Johnson">Sarah Johnson</MenuItem>
                    <MenuItem value="David Brown">David Brown</MenuItem>
                    <MenuItem value="Michael Chen">Michael Chen</MenuItem>
                    <MenuItem value="Emily Rodriguez">Emily Rodriguez</MenuItem>
                    <MenuItem value="Alex Thompson">Alex Thompson</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Customer Filter */}
              <div className="w-48">
                <TextField
                  label="Customer"
                  variant="outlined"
                  fullWidth
                  value={filters.customer}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      customer: e.target.value,
                    }))
                  }
                  InputProps={{
                    style: {
                      fontVariationSettings: "'wdth' 100",
                    },
                  }}
                />
              </div>

              {/* Submitted Date Range Filter */}
              <div className="flex gap-2">
                <div className="w-36">
                  <TextField
                    label="From"
                    variant="outlined"
                    fullWidth
                    type="date"
                    value={filters.submittedDateFrom}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        submittedDateFrom: e.target.value,
                      }))
                    }
                    InputProps={{
                      style: {
                        fontVariationSettings: "'wdth' 100",
                      },
                      inputProps: {
                        style: {
                          paddingTop: "16px",
                          paddingBottom: "16px",
                        },
                      },
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </div>
                <span className="self-center font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]">
                  to
                </span>
                <div className="w-36">
                  <TextField
                    label="To"
                    variant="outlined"
                    fullWidth
                    type="date"
                    value={filters.submittedDateTo}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        submittedDateTo: e.target.value,
                      }))
                    }
                    InputProps={{
                      style: {
                        fontVariationSettings: "'wdth' 100",
                      },
                      inputProps: {
                        style: {
                          paddingTop: "16px",
                          paddingBottom: "16px",
                        },
                      },
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
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
                <div className="flex flex-wrap gap-2 items-center p-3 rounded-md bg-[#f5f5f5] border border-[#e0e0e0]">
                  {Object.entries(filters)
                    .filter(
                      ([key, value]) =>
                        ["all", "", undefined, null].indexOf(value as any) ===
                        -1
                    )
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center bg-white text-[#1c1b1f] rounded-full px-3 py-1 text-xs font-['Roboto:Medium',_sans-serif] font-medium shadow-sm border border-[#e0e0e0]"
                      >
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                        : {value}
                        <button
                          className="ml-2 text-[#49454f] hover:text-[#1c1b1f]"
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
                  <button
                    onClick={clearFilters}
                    className="text-[#1976d2] hover:text-[#1565c0] font-['Roboto:Medium',_sans-serif] font-medium text-sm px-3 py-1 rounded hover:bg-[rgba(25,118,210,0.1)] transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table Content */}
          <div className="p-6">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-[#bdbdbd] mx-auto mb-4" />
                <h3 className="font-['Roboto:Medium',_sans-serif] font-medium text-[20px] leading-[28px] text-[#1c1b1f] mb-2">
                  No price change requests found
                </h3>
                <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]">
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
                <div className="bg-white border border-[#b9b9b9] rounded">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[rgba(0,0,0,0.06)] border-b border-[#b9b9b9]">
                        <th className="text-left py-[20.18px] px-6 font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px]">
                          Request ID
                        </th>
                        <th className="text-left py-[20.18px] px-6 font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px]">
                          Subject
                        </th>
                        <th className="text-left py-[20.18px] px-6 font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px]">
                          Type
                        </th>
                        <th className="text-left py-[20.18px] px-6 font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px]">
                          Customer
                        </th>
                        <th className="text-left py-[20.18px] px-6 font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px]">
                          Assigned To
                        </th>
                        <th className="text-left py-[20.18px] px-6 font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px]">
                          Status
                        </th>
                        <th className="text-left py-[20.18px] px-6 font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px]">
                          Submitted Date
                        </th>
                        <th className="text-left py-[20.18px] px-6 font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px]">
                          Attachments
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr
                          key={request.requestId}
                          className="cursor-pointer transition-colors hover:bg-[#f5f5f5] border-b border-[#b9b9b9]"
                          onClick={() => handleRequestClick(request)}
                        >
                          <td className="py-[26.27px] px-6">
                            <div className="font-['Roboto:Medium',_sans-serif] font-medium text-[16px] leading-[22.86px] text-[#1976d2] hover:text-[#1565c0]">
                              {request.requestId}
                            </div>
                          </td>
                          <td className="py-[26.27px] px-6">
                            <div className="max-w-xs">
                              <div className="font-['Roboto:Medium',_sans-serif] font-medium text-[16px] leading-[22.86px] text-[#1c1b1f] truncate">
                                {request.subject}
                              </div>
                              {request.description && (
                                <div className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#49454f] truncate">
                                  {request.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-[26.27px] px-6">
                            {getRequestTypeBadge(request.requestType)}
                          </td>
                          <td className="py-[26.27px] px-6">
                            {request.customerName ? (
                              <div className="flex items-center space-x-2">
                                <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
                                  {request.customerName}
                                </span>
                                <span className="inline-flex items-center bg-[#f5f5f5] text-[#49454f] rounded-full px-2 py-0.5 text-xs font-['Roboto:Medium',_sans-serif] font-medium uppercase">
                                  {request.customerId}
                                </span>
                              </div>
                            ) : (
                              <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#bdbdbd] italic">
                                {request.requestType === "Multiple Customers"
                                  ? "Multiple"
                                  : "Global"}
                              </span>
                            )}
                          </td>
                          <td className="py-[26.27px] px-6">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-[#49454f]" />
                              <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
                                {request.assignedTo}
                              </span>
                              {request.assignedTo === "Sarah Johnson" && (
                                <span className="inline-flex items-center bg-[#65b230] text-white rounded-full px-2 py-0.5 text-xs font-['Roboto:Medium',_sans-serif] font-medium">
                                  Me
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-[26.27px] px-6">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="py-[26.27px] px-6">
                            <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
                              {formatDate(request.submittedDate)}
                            </span>
                          </td>
                          <td className="py-[26.27px] px-6">
                            {request.attachments.length > 0 ? (
                              <div className="flex items-center space-x-1">
                                <Paperclip className="h-4 w-4 text-[#49454f]" />
                                <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#49454f]">
                                  {request.attachments.length}
                                </span>
                              </div>
                            ) : (
                              <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#bdbdbd]">
                                None
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Request Modal */}
        {createModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
              {/* Modal Header */}
              <div className="p-6 border-b border-[#e0e0e0]">
                <h2 className="font-['Roboto:Medium',_sans-serif] font-medium text-[24px] leading-[32px] text-[#1c1b1f] mb-2">
                  Create New Price Change Request
                </h2>
                <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]">
                  Create a formal request for pricing changes. All fields marked
                  with * are required.
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Subject */}
                <TextField
                  label="Subject *"
                  variant="outlined"
                  fullWidth
                  value={createModal.subject}
                  onChange={(e) =>
                    setCreateModal((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  InputProps={{
                    style: {
                      fontVariationSettings: "'wdth' 100",
                    },
                  }}
                />

                {/* Description */}
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={createModal.description}
                  onChange={(e) =>
                    setCreateModal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  InputProps={{
                    style: {
                      fontVariationSettings: "'wdth' 100",
                    },
                  }}
                />

                {/* Request Type */}
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="create-request-type-label">
                    Request Type *
                  </InputLabel>
                  <Select
                    labelId="create-request-type-label"
                    value={createModal.requestType}
                    onChange={(e) => {
                      const value = e.target.value as
                        | "Customer"
                        | "Multiple Customers"
                        | "General/Global";
                      setCreateModal((prev) => ({
                        ...prev,
                        requestType: value,
                        customerId: value !== "Customer" ? "" : prev.customerId,
                      }));
                    }}
                    label="Request Type *"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    <MenuItem value="Customer">Customer</MenuItem>
                    <MenuItem value="Multiple Customers">
                      Multiple Customers
                    </MenuItem>
                    <MenuItem value="General/Global">General/Global</MenuItem>
                  </Select>
                </FormControl>

                {/* Customer (only show if Request Type is Customer) */}
                {createModal.requestType === "Customer" && (
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="create-customer-label">
                      Customer *
                    </InputLabel>
                    <Select
                      labelId="create-customer-label"
                      value={createModal.customerId}
                      onChange={(e) =>
                        setCreateModal((prev) => ({
                          ...prev,
                          customerId: e.target.value as string,
                        }))
                      }
                      label="Customer *"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      <MenuItem value="">Select customer</MenuItem>
                      {CUSTOMERS.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Assigned To */}
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="create-assigned-to-label">
                    Assigned To *
                  </InputLabel>
                  <Select
                    labelId="create-assigned-to-label"
                    value={createModal.assignedTo}
                    onChange={(e) =>
                      setCreateModal((prev) => ({
                        ...prev,
                        assignedTo: e.target.value as string,
                      }))
                    }
                    label="Assigned To *"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    <MenuItem value="">Select team member</MenuItem>
                    {TEAM_MEMBERS.map((member) => (
                      <MenuItem key={member} value={member}>
                        {member}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Attachments */}
                <div>
                  <label className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px] text-[#1c1b1f] mb-2 block">
                    Attachments
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="flex-1 font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#000000] bg-transparent border border-[#b9b9b9] rounded px-3 py-2 focus:outline-none focus:border-[#65b230] focus:ring-1 focus:ring-[#65b230]"
                      />
                      <Upload className="h-4 w-4 text-[#49454f]" />
                    </div>

                    {createModal.attachments.length > 0 && (
                      <div className="space-y-1">
                        {createModal.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-[#f5f5f5] rounded border border-[#e0e0e0]"
                          >
                            <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#1c1b1f]">
                              {file.name}
                            </span>
                            <button
                              onClick={() => removeAttachment(index)}
                              className="h-6 w-6 p-0 text-[#49454f] hover:text-[#1c1b1f] transition-colors duration-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#e0e0e0] flex justify-end space-x-3">
                <button
                  onClick={handleCreateCancel}
                  className="px-4 py-2 border border-[#b9b9b9] text-[#1c1b1f] font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[20px] rounded-lg hover:bg-[#f5f5f5] transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubmit}
                  className="px-4 py-2 bg-[#65b230] hover:bg-[#4a8a1f] text-white font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[20px] rounded-lg transition-colors duration-200"
                >
                  Create Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
