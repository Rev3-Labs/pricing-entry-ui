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
  Button as MuiButton,
  IconButton,
} from "@mui/material";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

// Interface for price change request data
interface PriceChangeRequest {
  requestId: string;
  subject: string;
  description: string;
  requestType:
    | "New Customer"
    | "New Item Pricing"
    | "Price Increase"
    | "Price Decrease"
    | "Expire Pricing";
  customerId?: string;
  customerName?: string;
  assignedTo: string;
  status: "New" | "In Progress" | "Activated" | "Declined" | "Withdrawn";
  submittedBy: string;
  submittedDate: string;
  finalizedDate?: string;
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
  requestType:
    | "New Customer"
    | "New Item Pricing"
    | "Price Increase"
    | "Price Decrease"
    | "Expire Pricing";
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
        requestType: "Price Increase",
        customerId: "CUST-001",
        customerName: "Acme Corporation",
        assignedTo: "Sarah Johnson",
        status: "New",
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
        requestType: "Price Increase",
        assignedTo: "David Brown",
        status: "In Progress",
        submittedBy: "Mike Wilson",
        submittedDate: "2024-01-20",
        attachments: ["utah_contracts.xlsx", "regulatory_changes.pdf"],
      },
      {
        requestId: "PCR-2024-003",
        subject: "Global Fuel Surcharge Adjustment",
        description:
          "Implement new fuel surcharge calculation methodology across all customers to better reflect current fuel costs and market volatility.",
        requestType: "Price Increase",
        assignedTo: "Michael Chen",
        status: "Activated",
        submittedBy: "Lisa Davis",
        submittedDate: "2024-01-25",
        finalizedDate: "2024-01-28",
        attachments: ["fuel_analysis.xlsx", "approval_document.pdf"],
      },
      {
        requestId: "PCR-2024-004",
        subject: "Tech Solutions Inc - New Service Pricing",
        description:
          "Create pricing for new hazardous waste disposal service for Tech Solutions Inc. This is a new service offering that requires custom pricing structure.",
        requestType: "New Item Pricing",
        customerId: "CUST-002",
        customerName: "Tech Solutions Inc",
        assignedTo: "Sarah Johnson",
        status: "New",
        submittedBy: "Robert Taylor",
        submittedDate: "2024-01-30",
        attachments: ["service_specifications.pdf", "pricing_proposal.docx"],
      },
      {
        requestId: "PCR-2024-005",
        subject: "Environmental Services LLC - Volume Discount",
        description:
          "Implement tiered volume discount structure for Environmental Services LLC based on their increased waste volume projections.",
        requestType: "Price Decrease",
        customerId: "CUST-005",
        customerName: "Environmental Services LLC",
        assignedTo: "Emily Rodriguez",
        status: "Withdrawn",
        submittedBy: "Jennifer Adams",
        submittedDate: "2024-02-01",
        attachments: ["volume_analysis.xlsx"],
      },
      {
        requestId: "PCR-2024-006",
        subject: "Industry-Wide Compliance Fee Update",
        description:
          "Update compliance fees across all customers to reflect new EPA regulations and increased compliance costs.",
        requestType: "Price Increase",
        assignedTo: "Alex Thompson",
        status: "Declined",
        submittedBy: "Tom Wilson",
        submittedDate: "2024-02-05",
        attachments: ["epa_regulations.pdf", "cost_analysis.xlsx"],
      },
      {
        requestId: "PCR-2024-007",
        subject: "Waste Management Corp - Emergency Service Pricing",
        description:
          "Establish emergency response service pricing for Waste Management Corp for after-hours and weekend emergency cleanups.",
        requestType: "New Item Pricing",
        customerId: "CUST-006",
        customerName: "Waste Management Corp",
        assignedTo: "David Brown",
        status: "Activated",
        submittedBy: "Maria Garcia",
        submittedDate: "2024-02-10",
        finalizedDate: "2024-02-15",
        attachments: ["emergency_service_agreement.pdf"],
        notes: "Successfully implemented on 2/15/2024",
      },
      {
        requestId: "PCR-2024-008",
        subject: "Clean Energy Solutions - Renewable Energy Credit Pricing",
        description:
          "Develop pricing structure for renewable energy credit trading services for Clean Energy Solutions.",
        requestType: "New Item Pricing",
        customerId: "CUST-007",
        customerName: "Clean Energy Solutions",
        assignedTo: "Michael Chen",
        status: "New",
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
      status: "New",
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
  { id: "CUST-001", name: "Acme Corporation", status: "active" },
  { id: "CUST-002", name: "Tech Solutions Inc", status: "active" },
  { id: "CUST-003", name: "Green Energy Co", status: "inactive" },
  { id: "CUST-004", name: "Industrial Cleanup Ltd", status: "active" },
  { id: "CUST-005", name: "Environmental Services LLC", status: "active" },
  { id: "CUST-006", name: "Waste Management Corp", status: "inactive" },
  { id: "CUST-007", name: "Clean Energy Solutions", status: "active" },
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
    requestType: "New Customer",
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
      requestType: "New Customer",
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

    if (createModal.requestType === "New Customer" && !createModal.customerId) {
      toast.error("Please select a customer for new customer requests");
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
        requestType: "New Customer",
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
      requestType: "New Customer",
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
      New: {
        label: "New",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
      },
      "In Progress": {
        label: "In Progress",
        className: "bg-orange-50 text-orange-700 border border-orange-200",
      },
      Activated: {
        label: "Activated",
        className: "bg-green-600 text-white border border-green-600",
      },
      Declined: {
        label: "Declined",
        className: "bg-red-50 text-red-700 border border-red-200",
      },
      Withdrawn: {
        label: "Withdrawn",
        className: "bg-gray-50 text-gray-600 border border-gray-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-gray-50 text-gray-600 border border-gray-200",
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
      "New Customer": {
        label: "New Customer",
        className: "bg-gray-50 text-gray-700 border border-gray-200",
      },
      "New Item Pricing": {
        label: "New Item",
        className: "bg-gray-50 text-gray-700 border border-gray-200",
      },
      "Price Increase": {
        label: "Increase",
        className: "bg-gray-50 text-gray-700 border border-gray-200",
      },
      "Price Decrease": {
        label: "Decrease",
        className: "bg-gray-50 text-gray-700 border border-gray-200",
      },
      "Expire Pricing": {
        label: "Expire",
        className: "bg-gray-50 text-gray-700 border border-gray-200",
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      label: type,
      className: "bg-gray-50 text-gray-600 border border-gray-200",
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

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "requestId",
      headerName: "Request ID",
      width: 150,
      flex: 0,
      renderCell: (params) => (
        <div className="font-['Roboto:Medium',_sans-serif] font-medium text-[16px] leading-[22.86px] text-[#1976d2] hover:text-[#1565c0] cursor-pointer">
          {params.value}
        </div>
      ),
    },
    {
      field: "subject",
      headerName: "Subject",
      width: 300,
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <div className="max-w-xs">
          <div className="font-['Roboto:Medium',_sans-serif] font-medium text-[16px] leading-[22.86px] text-[#1c1b1f] truncate">
            {params.value}
          </div>
          {params.row.description && (
            <div className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#49454f] truncate">
              {params.row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      field: "requestType",
      headerName: "Request Type",
      width: 120,
      flex: 0,
      renderCell: (params) => getRequestTypeBadge(params.value),
    },
    {
      field: "customerName",
      headerName: "Customer",
      width: 280,
      flex: 0,
      renderCell: (params) => {
        if (params.value) {
          return (
            <div className="flex items-center space-x-2">
              <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
                {params.value}
              </span>
              <span className="inline-flex items-center bg-[#f5f5f5] text-[#49454f] rounded-full px-2 py-0.5 text-xs font-['Roboto:Medium',_sans-serif] font-medium uppercase">
                {params.row.customerId}
              </span>
            </div>
          );
        } else {
          return (
            <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#bdbdbd] italic">
              {params.row.requestType === "New Customer"
                ? "New Customer"
                : "Global"}
            </span>
          );
        }
      },
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      width: 220,
      flex: 0,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-[#49454f]" />
          <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
            {params.value}
          </span>
          {params.value === "Sarah Johnson" && (
            <span className="inline-flex items-center bg-[#65b230] text-white rounded-full px-2 py-0.5 text-xs font-['Roboto:Medium',_sans-serif] font-medium">
              Me
            </span>
          )}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      flex: 0,
      renderCell: (params) => getStatusBadge(params.value),
    },
    {
      field: "submittedDate",
      headerName: "Submitted Date",
      width: 140,
      flex: 0,
      renderCell: (params) => (
        <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
          {formatDate(params.value)}
        </span>
      ),
    },
    {
      field: "finalizedDate",
      headerName: "Finalized Date",
      width: 140,
      flex: 0,
      renderCell: (params) => {
        if (params.row.status === "Activated" && params.value) {
          return (
            <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
              {formatDate(params.value)}
            </span>
          );
        } else {
          return (
            <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#bdbdbd] italic">
              —
            </span>
          );
        }
      },
    },
    {
      field: "attachments",
      headerName: "Documents",
      width: 120,
      flex: 0,
      renderCell: (params) => {
        if (params.value && params.value.length > 0) {
          return (
            <div className="flex items-center space-x-1">
              <Paperclip className="h-4 w-4 text-[#49454f]" />
              <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#49454f]">
                {params.value.length}
              </span>
            </div>
          );
        } else {
          return (
            <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#bdbdbd]">
              None
            </span>
          );
        }
      },
    },
  ];

  // Transform filtered requests into DataGrid rows
  const rows = useMemo(() => {
    return filteredRequests.map((request) => ({
      id: request.requestId,
      ...request,
    }));
  }, [filteredRequests]);

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
            <PrimaryButton onClick={handleCreateRequest} icon={Plus}>
              New Request
            </PrimaryButton>
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
                    <MenuItem value="New Customer">New Customer</MenuItem>
                    <MenuItem value="New Item Pricing">
                      New Item Pricing
                    </MenuItem>
                    <MenuItem value="Price Increase">Price Increase</MenuItem>
                    <MenuItem value="Price Decrease">Price Decrease</MenuItem>
                    <MenuItem value="Expire Pricing">Expire Pricing</MenuItem>
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
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Activated">Activated</MenuItem>
                    <MenuItem value="Declined">Declined</MenuItem>
                    <MenuItem value="Withdrawn">Withdrawn</MenuItem>
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
                        <IconButton
                          size="small"
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
                          sx={{
                            ml: 1,
                            color: "#49454f",
                            "&:hover": {
                              color: "#1c1b1f",
                            },
                          }}
                        >
                          <X className="h-3 w-3" />
                        </IconButton>
                      </span>
                    ))}
                  <MuiButton
                    variant="text"
                    size="small"
                    onClick={clearFilters}
                    sx={{
                      color: "#1976d2",
                      textTransform: "none",
                      fontSize: "14px",
                      "&:hover": {
                        color: "#1565c0",
                        backgroundColor: "rgba(25,118,210,0.1)",
                      },
                    }}
                  >
                    Clear Filters
                  </MuiButton>
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
              <div style={{ width: "100%" }}>
                <DataGrid
                  rows={rows || []}
                  columns={columns || []}
                  getRowId={(row) => row.id}
                  autoHeight={true}
                  density="standard"
                  onRowClick={(params) => {
                    const request = filteredRequests.find(
                      (r) => r.requestId === params.id
                    );
                    if (request) {
                      handleRequestClick(request);
                    }
                  }}
                  sx={{
                    "& .MuiDataGrid-cell": {
                      fontSize: "0.875rem",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    },
                    "& .MuiDataGrid-columnHeader": {
                      fontSize: "0.875rem",
                      padding: "12px 16px",
                      backgroundColor: "#E0E0E0",
                      borderBottom: "2px solid #65B230 !important",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      borderBottom: "2px solid #65B230 !important",
                    },
                    "& .MuiDataGrid-row:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                    border: "1px solid #b9b9b9",
                    borderRadius: "4px",
                  }}
                  disableRowSelectionOnClick={true}
                  disableColumnMenu={true}
                />
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
                        | "New Customer"
                        | "New Item Pricing"
                        | "Price Increase"
                        | "Price Decrease"
                        | "Expire Pricing";
                      setCreateModal((prev) => ({
                        ...prev,
                        requestType: value,
                        customerId:
                          value !== "New Customer" ? "" : prev.customerId,
                      }));
                    }}
                    label="Request Type *"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    <MenuItem value="New Customer">New Customer</MenuItem>
                    <MenuItem value="New Item Pricing">
                      New Item Pricing
                    </MenuItem>
                    <MenuItem value="Price Increase">Price Increase</MenuItem>
                    <MenuItem value="Price Decrease">Price Decrease</MenuItem>
                    <MenuItem value="Expire Pricing">Expire Pricing</MenuItem>
                  </Select>
                </FormControl>

                {/* Customer (only show if Request Type is New Customer) */}
                {createModal.requestType === "New Customer" && (
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
                          {customer.status === "inactive" && " (Inactive)"}
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
                            <IconButton
                              size="small"
                              onClick={() => removeAttachment(index)}
                              sx={{
                                color: "#49454f",
                                "&:hover": {
                                  color: "#1c1b1f",
                                },
                              }}
                            >
                              <X className="h-3 w-3" />
                            </IconButton>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#e0e0e0] flex justify-end space-x-3">
                <SecondaryButton onClick={handleCreateCancel}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton onClick={handleCreateSubmit}>
                  Create Request
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
