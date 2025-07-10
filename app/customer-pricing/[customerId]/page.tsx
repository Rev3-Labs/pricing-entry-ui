"use client";

import React, { useState, useEffect, useMemo } from "react";
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

interface FilterState {
  productName: string;
  region: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  uom: string;
  quoteName: string;
  projectName: string;
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
  const [pricingGroupName, setPricingGroupName] = useState("");
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
        filters.status === "all" || item.status === filters.status;
      const matchesUom =
        filters.uom === "all" ||
        !filters.uom ||
        item.uom?.toLowerCase().includes(filters.uom.toLowerCase());
      const matchesQuote =
        !filters.quoteName ||
        item.quoteName?.toLowerCase().includes(filters.quoteName.toLowerCase());
      const matchesProject =
        !filters.projectName ||
        item.projectName
          ?.toLowerCase()
          .includes(filters.projectName.toLowerCase());

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
    const groups: { [quote: string]: PriceItem[] } = {};
    filteredPriceItems.forEach((item) => {
      const quote = item.quoteName || "Q-2024-001";
      if (!groups[quote]) groups[quote] = [];
      groups[quote].push(item);
    });
    return groups;
  }, [filteredPriceItems]);

  const handleBack = () => {
    router.back();
  };

  const handleTypeSelection = (type: "new" | "addendum") => {
    setPricingType(type);
    setCreatePricingDialogOpen(true);

    if (type === "addendum") {
      setSelectedPriceHeader(""); // Clear selected price header for addendum
    } else {
      setPricingGroupName(""); // Clear pricing group name for new pricing
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
        if (!pricingGroupName.trim()) {
          toast.error("Please enter a pricing group name for new pricing");
          setIsImporting(false);
          return;
        }
        formData.append("pricingGroupName", pricingGroupName);
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
        setPricingGroupName("");
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
    if (!pricingGroupName.trim()) {
      toast.error("Please enter a pricing group name");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile!);
      formData.append("type", "new");
      formData.append("pricingGroupName", pricingGroupName);
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
        setPricingGroupName("");
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
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
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
    setPricingGroupName("");
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
            <span>Back to Search</span>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Customer Pricing
              </h1>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-medium text-gray-900">
                    {customer.customerName}
                  </span>
                </div>
                {customer.oracleCustomerId && (
                  <Badge variant="secondary">
                    ({customer.oracleCustomerId})
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Items Data Grid */}
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
          </CardHeader>
          <CardContent>
            {/* Filters Section */}
            {/* showFilters is no longer needed here as the dialog handles its own filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Filter Options</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="product-filter">Product Name</Label>
                  <Input
                    id="product-filter"
                    value={filters.productName}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        productName: e.target.value,
                      }))
                    }
                    placeholder="Search product name..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="region-filter">Region</Label>
                  <Select
                    value={filters.region}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, region: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {uniqueRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="uom-filter">UOM</Label>
                  <Select
                    value={filters.uom}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, uom: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All UOMs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All UOMs</SelectItem>
                      {uniqueUoms.map((uom) => (
                        <SelectItem key={uom} value={uom}>
                          {uom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quote-filter">Quote Name</Label>
                  <Input
                    id="quote-filter"
                    value={filters.quoteName}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        quoteName: e.target.value,
                      }))
                    }
                    placeholder="Search quote name..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="project-filter">Project Name</Label>
                  <Input
                    id="project-filter"
                    value={filters.projectName}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        projectName: e.target.value,
                      }))
                    }
                    placeholder="Search project name..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date-from">Effective Date From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateFrom: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date-to">Effective Date To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateTo: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

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
                      // Group header row: quote name in first cell, rest blank but styled
                      <TableRow key={quote + "-header"}>
                        <TableCell className="bg-gray-100 font-bold text-lg text-gray-900">
                          {quote}
                        </TableCell>
                        {Array.from({ length: 9 }).map((_, i) => (
                          <TableCell key={i} className="bg-gray-100" />
                        ))}
                      </TableRow>,
                      // Group line items
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
      </div>

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
  );
}
