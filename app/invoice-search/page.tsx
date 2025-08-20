"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Building2,
  User,
  Hash,
  FileText,
  ArrowLeft,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

// Mock invoice data - in a real app, this would come from an API
const mockInvoices = [
  {
    id: "INV-001",
    invoiceDate: "2024-01-15",
    status: "ready",
    customer: "Acme Corp",
    generator: "Generator A",
    workOrder: "WO-2024-001",
    project: "PRJ-001",
    itemCode: "ITEM-001",
    rebill: false,
    amount: 125000.0,
    facility: "Emelle",
    csr: "csr-001",
    profile: "PROF-001",
  },
  {
    id: "INV-002",
    invoiceDate: "2024-01-16",
    status: "open",
    customer: "Tech Solutions Inc",
    generator: "Generator B",
    workOrder: "WO-2024-002",
    project: "PRJ-002",
    itemCode: "ITEM-002",
    rebill: true,
    amount: 87500.0,
    facility: "Calvert City",
    csr: "csr-002",
    profile: "PROF-002",
  },
  {
    id: "INV-003",
    invoiceDate: "2024-01-17",
    status: "review",
    customer: "Global Industries",
    generator: "Generator A",
    workOrder: "WO-2024-003",
    project: "PRJ-003",
    itemCode: "ITEM-003",
    rebill: false,
    amount: 210000.0,
    facility: "Emelle",
    csr: "csr-003",
    profile: "PROF-003",
  },
  {
    id: "INV-004",
    invoiceDate: "2024-01-18",
    status: "on-hold",
    customer: "Local Business LLC",
    generator: "Generator C",
    workOrder: "WO-2024-004",
    project: "PRJ-004",
    itemCode: "ITEM-004",
    rebill: false,
    amount: 45000.0,
    facility: "Glencoe",
    csr: "csr-004",
    profile: "PROF-004",
  },
  {
    id: "INV-005",
    invoiceDate: "2024-01-19",
    status: "open",
    customer: "Enterprise Solutions",
    generator: "Generator B",
    workOrder: "WO-2024-005",
    project: "PRJ-005",
    itemCode: "ITEM-005",
    rebill: true,
    amount: 320000.0,
    facility: "Calvert City",
    csr: "csr-005",
    profile: "PROF-005",
  },
  {
    id: "INV-006",
    invoiceDate: "2024-01-20",
    status: "ready",
    customer: "Startup Ventures",
    generator: "Generator A",
    workOrder: "WO-2024-006",
    project: "PRJ-006",
    itemCode: "ITEM-006",
    rebill: false,
    amount: 180000.0,
    facility: "Emelle",
    csr: "csr-006",
    profile: "PROF-006",
  },
  {
    id: "INV-007",
    invoiceDate: "2024-01-21",
    status: "open",
    customer: "Corp International",
    generator: "Generator D",
    workOrder: "WO-2024-007",
    project: "PRJ-007",
    itemCode: "ITEM-007",
    rebill: false,
    amount: 95000.0,
    facility: "Detroit",
    csr: "csr-007",
    profile: "PROF-007",
  },
  {
    id: "INV-008",
    invoiceDate: "2024-01-22",
    status: "ready",
    customer: "Mega Corp",
    generator: "Generator E",
    workOrder: "WO-2024-008",
    project: "PRJ-008",
    itemCode: "ITEM-008",
    rebill: true,
    amount: 280000.0,
    facility: "Morris",
    csr: "csr-008",
    profile: "PROF-008",
  },
];

interface Invoice {
  id: string;
  invoiceDate: string;
  status: string;
  customer: string;
  generator: string;
  workOrder: string;
  project: string;
  itemCode: string;
  rebill: boolean;
  amount: number;
  facility: string;
  csr: string;
  profile: string;
}

interface SearchFilters {
  invoiceNumber: string;
  startDate: string;
  endDate: string;
  customer: string;
  generator: string;
  workOrder: string;
  facility: string;
  csr: string;
  project: string;
  profile: string;
  itemCode: string;
}

