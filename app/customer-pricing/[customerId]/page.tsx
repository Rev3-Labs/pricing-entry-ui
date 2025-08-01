"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button as MuiButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Calendar,
  Settings,
  FileText,
  Activity,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  X,
  Loader2,
  FolderOpen,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import * as XLSX from "xlsx";
import {
  CustomerInfo,
  PriceHeader,
  PriceItem,
  customerService,
} from "@/services/customer.service";
import { PricingFullScreenModal } from "@/components/PricingFullScreenModal";

interface FilterState {
  productName: string;
  region: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  uom: string;
  quoteName: string;
  projectName: string;
  generator?: string;
  facility?: string;
  contractNumber?: string;
  containerSize?: string;
  pricingTier?: string;
  profileId?: string;
  createdBy?: string;
  salesRep?: string;
}

export default function CustomerPricingPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;

  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [priceHeaders, setPriceHeaders] = useState<PriceHeader[]>([]);
  const [allPriceItems, setAllPriceItems] = useState<PriceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    productName: "",
    region: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    uom: "all",
    quoteName: "",
    projectName: "",
  });
  const [createPricingDialogOpen, setCreatePricingDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "type" | "addendum" | "new" | "preview"
  >("upload");
  const [pricingType, setPricingType] = useState<"new" | "addendum">("new");
  const [selectedPriceHeader, setSelectedPriceHeader] = useState<string>("");
  const [pricingQuoteName, setPricingQuoteName] = useState("");
  const [headerTemplate, setHeaderTemplate] = useState("custom");
  const [customHeaderFields, setCustomHeaderFields] = useState({
    description: "",
    effectiveDate: "",
    expirationDate: "",
    invoiceMinimum: "",
    container55gMinimum: "",
    absoluteContainerMinimum: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  // Add state for view toggle
  // Remove the viewMode state and toggle buttons
  // Only render the table view for price items
  // Remove all code related to the card view

  useEffect(() => {
    const loadCustomerData = async () => {
      setIsLoading(true);

      try {
        // Load customer info and price headers in parallel
        const [customerInfo, headersResponse] = await Promise.all([
          customerService.getCustomerInfo(customerId),
          customerService.getCustomerPriceHeaders(customerId),
        ]);

        if (customerInfo) {
          setCustomer(customerInfo);
        }

        if (headersResponse.success) {
          setPriceHeaders(headersResponse.data);

          // Load all price items for all headers
          const allItems: PriceItem[] = [];
          for (const header of headersResponse.data) {
            const itemsResponse = await customerService.getPriceHeaderItems(
              header.priceHeaderId
            );
            if (itemsResponse.success) {
              allItems.push(...itemsResponse.data);
            }
          }
          setAllPriceItems(allItems);
        } else {
          console.error(
            "Failed to load price headers:",
            headersResponse.message
          );
          toast.error("Failed to load pricing data");
        }
      } catch (error) {
        console.error("Failed to load customer data:", error);
        toast.error("Failed to load customer information");
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  // Filter and sort price items based on current filters
  const filteredPriceItems = useMemo(() => {
    const filtered = allPriceItems.filter((item) => {
      const matchesProduct =
        !filters.productName ||
        item.productName
          .toLowerCase()
          .includes(filters.productName.toLowerCase());
      const matchesRegion =
        filters.region === "all" ||
        !filters.region ||
        item.region.toLowerCase().includes(filters.region.toLowerCase());
      const matchesStatus =
        filters.status === "all" ||
        !filters.status ||
        item.status.toLowerCase() === filters.status.toLowerCase();
      const matchesUom =
        filters.uom === "all" ||
        !filters.uom ||
        (item.uom &&
          item.uom.toLowerCase().includes(filters.uom.toLowerCase()));
      const matchesQuote =
        !filters.quoteName ||
        (item.quoteName &&
          item.quoteName
            .toLowerCase()
            .includes(filters.quoteName.toLowerCase()));
      const matchesProject =
        !filters.projectName ||
        (item.projectName &&
          item.projectName
            .toLowerCase()
            .includes(filters.projectName.toLowerCase()));
      const matchesGenerator =
        !filters.generator ||
        (item.generatorId &&
          item.generatorId
            .toLowerCase()
            .includes(filters.generator.toLowerCase()));
      const matchesContract =
        !filters.contractNumber ||
        (item.contractId &&
          item.contractId
            .toLowerCase()
            .includes(filters.contractNumber.toLowerCase()));
      const matchesContainerSize =
        !filters.containerSize ||
        (item.containerSize &&
          item.containerSize
            .toLowerCase()
            .includes(filters.containerSize.toLowerCase()));
      const matchesPricingTier =
        !filters.pricingTier ||
        (item.pricingType &&
          item.pricingType
            .toLowerCase()
            .includes(filters.pricingTier.toLowerCase()));
      const matchesProfileId =
        !filters.profileId ||
        (item.profileId &&
          item.profileId
            .toLowerCase()
            .includes(filters.profileId.toLowerCase()));
      const matchesCreatedBy =
        !filters.createdBy ||
        (item.createdByUser &&
          String(item.createdByUser)
            .toLowerCase()
            .includes(filters.createdBy.toLowerCase()));

      let matchesDate = true;
      if (filters.dateFrom || filters.dateTo) {
        const effectiveDate = new Date(item.effectiveDate);
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          matchesDate = matchesDate && effectiveDate >= fromDate;
        }
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          matchesDate = matchesDate && effectiveDate <= toDate;
        }
      }

      return (
        matchesProduct &&
        matchesRegion &&
        matchesStatus &&
        matchesUom &&
        matchesQuote &&
        matchesProject &&
        matchesGenerator &&
        matchesContract &&
        matchesContainerSize &&
        matchesPricingTier &&
        matchesProfileId &&
        matchesCreatedBy &&
        matchesDate
      );
    });

    // Sort by project name, effective date, then product name
    return filtered.sort((a, b) => {
      // First, sort by project name (handle undefined values)
      const projectA = a.projectName || "";
      const projectB = b.projectName || "";
      if (projectA !== projectB) {
        return projectA.localeCompare(projectB);
      }

      // If project names are the same, sort by effective date
      const dateA = new Date(a.effectiveDate);
      const dateB = new Date(b.effectiveDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }

      // If dates are the same, sort by product name
      return a.productName.localeCompare(b.productName);
    });
  }, [allPriceItems, filters]);

  // Group filteredPriceItems by quote name
  const groupedByQuote = useMemo(() => {
    const quotes: { [quote: string]: PriceItem[] } = {};
    filteredPriceItems.forEach((item) => {
      const quote = item.quoteName || "Q-2024-001";
      if (!quotes[quote]) quotes[quote] = [];
      quotes[quote].push(item);
    });
    return quotes;
  }, [filteredPriceItems]);

  const handleBack = () => {
    //router.back();
    router.push(`/`);
  };

  const handleTypeSelection = (type: "new" | "addendum") => {
    setPricingType(type);
    setCreatePricingDialogOpen(true);

    if (type === "addendum") {
      setSelectedPriceHeader(""); // Clear selected price header for addendum
    } else {
      setPricingQuoteName(""); // Clear pricing quote name for new pricing
      setHeaderTemplate(""); // Clear header template for new pricing
      setCustomHeaderFields({
        description: "",
        effectiveDate: "",
        expirationDate: "",
        invoiceMinimum: "",
        container55gMinimum: "",
        absoluteContainerMinimum: "",
      });
    }
  };

  const handleCreatePricingSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to import");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", pricingType);

      if (pricingType === "addendum") {
        if (!selectedPriceHeader) {
          toast.error("Please select a price header for addendum");
          setIsImporting(false);
          return;
        }
        formData.append("priceHeaderId", selectedPriceHeader);
      } else {
        if (!pricingQuoteName.trim()) {
          toast.error("Please enter a pricing quote name for new pricing");
          setIsImporting(false);
          return;
        }
        formData.append("pricingQuoteName", pricingQuoteName);
        formData.append("headerTemplate", headerTemplate);
        formData.append(
          "customHeaderFields",
          JSON.stringify(customHeaderFields)
        );
      }

      const response = await fetch(
        `/api/customers/${customerId}/pricing/create`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setCreatePricingDialogOpen(false);
        setSelectedFile(null);
        setUploadedData([]);
        setPricingQuoteName("");
        setHeaderTemplate("");
        setCustomHeaderFields({
          description: "",
          effectiveDate: "",
          expirationDate: "",
          invoiceMinimum: "",
          container55gMinimum: "",
          absoluteContainerMinimum: "",
        });

        // Refresh the data
        const headersResponse = await customerService.getCustomerPriceHeaders(
          customerId
        );
        if (headersResponse.success) {
          setPriceHeaders(headersResponse.data);

          // Reload all price items
          const allItems: PriceItem[] = [];
          for (const header of headersResponse.data) {
            const itemsResponse = await customerService.getPriceHeaderItems(
              header.priceHeaderId
            );
            if (itemsResponse.success) {
              allItems.push(...itemsResponse.data);
            }
          }
          setAllPriceItems(allItems);
        }
      } else {
        toast.error(result.message || "Failed to create pricing");
      }
    } catch (error) {
      console.error("Create pricing error:", error);
      toast.error("Failed to create pricing");
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddendumSubmit = async () => {
    if (!selectedPriceHeader) {
      toast.error("Please select a price header");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile!);
      formData.append("type", "addendum");
      formData.append("priceHeaderId", selectedPriceHeader);

      const response = await fetch(
        `/api/customers/${customerId}/pricing/create`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setCreatePricingDialogOpen(false);
        setSelectedFile(null);
        setUploadedData([]);
        setSelectedPriceHeader("");

        // Navigate to pricing detail screen
        router.push(
          `/pricing-entry?customerId=${customerId}&priceHeaderId=${selectedPriceHeader}`
        );
      } else {
        toast.error(result.message || "Failed to create addendum");
      }
    } catch (error) {
      console.error("Addendum error:", error);
      toast.error("Failed to create addendum");
    } finally {
      setIsImporting(false);
    }
  };

  const handleNewPricingSubmit = async () => {
    if (!pricingQuoteName.trim()) {
      toast.error("Please enter a pricing quote name");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile!);
      formData.append("type", "new");
      formData.append("pricingQuoteName", pricingQuoteName);
      formData.append("headerTemplate", headerTemplate);
      formData.append("customHeaderFields", JSON.stringify(customHeaderFields));

      const response = await fetch(
        `/api/customers/${customerId}/pricing/create`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setCreatePricingDialogOpen(false);
        setSelectedFile(null);
        setUploadedData([]);
        setPricingQuoteName("");
        setHeaderTemplate("");
        setCustomHeaderFields({
          description: "",
          effectiveDate: "",
          expirationDate: "",
          invoiceMinimum: "",
          container55gMinimum: "",
          absoluteContainerMinimum: "",
        });

        // Refresh the data
        const headersResponse = await customerService.getCustomerPriceHeaders(
          customerId
        );
        if (headersResponse.success) {
          setPriceHeaders(headersResponse.data);

          // Reload all price items
          const allItems: PriceItem[] = [];
          for (const header of headersResponse.data) {
            const itemsResponse = await customerService.getPriceHeaderItems(
              header.priceHeaderId
            );
            if (itemsResponse.success) {
              allItems.push(...itemsResponse.data);
            }
          }
          setAllPriceItems(allItems);
        }
      } else {
        toast.error(result.message || "Failed to create new pricing");
      }
    } catch (error) {
      console.error("New pricing error:", error);
      toast.error("Failed to create new pricing");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export - export all price items
      const exportData = filteredPriceItems.map((item) => ({
        "Product Name": item.productName,
        Region: item.region,
        "Unit Price": item.unitPrice,
        "Minimum Price": item.minimumPrice,
        "Effective Date": format(parseISO(item.effectiveDate), "MM/dd/yyyy"),
        "Expiration Date": format(parseISO(item.expirationDate), "MM/dd/yyyy"),
        Status: item.status,
        "Quote Name": item.quoteName || "",
        "Project Name": item.projectName || "",
        UOM: item.uom || "",
        "Contract ID": item.contractId || "",
        "Generator ID": item.generatorId || "",
        "Vendor ID": item.vendorId || "",
        "Container Size": item.containerSize || "",
        "Billing UOM": item.billingUom || "",
        "Pricing Type": item.pricingType || "",
        "Price Priority": item.pricePriority || "",
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Customer Pricing");

      // Generate filename
      const fileName = `${customer?.customerName?.replace(
        /\s+/g,
        "_"
      )}_Pricing_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
      toast.success("Pricing data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export pricing data");
    }
  };

  const handleImportPricing = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to import");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `/api/customers/${customerId}/pricing/import`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setCreatePricingDialogOpen(false);
        setSelectedFile(null);

        // Refresh the data
        const headersResponse = await customerService.getCustomerPriceHeaders(
          customerId
        );
        if (headersResponse.success) {
          setPriceHeaders(headersResponse.data);

          // Reload all price items
          const allItems: PriceItem[] = [];
          for (const header of headersResponse.data) {
            const itemsResponse = await customerService.getPriceHeaderItems(
              header.priceHeaderId
            );
            if (itemsResponse.success) {
              allItems.push(...itemsResponse.data);
            }
          }
          setAllPriceItems(allItems);
        }
      } else {
        toast.error(result.message || "Failed to import pricing data");
        if (result.errors) {
          console.error("Import errors:", result.errors);
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import pricing data");
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      try {
        // Parse the Excel file to preview data
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setUploadedData(jsonData);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error("Failed to parse Excel file");
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      await handleFileSelect(event);
      setCurrentStep("type");
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/api/customers/pricing-template";
    link.download = "pricing_import_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilters({
      productName: "",
      region: "all",
      status: "all",
      dateFrom: "",
      dateTo: "",
      uom: "all",
      quoteName: "",
      projectName: "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="inline-flex items-center bg-[rgba(46,125,50,0.1)] text-[#2e7d32] rounded-full px-3 py-1 text-xs font-medium">
            Active
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center bg-[rgba(237,108,2,0.1)] text-[#ed6c02] rounded-full px-3 py-1 text-xs font-medium">
            In-Progress
          </span>
        );
      case "new":
        return (
          <span className="inline-flex items-center bg-[rgba(25,118,210,0.1)] text-[#1976d2] rounded-full px-3 py-1 text-xs font-medium">
            New
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-[rgba(158,158,158,0.1)] text-[#49454f] rounded-full px-3 py-1 text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get unique values for filter dropdowns
  const uniqueRegions = useMemo(() => {
    return Array.from(new Set(allPriceItems.map((item) => item.region))).sort();
  }, [allPriceItems]);

  const uniqueUoms = useMemo(() => {
    return Array.from(
      new Set(
        allPriceItems
          .map((item) => item.uom)
          .filter((uom): uom is string => Boolean(uom))
      )
    ).sort();
  }, [allPriceItems]);

  const handleBackToUpload = () => {
    setCurrentStep("upload");
    setSelectedFile(null);
    setUploadedData([]);
  };

  const handleBackToType = () => {
    setCurrentStep("type");
  };

  const resetModal = () => {
    setCreatePricingDialogOpen(false);
    setCurrentStep("upload");
    setSelectedFile(null);
    setUploadedData([]);
    setPricingType("new");
    setSelectedPriceHeader("");
    setPricingQuoteName("");
    setHeaderTemplate("custom");
    setCustomHeaderFields({
      description: "",
      effectiveDate: "",
      expirationDate: "",
      invoiceMinimum: "",
      container55gMinimum: "",
      absoluteContainerMinimum: "",
    });
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffbfe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#65b230] mx-auto mb-4"></div>
          <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]">
            Loading customer pricing information...
          </p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#fffbfe] flex items-center justify-center">
        <div className="text-center">
          <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f] mb-4">
            Customer not found
          </p>
          <MuiButton
            variant="contained"
            onClick={handleBack}
            sx={{
              backgroundColor: "#65b230",
              borderRadius: "100px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#4a8a1f",
              },
            }}
          >
            Go Back
          </MuiButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbfe] py-8">
      <div className="w-full max-w-[1800px] mx-auto px-2">
        {/* Header */}
        <div className="mb-8">
          <MuiButton
            variant="text"
            onClick={handleBack}
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#49454f",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(101, 178, 48, 0.08)",
              },
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </MuiButton>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Roboto:Medium',_sans-serif] font-medium text-[32px] leading-[40px] text-[#1c1b1f] mb-2">
                {customer?.customerName}
              </h1>
              <div className="flex items-center space-x-2">
                {customer?.oracleCustomerId && (
                  <span className="inline-flex items-center bg-[rgba(158,158,158,0.1)] text-[#49454f] rounded-full px-3 py-1 text-xs font-medium">
                    Oracle: {customer.oracleCustomerId}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#b9b9b9] rounded shadow-sm">
          <div className="p-6 border-b border-[#b9b9b9]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[22px] leading-[28px] text-[#1c1b1f]">
                  All Pricing Items
                </span>
                <span className="inline-flex items-center bg-[rgba(158,158,158,0.1)] text-[#49454f] rounded-full px-3 py-1 text-xs font-medium border border-[#b9b9b9]">
                  {filteredPriceItems.length} items
                </span>
              </div>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2">
                  <MuiButton
                    variant="contained"
                    size="small"
                    onClick={() => setCreatePricingDialogOpen(true)}
                    sx={{
                      backgroundColor: "#65b230",
                      borderRadius: "100px",
                      textTransform: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      "&:hover": {
                        backgroundColor: "#4a8a1f",
                      },
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create New Pricing</span>
                  </MuiButton>
                </div>
                <MuiButton
                  variant="outlined"
                  size="small"
                  onClick={handleExportToExcel}
                  sx={{
                    borderRadius: "100px",
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderColor: "#b9b9b9",
                    color: "#49454f",
                    "&:hover": {
                      borderColor: "#65b230",
                      color: "#65b230",
                    },
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span>Export Excel</span>
                </MuiButton>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6">
              <div className="flex flex-wrap gap-4 items-end mb-4 mt-4">
                {/* Quote Number/Name Filter */}
                <div>
                  <TextField
                    label="Quote Number/Name"
                    placeholder="Quote number or name..."
                    value={filters.quoteName}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, quoteName: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ width: "224px" }}
                  />
                </div>
                {/* Status Filter */}
                <div>
                  <FormControl size="small" sx={{ width: "160px" }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, status: e.target.value }))
                      }
                      label="Status"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="In-Progress">In-Progress</MenuItem>
                      <MenuItem value="New">New</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                {/* Date Range Filter */}
                <div>
                  <div className="flex gap-2 items-center">
                    <TextField
                      label="Effective Date"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, dateFrom: e.target.value }))
                      }
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        style: { paddingTop: "16px", paddingBottom: "16px" },
                      }}
                      sx={{ width: "144px" }}
                    />
                    <span className="self-center text-[#49454f]">to</span>
                    <TextField
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, dateTo: e.target.value }))
                      }
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        style: { paddingTop: "16px", paddingBottom: "16px" },
                      }}
                      sx={{ width: "144px" }}
                    />
                  </div>
                </div>
                {/* More Filters Button */}
                <MuiButton
                  variant="outlined"
                  onClick={() => setAdvancedFiltersOpen(true)}
                  sx={{
                    borderRadius: "100px",
                    textTransform: "none",
                    borderColor: "#b9b9b9",
                    color: "#49454f",
                    backgroundColor: "#f5f5f5",
                    "&:hover": {
                      borderColor: "#65b230",
                      color: "#65b230",
                      backgroundColor: "#f0f8f0",
                    },
                  }}
                >
                  More Filters
                </MuiButton>
              </div>

              {/* Active Filters Chips */}
              {Object.entries(filters).some(
                ([key, value]) =>
                  ["all", "", undefined, null].indexOf(value as any) === -1
              ) && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 items-center p-3 rounded-md bg-[rgba(101,178,48,0.08)] border border-[rgba(101,178,48,0.2)]">
                    {Object.entries(filters)
                      .filter(
                        ([key, value]) =>
                          ["all", "", undefined, null].indexOf(value as any) ===
                          -1
                      )
                      .map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center bg-white text-[#1c1b1f] rounded px-2 py-1 text-xs font-medium shadow-sm"
                        >
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                          : {value}
                          <button
                            className="ml-1 text-[#1c1b1f] hover:text-[#65b230]"
                            onClick={() =>
                              setFilters((f) => ({
                                ...f,
                                [key]:
                                  key === "status" ||
                                  key === "uom" ||
                                  key === "region"
                                    ? "all"
                                    : "",
                              }))
                            }
                            aria-label={`Remove filter ${key}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    <MuiButton
                      variant="text"
                      size="small"
                      onClick={clearFilters}
                      sx={{
                        ml: 1,
                        fontSize: "12px",
                        height: "28px",
                        px: 1.5,
                        color: "#49454f",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "rgba(101, 178, 48, 0.08)",
                        },
                      }}
                    >
                      Clear Filters
                    </MuiButton>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Items Table */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <div className="bg-white border border-[#b9b9b9] rounded">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[rgba(0,0,0,0.06)] border-b border-[#b9b9b9]">
                        <th className="font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px] py-[20.18px] px-6 text-left">
                          Quote
                        </th>
                        <th className="font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px] py-[20.18px] px-6 text-left">
                          Active Dates
                        </th>
                        <th className="font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px] py-[20.18px] px-6 text-left">
                          Status
                        </th>
                        <th className="font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px] py-[20.18px] px-6 text-left">
                          Profile
                        </th>
                        <th className="font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px] py-[20.18px] px-6 text-left">
                          Generator
                        </th>
                        <th className="font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px] py-[20.18px] px-6 text-left">
                          Contract
                        </th>
                        <th className="font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px] py-[20.18px] px-6 text-left">
                          Container Size
                        </th>
                        <th className="font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px] py-[20.18px] px-6 text-left">
                          UOM
                        </th>
                        <th className="font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px] py-[20.18px] px-6 text-left">
                          Price
                        </th>
                        <th className="font-['Arial:Narrow',_sans-serif] font-normal text-[12px] leading-[17.14px] text-[#49454f] tracking-[0.3px] py-[20.18px] px-6 text-left">
                          Minimum
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPriceItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="text-center py-8 font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]"
                          >
                            No pricing items found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        Object.entries(groupedByQuote)
                          .map(([quote, items]) => [
                            // Quote header row: quote name in first cell, rest blank but styled
                            <tr
                              key={quote + "-header"}
                              className="border-[#b9b9b9]"
                            >
                              <td className="bg-[#f5f5f5] font-['Roboto:Medium',_sans-serif] font-medium text-[18px] leading-[24px] text-[#1c1b1f] py-[26.27px] px-6">
                                <button
                                  onClick={() => {
                                    // Find the price header ID for this quote
                                    // First try to match by headerName, then by finding items with this quote name
                                    const priceHeader =
                                      priceHeaders.find(
                                        (header) => header.headerName === quote
                                      ) ||
                                      priceHeaders.find((header) =>
                                        items.some(
                                          (item) =>
                                            item.priceHeaderId ===
                                            header.priceHeaderId
                                        )
                                      );
                                    if (priceHeader) {
                                      router.push(
                                        `/customer-pricing/${customerId}/quote/${priceHeader.priceHeaderId}`
                                      );
                                    }
                                  }}
                                  className="hover:text-[#65b230] hover:underline cursor-pointer transition-colors"
                                >
                                  {quote}
                                </button>
                              </td>
                              {Array.from({ length: 9 }).map((_, i) => (
                                <td
                                  key={i}
                                  className="bg-[#f5f5f5] py-[26.27px] px-6"
                                />
                              ))}
                            </tr>,
                            // Quote line items
                            ...items.map((item) => (
                              <tr
                                key={item.priceItemId}
                                className="border-[#b9b9b9]"
                              >
                                <td className="py-[26.27px] px-6" />
                                <td className="py-[26.27px] px-6 font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#1c1b1f]">
                                  {item.effectiveDate} - {item.expirationDate}
                                </td>
                                <td className="py-[26.27px] px-6">
                                  {getStatusBadge(item.status)}
                                </td>
                                <td className="py-[26.27px] px-6 font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#1c1b1f]">
                                  {item.profileId || "-"}
                                </td>
                                <td className="py-[26.27px] px-6 font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#1c1b1f]">
                                  {item.generatorId || "-"}
                                </td>
                                <td className="py-[26.27px] px-6 font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#1c1b1f]">
                                  {item.contractId || "-"}
                                </td>
                                <td className="py-[26.27px] px-6 font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#1c1b1f]">
                                  {item.containerSize || "-"}
                                </td>
                                <td className="py-[26.27px] px-6 font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#1c1b1f]">
                                  {item.uom || "-"}
                                </td>
                                <td className="py-[26.27px] px-6 font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#1c1b1f]">
                                  {formatCurrency(item.unitPrice)}
                                </td>
                                <td className="py-[26.27px] px-6 font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#1c1b1f]">
                                  {formatCurrency(item.minimumPrice)}
                                </td>
                              </tr>
                            )),
                          ])
                          .flat()
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Dialog */}
        <Dialog
          open={advancedFiltersOpen}
          onClose={() => setAdvancedFiltersOpen(false)}
          maxWidth="sm"
          fullWidth
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
          <DialogContent sx={{ p: 3 }}>
            <div className="flex flex-col gap-4">
              {/* Clear Filters Button - positioned at top for easy access */}
              <div className="flex justify-end pb-2 border-b border-[#b9b9b9]">
                <MuiButton
                  variant="text"
                  size="small"
                  onClick={clearFilters}
                  sx={{
                    fontSize: "14px",
                    color: "#49454f",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(101, 178, 48, 0.08)",
                    },
                  }}
                >
                  Clear All Filters
                </MuiButton>
              </div>
              {/* Product Filter */}
              <TextField
                label="Product"
                placeholder="Product name..."
                value={filters.productName}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    productName: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
              {/* Generator */}
              <TextField
                label="Generator"
                placeholder="Generator..."
                value={filters.generator || ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, generator: e.target.value }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
              {/* Facility */}
              <TextField
                label="Facility"
                placeholder="Facility..."
                value={filters.facility || ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, facility: e.target.value }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
              {/* Contract Number */}
              <TextField
                label="Contract Number"
                placeholder="Contract number..."
                value={filters.contractNumber || ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    contractNumber: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
              {/* Container Size */}
              <TextField
                label="Container Size"
                placeholder="Container size..."
                value={filters.containerSize || ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    containerSize: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
              {/* Unit of Measure (UOM) */}
              <TextField
                label="Unit of Measure (UOM)"
                placeholder="UOM..."
                value={filters.uom}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, uom: e.target.value }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
              {/* Project Name */}
              <TextField
                label="Project Name"
                placeholder="Project name..."
                value={filters.projectName}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    projectName: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
              {/* Pricing Tier */}
              <TextField
                label="Pricing Tier"
                placeholder="Pricing tier..."
                value={filters.pricingTier || ""}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    pricingTier: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
              {/* Profile ID */}
              <TextField
                label="Profile ID"
                placeholder="Profile ID..."
                value={filters.profileId || ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, profileId: e.target.value }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
              {/* Created By */}
              <TextField
                label="Created By"
                placeholder="Created by..."
                value={filters.createdBy || ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, createdBy: e.target.value }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
              {/* Sales Rep */}
              <TextField
                label="Sales Rep"
                placeholder="Sales rep..."
                value={filters.salesRep || ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, salesRep: e.target.value }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <MuiButton
              variant="outlined"
              onClick={() => setAdvancedFiltersOpen(false)}
              sx={{
                borderRadius: "100px",
                textTransform: "none",
                borderColor: "#b9b9b9",
                color: "#49454f",
                "&:hover": {
                  borderColor: "#65b230",
                  color: "#65b230",
                },
              }}
            >
              Cancel
            </MuiButton>
            <MuiButton
              variant="contained"
              onClick={() => setAdvancedFiltersOpen(false)}
              sx={{
                backgroundColor: "#65b230",
                borderRadius: "100px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#4a8a1f",
                },
              }}
            >
              Apply Filters
            </MuiButton>
          </DialogActions>
        </Dialog>

        {/* Pricing Upload Dialog */}
        <PricingFullScreenModal
          open={createPricingDialogOpen}
          onOpenChange={setCreatePricingDialogOpen}
          customerId={customerId}
          priceHeaders={priceHeaders}
          onSuccess={() => {
            // Refresh data after import
            customerService
              .getCustomerPriceHeaders(customerId)
              .then((headersResponse) => {
                if (headersResponse.success) {
                  setPriceHeaders(headersResponse.data);
                  // Reload all price items
                  const allItems: PriceItem[] = [];
                  Promise.all(
                    headersResponse.data.map((header) =>
                      customerService.getPriceHeaderItems(header.priceHeaderId)
                    )
                  ).then((results) => {
                    results.forEach((itemsResponse) => {
                      if (itemsResponse.success) {
                        allItems.push(...itemsResponse.data);
                      }
                    });
                    setAllPriceItems(allItems);
                  });
                }
              });
          }}
        />
      </div>
    </div>
  );
}
