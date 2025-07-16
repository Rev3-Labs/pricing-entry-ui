"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { PricingSlideover } from "@/components/PricingSlideover";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

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
  const sheetCloseRef = React.useRef<HTMLButtonElement>(null);
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
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "in-progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">In-Progress</Badge>
        );
      case "new":
        return <Badge className="bg-gray-100 text-gray-800">New</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading customer pricing information...
          </p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Customer not found</p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-[1800px] mx-auto px-2">
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {customer?.customerName}
              </h1>
              <div className="flex items-center space-x-2">
                {customer?.oracleCustomerId && (
                  <Badge variant="secondary">
                    Oracle: {customer.oracleCustomerId}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>All Pricing Items</span>
                <Badge variant="outline">
                  {filteredPriceItems.length} items
                </Badge>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setCreatePricingDialogOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Pricing</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportToExcel}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Excel</span>
                </Button>
                <PricingSlideover
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
                              customerService.getPriceHeaderItems(
                                header.priceHeaderId
                              )
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
            {/* Filters just below the heading */}
            <Sheet>
              <div className="flex flex-wrap gap-4 items-end mb-4 mt-4">
                {/* Quote Number/Name Filter */}
                <div>
                  <Label>Quote Number/Name</Label>
                  <Input
                    placeholder="Quote number or name..."
                    value={filters.quoteName}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, quoteName: e.target.value }))
                    }
                    className="w-56"
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
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="In-Progress">In-Progress</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Date Range Filter */}
                <div>
                  <Label>Effective Date</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, dateFrom: e.target.value }))
                      }
                      className="w-36"
                    />
                    <span className="self-center">to</span>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, dateTo: e.target.value }))
                      }
                      className="w-36"
                    />
                  </div>
                </div>
                {/* More Filters Button */}
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                  >
                    More Filters
                  </Button>
                </SheetTrigger>
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
                    <Button
                      variant="ghost"
                      className="ml-2 text-xs h-7 px-3"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
              <SheetContent
                side="right"
                className="max-w-md w-full flex flex-col"
              >
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto">
                  {/* Clear Filters Button - positioned at top for easy access */}
                  <div className="flex justify-end pb-2 border-b border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-sm"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                  {/* Product Filter */}
                  <div>
                    <Label>Product</Label>
                    <Input
                      placeholder="Product name..."
                      value={filters.productName}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          productName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  {/* Generator */}
                  <div>
                    <Label>Generator</Label>
                    <Input
                      placeholder="Generator..."
                      value={filters.generator || ""}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, generator: e.target.value }))
                      }
                    />
                  </div>
                  {/* Facility */}
                  <div>
                    <Label>Facility</Label>
                    <Input
                      placeholder="Facility..."
                      value={filters.facility || ""}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, facility: e.target.value }))
                      }
                    />
                  </div>
                  {/* Contract Number */}
                  <div>
                    <Label>Contract Number</Label>
                    <Input
                      placeholder="Contract number..."
                      value={filters.contractNumber || ""}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          contractNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                  {/* Container Size */}
                  <div>
                    <Label>Container Size</Label>
                    <Input
                      placeholder="Container size..."
                      value={filters.containerSize || ""}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          containerSize: e.target.value,
                        }))
                      }
                    />
                  </div>
                  {/* Unit of Measure (UOM) */}
                  <div>
                    <Label>Unit of Measure (UOM)</Label>
                    <Input
                      placeholder="UOM..."
                      value={filters.uom}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, uom: e.target.value }))
                      }
                    />
                  </div>
                  {/* Project Name */}
                  <div>
                    <Label>Project Name</Label>
                    <Input
                      placeholder="Project name..."
                      value={filters.projectName}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          projectName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  {/* Pricing Tier */}
                  <div>
                    <Label>Pricing Tier</Label>
                    <Input
                      placeholder="Pricing tier..."
                      value={filters.pricingTier || ""}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          pricingTier: e.target.value,
                        }))
                      }
                    />
                  </div>
                  {/* Profile ID */}
                  <div>
                    <Label>Profile ID</Label>
                    <Input
                      placeholder="Profile ID..."
                      value={filters.profileId || ""}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, profileId: e.target.value }))
                      }
                    />
                  </div>
                  {/* Created By */}
                  <div>
                    <Label>Created By</Label>
                    <Input
                      placeholder="Created by..."
                      value={filters.createdBy || ""}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, createdBy: e.target.value }))
                      }
                    />
                  </div>
                  {/* Sales Rep */}
                  <div>
                    <Label>Sales Rep</Label>
                    <Input
                      placeholder="Sales rep..."
                      value={filters.salesRep || ""}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, salesRep: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="sticky bottom-0 left-0 w-full bg-background border-t flex gap-2 p-4 z-10">
                  <Button
                    className="flex-1"
                    onClick={() => sheetCloseRef.current?.click()}
                  >
                    Apply Filters
                  </Button>
                  <SheetClose asChild>
                    <Button
                      ref={sheetCloseRef}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </CardHeader>
          <CardContent>
            {/* View toggle */}
            {/* Remove the viewMode state and toggle buttons */}
            {/* Only render the table view for price items */}
            {/* Remove all code related to the card view */}

            {/* Pricing Items Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote</TableHead>
                    <TableHead>Active Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>Generator</TableHead>
                    <TableHead>Contract</TableHead>

                    <TableHead>Container Size</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Minimum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPriceItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-gray-500"
                      >
                        No pricing items found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    Object.entries(groupedByQuote).map(([quote, items]) => [
                      // Quote header row: quote name in first cell, rest blank but styled
                      <TableRow key={quote + "-header"}>
                        <TableCell className="bg-gray-100 font-bold text-lg text-gray-900">
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
                            className="hover:text-primary-1 hover:underline cursor-pointer transition-colors"
                          >
                            {quote}
                          </button>
                        </TableCell>
                        {Array.from({ length: 9 }).map((_, i) => (
                          <TableCell key={i} className="bg-gray-100" />
                        ))}
                      </TableRow>,
                      // Quote line items
                      ...items.map((item) => (
                        <TableRow key={item.priceItemId}>
                          <TableCell />
                          <TableCell>
                            {item.effectiveDate} - {item.expirationDate}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>{item.profileId || "-"}</TableCell>
                          <TableCell>{item.generatorId || "-"}</TableCell>
                          <TableCell>{item.contractId || "-"}</TableCell>
                          <TableCell>{item.containerSize || "-"}</TableCell>
                          <TableCell>{item.uom || "-"}</TableCell>
                          <TableCell>
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.minimumPrice)}
                          </TableCell>
                        </TableRow>
                      )),
                    ])
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Upload Dialog */}
        <PricingSlideover
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