// Component that uses useSearchParams - wrapped in Suspense
function InvoiceSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [filteredInvoices, setFilteredInvoices] =
    useState<Invoice[]>(mockInvoices);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    invoiceNumber: "",
    startDate: "",
    endDate: "",
    customer: "",
    generator: "",
    workOrder: "",
    facility: "",
    csr: "",
    project: "",
    profile: "",
    itemCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Initialize filters from URL params if they exist
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const filters: Partial<SearchFilters> = {};

    if (params.get("customer")) filters.customer = params.get("customer")!;
    if (params.get("generator")) filters.generator = params.get("generator")!;
    if (params.get("workOrder")) filters.workOrder = params.get("workOrder")!;
    if (params.get("invoiceNumber"))
      filters.invoiceNumber = params.get("invoiceNumber")!;
    if (params.get("csr")) filters.csr = params.get("csr")!;

    if (Object.keys(filters).length > 0) {
      setSearchFilters((prev) => ({ ...prev, ...filters }));
    }
  }, [searchParams]);

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const filtered = invoices.filter((invoice) => {
        return (
          (!searchFilters.invoiceNumber ||
            invoice.id
              .toLowerCase()
              .includes(searchFilters.invoiceNumber.toLowerCase())) &&
          (!searchFilters.customer ||
            invoice.customer
              .toLowerCase()
              .includes(searchFilters.customer.toLowerCase())) &&
          (!searchFilters.generator ||
            invoice.generator
              .toLowerCase()
              .includes(searchFilters.generator.toLowerCase())) &&
          (!searchFilters.workOrder ||
            invoice.workOrder
              .toLowerCase()
              .includes(searchFilters.workOrder.toLowerCase())) &&
          (!searchFilters.facility ||
            invoice.facility
              .toLowerCase()
              .includes(searchFilters.facility.toLowerCase())) &&
          (!searchFilters.csr ||
            invoice.csr
              .toLowerCase()
              .includes(searchFilters.csr.toLowerCase())) &&
          (!searchFilters.project ||
            invoice.project
              .toLowerCase()
              .includes(searchFilters.project.toLowerCase())) &&
          (!searchFilters.profile ||
            invoice.profile
              .toLowerCase()
              .includes(searchFilters.profile.toLowerCase())) &&
          (!searchFilters.itemCode ||
            invoice.itemCode
              .toLowerCase()
              .includes(searchFilters.itemCode.toLowerCase())) &&
          (!searchFilters.startDate ||
            new Date(invoice.invoiceDate) >=
              new Date(searchFilters.startDate)) &&
          (!searchFilters.endDate ||
            new Date(invoice.invoiceDate) <= new Date(searchFilters.endDate))
        );
      });

      setFilteredInvoices(filtered);
      setIsLoading(false);
      toast.success(`Found ${filtered.length} invoices matching your criteria`);
    }, 500);
  };

  const clearFilters = () => {
    setSearchFilters({
      invoiceNumber: "",
      startDate: "",
      endDate: "",
      customer: "",
      generator: "",
      workOrder: "",
      facility: "",
      csr: "",
      project: "",
      profile: "",
      itemCode: "",
    });
    setFilteredInvoices(invoices);
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    // Navigate to invoice detail view
    router.push(`/invoice-detail/${invoice.id}`);
  };

  const exportResults = () => {
    // In a real app, this would generate and download a CSV/Excel file
    toast.success("Export functionality would be implemented here");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ready: {
        label: "Ready",
        className: "bg-[rgba(76,175,80,0.1)] text-[#2e7d32]",
      },
      open: {
        label: "Open",
        className: "bg-[rgba(25,118,210,0.1)] text-[#1976d2]",
      },
      review: {
        label: "In Review",
        className: "bg-[rgba(255,152,0,0.1)] text-[#f57c00]",
      },
      "on-hold": {
        label: "On Hold",
        className: "bg-[rgba(244,67,54,0.1)] text-[#d32f2f]",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.open;

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-['Roboto:Medium',_sans-serif] font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const getRebillBadge = (rebill: boolean) => {
    return rebill ? (
      <span className="inline-flex items-center bg-[rgba(244,67,54,0.1)] text-[#d32f2f] rounded-full px-3 py-1 text-xs font-['Roboto:Medium',_sans-serif] font-medium">
        Rebill
      </span>
    ) : null;
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

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Invoice #",
      width: 150,
      flex: 0,
      renderCell: (params) => (
        <div className="font-['Roboto:Medium',_sans-serif] font-medium text-[16px] leading-[22.86px] text-[#1976d2] hover:text-[#1565c0] cursor-pointer">
          {params.value}
        </div>
      ),
    },
    {
      field: "invoiceDate",
      headerName: "Invoice Date",
      width: 140,
      flex: 0,
      renderCell: (params) => (
        <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
          {formatDate(params.value)}
        </span>
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
      field: "customer",
      headerName: "Customer",
      width: 200,
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <div className="font-['Roboto:Medium',_sans-serif] font-medium text-[16px] leading-[22.86px] text-[#1c1b1f]">
          {params.value}
        </div>
      ),
    },
    {
      field: "generator",
      headerName: "Generator",
      width: 150,
      flex: 0,
      minWidth: 120,
      renderCell: (params) => (
        <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
          {params.value}
        </span>
      ),
    },
    {
      field: "workOrder",
      headerName: "Work Order",
      width: 150,
      flex: 0,
      minWidth: 120,
      renderCell: (params) => (
        <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
          {params.value}
        </span>
      ),
    },
    {
      field: "project",
      headerName: "Project",
      width: 120,
      flex: 0,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
          {params.value}
        </span>
      ),
    },
    {
      field: "itemCode",
      headerName: "Item Code",
      width: 120,
      flex: 0,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#1c1b1f]">
          {params.value}
        </span>
      ),
    },
    {
      field: "rebill",
      headerName: "Rebill",
      width: 100,
      flex: 0,
      renderCell: (params) => getRebillBadge(params.value),
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 120,
      flex: 0,
      renderCell: (params) => (
        <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[16px] leading-[22.86px] text-[#1c1b1f]">
          {formatCurrency(params.value)}
        </span>
      ),
    },
  ];

  // Transform filtered invoices into DataGrid rows
  const rows = useMemo(() => {
    return filteredInvoices;
  }, [filteredInvoices]);

  return (
    <div className="min-h-screen bg-[#eaeaea] py-8">
      <div className="w-full max-w-[1800px] mx-auto px-2">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <SecondaryButton
                onClick={() => router.back()}
                className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0]">
          {/* Filters Header */}
          <div className="p-6 border-b border-[#e0e0e0]">
            <h2 className="font-['Roboto:Medium',_sans-serif] font-medium text-[20px] leading-[28px] text-[#1c1b1f] mb-4">
              Search Filters
            </h2>

            {/* Basic Filters - Show only essential ones */}
            <div className="flex flex-wrap gap-4 items-end mb-4">
              {/* Invoice # Filter */}
              <div className="w-48">
                <TextField
                  label="Invoice #"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchFilters.invoiceNumber}
                  onChange={(e) =>
                    handleFilterChange("invoiceNumber", e.target.value)
                  }
                  placeholder="Searchable"
                  InputProps={{
                    style: {
                      fontVariationSettings: "'wdth' 100",
                    },
                  }}
                />
              </div>

              {/* Date Range Filters */}
              <div className="flex gap-2">
                <div className="w-36">
                  <TextField
                    label="From"
                    variant="outlined"
                    fullWidth
                    size="small"
                    type="date"
                    value={searchFilters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
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
                    size="small"
                    type="date"
                    value={searchFilters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
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

              {/* Customer Filter */}
              <div className="w-48">
                <TextField
                  label="Customer"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchFilters.customer}
                  onChange={(e) =>
                    handleFilterChange("customer", e.target.value)
                  }
                  placeholder="Customer Name (Searchable)"
                  InputProps={{
                    style: {
                      fontVariationSettings: "'wdth' 100",
                    },
                  }}
                />
              </div>

              {/* Generator Filter */}
              <div className="w-48">
                <TextField
                  label="Generator"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchFilters.generator}
                  onChange={(e) =>
                    handleFilterChange("generator", e.target.value)
                  }
                  placeholder="Generator Name (Searchable)"
                  InputProps={{
                    style: {
                      fontVariationSettings: "'wdth' 100",
                    },
                  }}
                />
              </div>

              {/* Work Order Filter */}
              <div className="w-48">
                <TextField
                  label="Work Order #"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchFilters.workOrder}
                  onChange={(e) =>
                    handleFilterChange("workOrder", e.target.value)
                  }
                  placeholder="Work Order Number (Searchable)"
                  InputProps={{
                    style: {
                      fontVariationSettings: "'wdth' 100",
                    },
                  }}
                />
              </div>

              {/* More Filters Button */}
              <SecondaryButton
                onClick={() => setAdvancedFiltersOpen(true)}
                sx={{
                  backgroundColor: "#f5f5f5",
                  "&:hover": {
                    backgroundColor: "#f0f8f0",
                  },
                }}
              >
                More Filters
              </SecondaryButton>
            </div>

            {/* Active Filters Chips */}
            {Object.entries(searchFilters).some(
              ([key, value]) => value !== ""
            ) && (
              <div className="mb-4 mt-4">
                <div className="flex flex-wrap gap-2 items-center p-3 rounded-md bg-[#f5f5f5] border border-[#e0e0e0]">
                  {Object.entries(searchFilters)
                    .filter(([key, value]) => value !== "")
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
                            setSearchFilters((f) => ({
                              ...f,
                              [key]: "",
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
                    Clear All
                  </MuiButton>
                </div>
              </div>
            )}
          </div>

          {/* Table Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-['Roboto:Medium',_sans-serif] font-medium text-[18px] leading-[24px] text-[#1c1b1f]">
                Invoice Results
              </h3>
              <p className="text-sm text-gray-600">
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </p>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-[#bdbdbd] mx-auto mb-4" />
                <h3 className="font-['Roboto:Medium',_sans-serif] font-medium text-[20px] leading-[28px] text-[#1c1b1f] mb-2">
                  No invoices found
                </h3>
                <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]">
                  Try adjusting your search criteria or clearing some filters.
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
                    const invoice = filteredInvoices.find(
                      (inv) => inv.id === params.id
                    );
                    if (invoice) {
                      handleInvoiceClick(invoice);
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

        {/* Advanced Filters Dialog */}
        <Dialog
          open={advancedFiltersOpen}
          onClose={() => setAdvancedFiltersOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              minWidth: "500px",
              maxWidth: "600px",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "Roboto:Medium, sans-serif",
              fontWeight: 500,
              fontSize: "22px",
              lineHeight: "28px",
              color: "#1c1b1f",
            }}
          >
            Advanced Filters
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <div
              className="py-2 grid grid-cols-1 gap-4"
              style={{ minWidth: "400px" }}
            >
              {/* Facility Filter */}
              <TextField
                label="Facility Name"
                variant="outlined"
                fullWidth
                size="small"
                value={searchFilters.facility}
                onChange={(e) => handleFilterChange("facility", e.target.value)}
                placeholder="Destination Facility"
                InputProps={{
                  style: {
                    fontVariationSettings: "'wdth' 100",
                  },
                }}
              />

              {/* csr Filter */}
              <TextField
                label="CSR"
                variant="outlined"
                fullWidth
                size="small"
                value={searchFilters.csr}
                onChange={(e) => handleFilterChange("csr", e.target.value)}
                placeholder="CSR Name"
                InputProps={{
                  style: {
                    fontVariationSettings: "'wdth' 100",
                  },
                }}
              />

              {/* Project Filter */}
              <TextField
                label="Project #"
                variant="outlined"
                fullWidth
                size="small"
                value={searchFilters.project}
                onChange={(e) => handleFilterChange("project", e.target.value)}
                placeholder="SDM only Project#"
                InputProps={{
                  style: {
                    fontVariationSettings: "'wdth' 100",
                  },
                }}
              />

              {/* Profile Filter */}
              <TextField
                label="Profile #"
                variant="outlined"
                fullWidth
                size="small"
                value={searchFilters.profile}
                onChange={(e) => handleFilterChange("profile", e.target.value)}
                placeholder="Profile#"
                InputProps={{
                  style: {
                    fontVariationSettings: "'wdth' 100",
                  },
                }}
              />

              {/* Item Code Filter */}
              <TextField
                label="Item Code"
                variant="outlined"
                fullWidth
                size="small"
                value={searchFilters.itemCode}
                onChange={(e) => handleFilterChange("itemCode", e.target.value)}
                placeholder="Item Code (from Item Master)"
                InputProps={{
                  style: {
                    fontVariationSettings: "'wdth' 100",
                  },
                }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <SecondaryButton onClick={() => setAdvancedFiltersOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={() => setAdvancedFiltersOpen(false)}>
              Apply Filters
            </PrimaryButton>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

// Main page component wrapped in Suspense
export default function InvoiceSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading search page...</p>
          </div>
        </div>
      }
    >
      <InvoiceSearchContent />
    </Suspense>
  );
}
