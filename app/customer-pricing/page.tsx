"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Chip,
  Card,
  CardContent,
  Checkbox,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
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
  Users,
  Hash,
  Tag,
  RefreshCw,
  Check,
  PenSquare,
  RotateCcw,
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
import {
  loadSampleDataFromLocalStorage,
  saveSampleDataToLocalStorage,
} from "@/scripts/generate-sample-data";

interface FilterState {
  customer: string;
  customerName: string;
  contractNumber: string;
  profileId: string;
  itemNumber: string;
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
  containerSize?: string;
  pricingTier?: string;
  createdBy?: string;
  salesRep?: string;
  priceRange?: {
    min?: string;
    max?: string;
  };
}

interface AllPricingData {
  customers: CustomerInfo[];
  priceHeaders: PriceHeader[];
  priceItems: PriceItem[];
}

export default function AllCustomerPricingPage() {
  const router = useRouter();
  const [allPricingData, setAllPricingData] = useState<AllPricingData>({
    customers: [],
    priceHeaders: [],
    priceItems: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    customer: "all",
    customerName: "",
    contractNumber: "",
    profileId: "",
    itemNumber: "",
    productName: "",
    region: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    uom: "all",
    quoteName: "",
    projectName: "",
  });
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [priceChangeDialogOpen, setPriceChangeDialogOpen] = useState(false);
  const [selectedPriceChangeRequests, setSelectedPriceChangeRequests] =
    useState<string[]>([]);
  const [priceChangeRequestFilter, setPriceChangeRequestFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");

  // New state for price change configuration step
  const [priceChangeConfigDialogOpen, setPriceChangeConfigDialogOpen] =
    useState(false);
  const [templateType, setTemplateType] = useState<"standard" | "custom">(
    "standard"
  );

  // Edit mode state - controls when checkbox selection is enabled
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);

  // Helper function to get selected row IDs as array
  const getSelectedRowIds = (): string[] => {
    return Array.isArray(selectedRows) ? selectedRows : [];
  };

  // New state for edit mode dialogs
  const [applyChangesDialogOpen, setApplyChangesDialogOpen] = useState(false);

  // State for bulk edit form
  const [bulkEditForm, setBulkEditForm] = useState({
    containerSize: "",
    uom: "",
    unitPrice: "",
    minimumPrice: "",
  });

  // State for tracking new and modified rows
  const [newRows, setNewRows] = useState<Set<string>>(new Set());
  const [modifiedRows, setModifiedRows] = useState<Set<string>>(new Set());

  // State for inline editing
  const [isAddingNewEntry, setIsAddingNewEntry] = useState(false);
  const [newEntryData, setNewEntryData] = useState({
    customerName: "",
    productName: "",
    profileId: "",
    generatorId: "",
    contractId: "",
    projectName: "",
    facilityName: "",
    containerSize: "",
    uom: "",
    unitPrice: "",
    minimumPrice: "",
  });

  // State for inline editing of the new row
  const [editingNewRow, setEditingNewRow] = useState(false);
  const [editingRowData, setEditingRowData] = useState({
    customerName: "",
    productName: "",
    profileId: "",
    generatorId: "",
    contractId: "",
    projectName: "",
    facilityName: "",
    containerSize: "",
    uom: "",
    unitPrice: "",
    minimumPrice: "",
  });

  // State to store the current price change configuration
  const [currentPriceChangeConfig, setCurrentPriceChangeConfig] = useState<{
    selectedRequests: string[];
    templateType: "standard" | "custom";
    customHeaderFields?: any;
  } | null>(null);

  // Custom header fields state
  const [customHeaderFields, setCustomHeaderFields] = useState({
    eei: "Regular",
    fuelSurcharge: "Standard Monthly",
    invoiceMinimum: 350,
    containerConversion: "Standard Conversion 1",
    itemMinimums: "Standard Tables",
    economicAdjustmentFee: 3,
    eManifestFee: 25,
    hubFee: true,
    regionalPricing: true,
    zoneTransportation: true,
  });

  // Load all pricing data
  useEffect(() => {
    const loadAllPricingData = async () => {
      setIsLoading(true);
      try {
        // Try to load sample data from localStorage first
        let sampleData = loadSampleDataFromLocalStorage();

        // If no sample data exists, generate and save it
        if (sampleData.customers.length === 0) {
          console.log("No sample data found, generating new sample data...");
          sampleData = saveSampleDataToLocalStorage();
        }

        setAllPricingData({
          customers: sampleData.customers,
          priceHeaders: sampleData.priceHeaders,
          priceItems: sampleData.priceItems,
        });
      } catch (error) {
        console.error("Failed to load pricing data:", error);
        toast.error("Failed to load pricing data");
      } finally {
        setIsLoading(false);
      }
    };

    loadAllPricingData();
  }, []);

  // Filter price items based on current filters
  const filteredPriceItems = useMemo(() => {
    // Safety check: ensure allPricingData is properly initialized
    if (
      !allPricingData ||
      !allPricingData.priceItems ||
      !allPricingData.priceHeaders ||
      !allPricingData.customers
    ) {
      return [];
    }

    return allPricingData.priceItems.filter((item) => {
      // Get the associated customer and header for this item
      const header = allPricingData.priceHeaders.find(
        (h) => h.priceHeaderId === item.priceHeaderId
      );
      const customer = allPricingData.customers.find(
        (c) => c.customerId === header?.customerId
      );

      const matchesCustomer =
        filters.customer === "all" ||
        (customer && customer.customerId === filters.customer);

      const matchesCustomerName =
        !filters.customerName ||
        (customer &&
          customer.customerName
            .toLowerCase()
            .includes(filters.customerName.toLowerCase()));

      const matchesContractNumber =
        !filters.contractNumber ||
        (item.contractId &&
          item.contractId
            .toLowerCase()
            .includes(filters.contractNumber.toLowerCase()));

      const matchesProfileId =
        !filters.profileId ||
        (item.profileId &&
          item.profileId
            .toLowerCase()
            .includes(filters.profileId.toLowerCase()));

      const matchesItemNumber =
        !filters.itemNumber ||
        (item.priceItemId &&
          item.priceItemId
            .toLowerCase()
            .includes(filters.itemNumber.toLowerCase()));

      const matchesProductName =
        !filters.productName ||
        item.productName
          .toLowerCase()
          .includes(filters.productName.toLowerCase());

      const matchesRegion =
        filters.region === "all" || item.region === filters.region;

      const matchesStatus =
        filters.status === "all" || item.status === filters.status;

      const matchesQuoteName =
        !filters.quoteName ||
        (item.quoteName &&
          item.quoteName
            .toLowerCase()
            .includes(filters.quoteName.toLowerCase()));

      const matchesProjectName =
        !filters.projectName ||
        (item.projectName &&
          item.projectName
            .toLowerCase()
            .includes(filters.projectName.toLowerCase()));

      const matchesUOM =
        filters.uom === "all" || (item.uom && item.uom === filters.uom);

      const matchesGenerator =
        !filters.generator ||
        (item.generatorId &&
          item.generatorId
            .toLowerCase()
            .includes(filters.generator.toLowerCase()));

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

      // Date filtering
      let matchesDateRange = true;
      if (filters.dateFrom) {
        const effectiveDate = new Date(item.effectiveDate);
        const fromDate = new Date(filters.dateFrom);
        matchesDateRange = matchesDateRange && effectiveDate >= fromDate;
      }
      if (filters.dateTo) {
        const effectiveDate = new Date(item.effectiveDate);
        const toDate = new Date(filters.dateTo);
        matchesDateRange = matchesDateRange && effectiveDate <= toDate;
      }

      // Price range filtering
      let matchesPriceRange = true;
      if (filters.priceRange?.min) {
        matchesPriceRange =
          matchesPriceRange &&
          item.unitPrice >= parseFloat(filters.priceRange.min);
      }
      if (filters.priceRange?.max) {
        matchesPriceRange =
          matchesPriceRange &&
          item.unitPrice <= parseFloat(filters.priceRange.max);
      }

      return (
        matchesCustomer &&
        matchesCustomerName &&
        matchesContractNumber &&
        matchesProfileId &&
        matchesItemNumber &&
        matchesProductName &&
        matchesRegion &&
        matchesStatus &&
        matchesQuoteName &&
        matchesProjectName &&
        matchesUOM &&
        matchesGenerator &&
        matchesContainerSize &&
        matchesPricingTier &&
        matchesDateRange &&
        matchesPriceRange
      );
    });
  }, [allPricingData, filters]);

  // Transform filtered items into DataGrid rows
  const rows = useMemo(() => {
    // Safety check: ensure allPricingData is properly initialized
    if (
      !allPricingData ||
      !allPricingData.priceHeaders ||
      !allPricingData.customers
    ) {
      return [];
    }

    // Safety check: ensure filteredPriceItems is available
    if (!filteredPriceItems || !Array.isArray(filteredPriceItems)) {
      return [];
    }

    const baseRows = filteredPriceItems.map((item) => {
      const header = allPricingData.priceHeaders.find(
        (h) => h.priceHeaderId === item.priceHeaderId
      );
      const customer = allPricingData.customers.find(
        (c) => c.customerId === header?.customerId
      );

      return {
        id: item.priceItemId,
        customerId: customer?.customerId || "",
        customerName: customer?.customerName || "",
        productName: item.productName,
        profileId: item.profileId,
        generatorId: item.generatorId,
        contractId: item.contractId,
        projectName: item.projectName,
        facilityName: item.facilityName,
        containerSize: item.containerSize,
        uom: item.uom,
        unitPrice: item.unitPrice,
        minimumPrice: item.minimumPrice,
        header: header,
      };
    });

    // Add new entry row at the top if in add mode
    if (isAddingNewEntry) {
      const newEntryRow = {
        id: "new-entry-row",
        customerId: "",
        customerName: editingRowData.customerName || "",
        productName: editingRowData.productName || "",
        profileId: editingRowData.profileId || "",
        generatorId: editingRowData.generatorId || "",
        contractId: editingRowData.contractId || "",
        projectName: editingRowData.projectName || "",
        facilityName: editingRowData.facilityName || "",
        containerSize: editingRowData.containerSize || "",
        uom: editingRowData.uom || "",
        unitPrice: editingRowData.unitPrice || "",
        minimumPrice: editingRowData.minimumPrice || "",
        header: null,
        isNewEntry: true,
      };
      return [newEntryRow, ...baseRows];
    }

    return baseRows;
  }, [
    filteredPriceItems,
    allPricingData.priceHeaders,
    allPricingData.customers,
    isAddingNewEntry,
    editingRowData,
  ]);

  const handleBack = () => {
    router.back();
  };

  const handleCustomerClick = (customerId: string) => {
    router.push(`/customer-pricing/${customerId}`);
  };

  const handleQuoteClick = (customerId: string, priceHeaderId: string) => {
    router.push(`/customer-pricing/${customerId}/quote/${priceHeaderId}`);
  };

  const handleNewPriceChange = () => {
    setPriceChangeDialogOpen(true);
  };

  const handlePriceChangeRequestSelect = (requestId: string) => {
    setSelectedPriceChangeRequests((prev) => {
      if (prev.includes(requestId)) {
        return prev.filter((id) => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const handleCreatePriceChange = () => {
    if (selectedPriceChangeRequests.length === 0) {
      toast.error("Please select at least one price change request");
      return;
    }

    // Open the configuration dialog instead of immediately creating
    setPriceChangeDialogOpen(false);
    setPriceChangeConfigDialogOpen(true);
  };

  const handleCancelPriceChange = () => {
    setPriceChangeDialogOpen(false);
    setSelectedPriceChangeRequests([]);
    setPriceChangeRequestFilter("");
    setAssignedToFilter("");
  };

  // New handlers for price change configuration
  const handlePriceChangeConfigSubmit = () => {
    // Save the current price change configuration
    setCurrentPriceChangeConfig({
      selectedRequests: [...selectedPriceChangeRequests],
      templateType,
      customHeaderFields:
        templateType === "custom" ? { ...customHeaderFields } : undefined,
    });

    // TODO: Implement the actual price change creation logic with the configuration
    console.log("Creating price changes with:", {
      selectedRequests: selectedPriceChangeRequests,
      templateType,
      customHeaderFields: templateType === "custom" ? customHeaderFields : null,
    });

    toast.success(
      `Creating price changes for ${selectedPriceChangeRequests.length} request(s) with ${templateType} template. Edit mode is now enabled.`
    );

    // Enable edit mode
    setIsEditMode(true);

    // Reset dialog state but keep the configuration data
    setPriceChangeConfigDialogOpen(false);
    setSelectedPriceChangeRequests([]);
    setPriceChangeRequestFilter("");
    setAssignedToFilter("");
    setTemplateType("standard");
    setCustomHeaderFields({
      eei: "Regular",
      fuelSurcharge: "Standard Monthly",
      invoiceMinimum: 350,
      containerConversion: "Standard Conversion 1",
      itemMinimums: "Standard Tables",
      economicAdjustmentFee: 3,
      eManifestFee: 25,
      hubFee: true,
      regionalPricing: true,
      zoneTransportation: true,
    });
  };

  const handleCancelPriceChangeConfig = () => {
    setPriceChangeConfigDialogOpen(false);
    setSelectedPriceChangeRequests([]);
    setPriceChangeRequestFilter("");
    setAssignedToFilter("");
    setTemplateType("standard");
    setCurrentPriceChangeConfig(null); // Clear the price change configuration
    setCustomHeaderFields({
      eei: "Regular",
      fuelSurcharge: "Standard Monthly",
      invoiceMinimum: 350,
      containerConversion: "Standard Conversion 1",
      itemMinimums: "Standard Tables",
      economicAdjustmentFee: 3,
      eManifestFee: 25,
      hubFee: true,
      regionalPricing: true,
      zoneTransportation: true,
    });
  };

  const handleBackToPriceChangeSelection = () => {
    setPriceChangeConfigDialogOpen(false);
    setPriceChangeDialogOpen(true);
  };

  // New handler functions for edit mode
  const handleAddNewEntry = () => {
    setIsAddingNewEntry(true);
    setEditingNewRow(true);
    setNewEntryData({
      customerName: "",
      productName: "",
      profileId: "",
      generatorId: "",
      contractId: "",
      projectName: "",
      facilityName: "",
      containerSize: "",
      uom: "",
      unitPrice: "",
      minimumPrice: "",
    });
    setEditingRowData({
      customerName: "",
      productName: "",
      profileId: "",
      generatorId: "",
      contractId: "",
      projectName: "",
      facilityName: "",
      containerSize: "",
      uom: "",
      unitPrice: "",
      minimumPrice: "",
    });
  };

  const handleSaveNewEntry = () => {
    // Validate required fields
    if (
      !editingRowData.productName ||
      !editingRowData.containerSize ||
      !editingRowData.uom ||
      !editingRowData.unitPrice ||
      !editingRowData.minimumPrice
    ) {
      toast.error(
        "Please fill in all required fields: Product Name, Container Size, UOM, Unit Price, and Minimum Price"
      );
      return;
    }

    // Validate numeric fields
    if (
      isNaN(parseFloat(editingRowData.unitPrice)) ||
      parseFloat(editingRowData.unitPrice) < 0
    ) {
      toast.error("Unit Price must be a valid positive number");
      return;
    }

    if (
      isNaN(parseFloat(editingRowData.minimumPrice)) ||
      parseFloat(editingRowData.minimumPrice) < 0
    ) {
      toast.error("Minimum Price must be a valid positive number");
      return;
    }

    // Create new price item
    const newPriceItem: PriceItem = {
      priceItemId: `new-${Date.now()}`,
      priceHeaderId: allPricingData.priceHeaders[0]?.priceHeaderId || "",
      productName: editingRowData.productName,
      region: "North", // Default region
      unitPrice: parseFloat(editingRowData.unitPrice),
      minimumPrice: parseFloat(editingRowData.minimumPrice),
      effectiveDate: new Date().toISOString().split("T")[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "new",
      uom: editingRowData.uom,
      containerSize: editingRowData.containerSize,
      facilityName: editingRowData.facilityName,
      projectName: editingRowData.projectName,
      profileId: editingRowData.profileId,
      generatorId: editingRowData.generatorId,
      contractId: editingRowData.contractId,
    };

    // Add to existing data
    setAllPricingData((prev) => ({
      ...prev,
      priceItems: [newPriceItem, ...prev.priceItems], // Add new items at the top
    }));

    // Track the new row for highlighting
    setNewRows((prev) => new Set([...prev, newPriceItem.priceItemId]));

    // Reset and exit add mode
    setIsAddingNewEntry(false);
    setEditingNewRow(false);
    setNewEntryData({
      customerName: "",
      productName: "",
      profileId: "",
      generatorId: "",
      contractId: "",
      projectName: "",
      facilityName: "",
      containerSize: "",
      uom: "",
      unitPrice: "",
      minimumPrice: "",
    });
    setEditingRowData({
      customerName: "",
      productName: "",
      profileId: "",
      generatorId: "",
      contractId: "",
      projectName: "",
      facilityName: "",
      containerSize: "",
      uom: "",
      unitPrice: "",
      minimumPrice: "",
    });
    toast.success("New price entry added successfully");
  };

  const handleCancelNewEntry = () => {
    setIsAddingNewEntry(false);
    setEditingNewRow(false);
    setNewEntryData({
      customerName: "",
      productName: "",
      profileId: "",
      generatorId: "",
      contractId: "",
      projectName: "",
      facilityName: "",
      containerSize: "",
      uom: "",
      unitPrice: "",
      minimumPrice: "",
    });
    setEditingRowData({
      customerName: "",
      productName: "",
      profileId: "",
      generatorId: "",
      contractId: "",
      projectName: "",
      facilityName: "",
      containerSize: "",
      uom: "",
      unitPrice: "",
      minimumPrice: "",
    });
  };

  const handleEditNewRowData = (field: string, value: string) => {
    setEditingRowData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Also update the newEntryData to keep them in sync
    setNewEntryData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyChanges = () => {
    if ((selectedRows as any[]).length === 0) {
      toast.error("Please select at least one row to apply changes");
      return;
    }
    setApplyChangesDialogOpen(true);
  };

  const handleApplyChangesSubmit = () => {
    // Get selected row IDs
    const selectedIds = getSelectedRowIds();

    // Update selected price items
    setAllPricingData((prev) => ({
      ...prev,
      priceItems: prev.priceItems.map((item) => {
        if (selectedIds.includes(item.priceItemId)) {
          const updatedItem = {
            ...item,
            ...(bulkEditForm.containerSize && {
              containerSize: bulkEditForm.containerSize,
            }),
            ...(bulkEditForm.uom && { uom: bulkEditForm.uom }),
            ...(bulkEditForm.unitPrice && {
              unitPrice: parseFloat(bulkEditForm.unitPrice),
            }),
            ...(bulkEditForm.minimumPrice && {
              minimumPrice: parseFloat(bulkEditForm.minimumPrice),
            }),
          };

          // Track modified rows for highlighting
          setModifiedRows((prev) => new Set([...prev, item.priceItemId]));

          return updatedItem;
        }
        return item;
      }),
    }));

    // Reset form and close dialog
    setBulkEditForm({
      containerSize: "",
      uom: "",
      unitPrice: "",
      minimumPrice: "",
    });
    setApplyChangesDialogOpen(false);
    setSelectedRows([] as any);
    toast.success(`Updated ${selectedIds.length} price item(s) successfully`);
  };

  const handleApplyChangesCancel = () => {
    setBulkEditForm({
      containerSize: "",
      uom: "",
      unitPrice: "",
      minimumPrice: "",
    });
    setApplyChangesDialogOpen(false);
  };

  // Sample price change requests data (using same data as change-requests route)
  const priceChangeRequests = [
    {
      id: "PCR-2024-001",
      title: "Annual Rate Increase for Acme Corporation",
      description:
        "Implement 5% annual rate increase across all services for Acme Corporation effective March 1, 2024. This increase aligns with our annual pricing review and market conditions.",
      status: "New",
      requestedBy: "John Smith",
      requestedDate: "2024-01-15",
      requestType: "Customer",
      customerName: "Acme Corporation",
      assignedTo: "Sarah Johnson",
    },
    {
      id: "PCR-2024-002",
      title: "Utah State Contract Pricing Update",
      description:
        "Update pricing structure for all Utah state contracts to reflect new regulatory requirements and competitive market positioning.",
      status: "In Progress",
      requestedBy: "Mike Wilson",
      requestedDate: "2024-01-20",
      requestType: "Multiple Customers",
      assignedTo: "David Brown",
    },
    {
      id: "PCR-2024-003",
      title: "Global Fuel Surcharge Adjustment",
      description:
        "Implement new fuel surcharge calculation methodology across all customers to better reflect current fuel costs and market volatility.",
      status: "Activated",
      requestedBy: "Lisa Davis",
      requestedDate: "2024-01-25",
      requestType: "General/Global",
      assignedTo: "Michael Chen",
    },
    {
      id: "PCR-2024-004",
      title: "Tech Solutions Inc - New Service Pricing",
      description:
        "Create pricing for new hazardous waste disposal service for Tech Solutions Inc. This is a new service offering that requires custom pricing structure.",
      status: "Declined",
      requestedBy: "Robert Taylor",
      requestedDate: "2024-01-30",
      requestType: "Customer",
      customerName: "Tech Solutions Inc",
      assignedTo: "Sarah Johnson",
    },
    {
      id: "PCR-2024-005",
      title: "Environmental Services LLC - Volume Discount",
      description:
        "Implement tiered volume discount structure for Environmental Services LLC based on their increased waste volume projections.",
      status: "Withdrawn",
      requestedBy: "Jennifer Adams",
      requestedDate: "2024-02-01",
      requestType: "Customer",
      customerName: "Environmental Services LLC",
      assignedTo: "Emily Rodriguez",
    },
    {
      id: "PCR-2024-006",
      title: "Industry-Wide Compliance Fee Update",
      description:
        "Update compliance fees across all customers to reflect new EPA regulations and increased compliance costs.",
      status: "New",
      requestedBy: "Tom Wilson",
      requestedDate: "2024-02-05",
      requestType: "General/Global",
      assignedTo: "Alex Thompson",
    },
    {
      id: "PCR-2024-007",
      title: "Waste Management Corp - Emergency Service Pricing",
      description:
        "Establish emergency response service pricing for Waste Management Corp for after-hours and weekend emergency cleanups.",
      status: "In Progress",
      requestedBy: "Maria Garcia",
      requestedDate: "2024-02-10",
      requestType: "Customer",
      customerName: "Waste Management Corp",
      assignedTo: "David Brown",
    },
    {
      id: "PCR-2024-008",
      title: "Clean Energy Solutions - Renewable Energy Credit Pricing",
      description:
        "Develop pricing structure for renewable energy credit trading services for Clean Energy Solutions.",
      status: "Activated",
      requestedBy: "Alex Thompson",
      requestedDate: "2024-02-12",
      requestType: "Customer",
      customerName: "Clean Energy Solutions",
      assignedTo: "Michael Chen",
    },
  ];

  // Filter price change requests based on search term and assigned to
  const filteredPriceChangeRequests = useMemo(() => {
    return priceChangeRequests.filter((request) => {
      const searchTerm = priceChangeRequestFilter.toLowerCase();
      const assignedToTerm = assignedToFilter.toLowerCase();

      const matchesSearch =
        !priceChangeRequestFilter.trim() ||
        request.title.toLowerCase().includes(searchTerm) ||
        request.description.toLowerCase().includes(searchTerm) ||
        (request.customerName &&
          request.customerName.toLowerCase().includes(searchTerm));

      const matchesAssignedTo =
        !assignedToFilter.trim() ||
        (request.assignedTo &&
          request.assignedTo.toLowerCase().includes(assignedToTerm));

      return matchesSearch && matchesAssignedTo;
    });
  }, [priceChangeRequests, priceChangeRequestFilter, assignedToFilter]);

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    // Selection column - only show in edit mode
    ...(isEditMode
      ? [
          {
            field: "selection",
            headerName: "",
            width: 50,
            flex: 0,
            sortable: false,
            filterable: false,
            renderHeader: () => (
              <Checkbox
                checked={selectedRows.length === rows.length && rows.length > 0}
                indeterminate={
                  selectedRows.length > 0 && selectedRows.length < rows.length
                }
                onChange={(event) => {
                  if (event.target.checked) {
                    setSelectedRows(rows.map((row) => row.id));
                  } else {
                    setSelectedRows([]);
                  }
                }}
                sx={{
                  color: "#65b230",
                  "&.Mui-checked": {
                    color: "#65b230",
                  },
                  "&.MuiCheckbox-indeterminate": {
                    color: "#65b230",
                  },
                }}
              />
            ),
            renderCell: (params: any) => {
              // Don't show checkbox for the new entry row
              if (params.row.isNewEntry) {
                return null;
              }
              return (
                <Checkbox
                  checked={selectedRows.includes(params.row.id)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setSelectedRows((prev: string[]) => [
                        ...prev,
                        params.row.id,
                      ]);
                    } else {
                      setSelectedRows((prev: string[]) =>
                        prev.filter((id: string) => id !== params.row.id)
                      );
                    }
                  }}
                  sx={{
                    color: "#65b230",
                    "&.Mui-checked": {
                      color: "#65b230",
                    },
                  }}
                />
              );
            },
          },
        ]
      : []),
    {
      field: "customerName",
      headerName: "Customer",
      width: 200,
      flex: 1,
      minWidth: 150,
      editable: true,
      renderCell: (params) => {
        if (params.row.isNewEntry && editingNewRow) {
          return (
            <input
              type="text"
              value={editingRowData.customerName}
              onChange={(e) =>
                handleEditNewRowData("customerName", e.target.value)
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Enter customer name"
            />
          );
        }
        return params.value || "";
      },
    },
    {
      field: "productName",
      headerName: "Product",
      width: 100,
      flex: 0,
      minWidth: 80,
      editable: true,
      renderCell: (params) => {
        if (params.row.isNewEntry && editingNewRow) {
          return (
            <input
              type="text"
              value={editingRowData.productName}
              onChange={(e) =>
                handleEditNewRowData("productName", e.target.value)
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Enter product name"
            />
          );
        }
        return params.value || "";
      },
    },
    {
      field: "profileId",
      headerName: "Profile",
      width: 120,
      flex: 0.5,
      minWidth: 100,
      editable: true,
      renderCell: (params) => {
        if (params.row.isNewEntry && editingNewRow) {
          return (
            <input
              type="text"
              value={editingRowData.profileId}
              onChange={(e) =>
                handleEditNewRowData("profileId", e.target.value)
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Enter profile ID"
            />
          );
        }
        return params.value || "";
      },
    },
    {
      field: "generatorId",
      headerName: "Generator",
      width: 120,
      flex: 0.5,
      minWidth: 100,
      editable: true,
      renderCell: (params) => {
        if (params.row.isNewEntry && editingNewRow) {
          return (
            <input
              type="text"
              value={editingRowData.generatorId}
              onChange={(e) =>
                handleEditNewRowData("generatorId", e.target.value)
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Enter generator ID"
            />
          );
        }
        return params.value || "";
      },
    },

    {
      field: "projectName",
      headerName: "Project",
      width: 150,
      flex: 1,
      minWidth: 120,
      editable: true,
      renderCell: (params) => {
        if (params.row.isNewEntry && editingNewRow) {
          return (
            <input
              type="text"
              value={editingRowData.projectName}
              onChange={(e) =>
                handleEditNewRowData("projectName", e.target.value)
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Enter project name"
            />
          );
        }
        return params.value || "";
      },
    },
    {
      field: "facilityName",
      headerName: "Facility",
      width: 150,
      flex: 1,
      minWidth: 120,
      editable: true,
      renderCell: (params) => {
        if (params.row.isNewEntry && editingNewRow) {
          return (
            <input
              type="text"
              value={editingRowData.facilityName}
              onChange={(e) =>
                handleEditNewRowData("facilityName", e.target.value)
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Enter facility name"
            />
          );
        }
        return params.value || "";
      },
    },
    {
      field: "containerSize",
      headerName: "Container Size",
      width: 130,
      flex: 0.8,
      minWidth: 110,
      editable: true,
      renderCell: (params) => {
        if (params.row.isNewEntry && editingNewRow) {
          return (
            <input
              type="text"
              value={editingRowData.containerSize}
              onChange={(e) =>
                handleEditNewRowData("containerSize", e.target.value)
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Enter container size"
            />
          );
        }
        return params.value || "";
      },
    },
    {
      field: "unitPrice",
      headerName: "Price",
      width: 120,
      flex: 0,
      minWidth: 100,
      type: "number",
      editable: true,
      renderCell: (params) => {
        if (params.row.isNewEntry && editingNewRow) {
          return (
            <input
              type="number"
              step="0.01"
              value={editingRowData.unitPrice}
              onChange={(e) =>
                handleEditNewRowData("unitPrice", e.target.value)
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="0.00"
            />
          );
        }
        return params.value ? formatCurrency(params.value) : "";
      },
    },
    {
      field: "uom",
      headerName: "UOM",
      width: 100,
      flex: 0,
      minWidth: 80,
      editable: true,
      renderCell: (params) => {
        if (params.row.isNewEntry && editingNewRow) {
          return (
            <select
              value={editingRowData.uom}
              onChange={(e) => handleEditNewRowData("uom", e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Select UOM</option>
              <option value="Each">Each</option>
              <option value="Gallon">Gallon</option>
              <option value="Pound">Pound</option>
              <option value="Container">Container</option>
              <option value="Ton">Ton</option>
            </select>
          );
        }
        return params.value || "";
      },
    },
    {
      field: "minimumPrice",
      headerName: "Minimum",
      width: 120,
      flex: 0,
      minWidth: 100,
      type: "number",
      editable: true,
      renderCell: (params) => {
        if (params.row.isNewEntry && editingNewRow) {
          return (
            <input
              type="number"
              step="0.01"
              value={editingRowData.minimumPrice}
              onChange={(e) =>
                handleEditNewRowData("minimumPrice", e.target.value)
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="0.00"
            />
          );
        }
        return params.value ? formatCurrency(params.value) : "";
      },
    },
  ];

  const clearFilters = () => {
    setFilters({
      customer: "all",
      customerName: "",
      contractNumber: "",
      profileId: "",
      itemNumber: "",
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
    const statusConfig = {
      active: {
        label: "Active",
        className: "bg-[rgba(76,175,80,0.1)] text-[#2e7d32]",
      },
      "in-progress": {
        label: "In Progress",
        className: "bg-[rgba(255,152,0,0.1)] text-[#f57c00]",
      },
      new: {
        label: "New",
        className: "bg-[rgba(25,118,210,0.1)] text-[#1976d2]",
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

  const formatCurrency = (amount: number) => {
    // Handle undefined, null, or NaN values
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "$0.00";
    }

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

  const handleExportToExcel = () => {
    const exportData = filteredPriceItems.map((item) => {
      const header = allPricingData.priceHeaders.find(
        (h) => h.priceHeaderId === item.priceHeaderId
      );
      const customer = allPricingData.customers.find(
        (c) => c.customerId === header?.customerId
      );

      return {
        Customer: customer?.customerName || "",
        Quote: header?.headerName || "",
        Product: item.productName,
        Profile: item.profileId || "",
        Generator: item.generatorId || "",
        "Gov. Contract": item.contractId || "",
        Project: item.projectName || "",
        "Generator State": item.region || "",
        Facility: item.facilityName || "",
        "Container Size": item.containerSize || "",
        UOM: item.uom || "",
        Price: item.unitPrice,
        Minimum: item.minimumPrice,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pricing Data");
    XLSX.writeFile(
      wb,
      `all-customer-pricing-${new Date().toISOString().split("T")[0]}.xlsx`
    );

    toast.success("Pricing data exported successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#65b230] mx-auto mb-4"></div>
          <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]">
            Loading all customer pricing information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
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
                All Customer Pricing
              </h1>

              <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]">
                View and filter pricing entries across all customers, contracts,
                profiles, and item numbers
              </p>
            </div>
            <div className="flex space-x-2">
              <MuiButton
                variant="outlined"
                size="small"
                onClick={() => {
                  const newData = saveSampleDataToLocalStorage();
                  setAllPricingData({
                    customers: newData.customers,
                    priceHeaders: newData.priceHeaders,
                    priceItems: newData.priceItems,
                  });
                  toast.success("Sample data regenerated successfully");
                }}
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
                <RefreshCw className="h-4 w-4" />
                <span>Regenerate Data</span>
              </MuiButton>
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
        </div>

        <div className="bg-white border border-[#b9b9b9] rounded shadow-sm">
          <div className="p-6 border-b border-[#b9b9b9]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[22px] leading-[28px] text-[#1c1b1f]">
                  Pricing Items
                </span>
                <span className="inline-flex items-center bg-[rgba(158,158,158,0.1)] text-[#49454f] rounded-full px-3 py-1 text-xs font-medium border border-[#b9b9b9]">
                  {filteredPriceItems.length} items
                </span>
                {isEditMode && (
                  <Chip
                    label="EDIT MODE"
                    color="success"
                    size="small"
                    sx={{
                      backgroundColor: "#65b230",
                      color: "white",
                      fontWeight: 600,
                      "& .MuiChip-label": {
                        fontSize: "12px",
                      },
                    }}
                  />
                )}
              </div>
              <div className="flex items-center space-x-2">
                {isEditMode && (
                  <>
                    <MuiButton
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setIsEditMode(false);
                        setSelectedRows([] as any);
                        setNewRows(new Set());
                        setModifiedRows(new Set());
                        setCurrentPriceChangeConfig(null); // Clear the price change configuration
                        toast.info("Exited edit mode");
                      }}
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
                      <X className="h-4 w-4" />
                      <span>Exit Edit Mode</span>
                    </MuiButton>
                    <MuiButton
                      variant="contained"
                      size="small"
                      disabled={
                        (!newRows || newRows.size === 0) &&
                        (!modifiedRows || modifiedRows.size === 0)
                      }
                      onClick={() => {
                        // TODO: Implement price change submission logic
                        const totalChanges =
                          (newRows ? newRows.size : 0) +
                          (modifiedRows ? modifiedRows.size : 0);
                        toast.success(
                          `Submitting price change with ${totalChanges} modified entries`
                        );
                        // Here you would typically submit the changes to your backend
                        // For now, we'll just exit edit mode
                        setIsEditMode(false);
                        setSelectedRows([] as any);
                        setNewRows(new Set());
                        setModifiedRows(new Set());
                        setCurrentPriceChangeConfig(null);
                      }}
                      sx={{
                        backgroundColor:
                          (!newRows || newRows.size === 0) &&
                          (!modifiedRows || modifiedRows.size === 0)
                            ? "#b9b9b9"
                            : "#65b230",
                        borderRadius: "100px",
                        textTransform: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "&:hover": {
                          backgroundColor:
                            (!newRows || newRows.size === 0) &&
                            (!modifiedRows || modifiedRows.size === 0)
                              ? "#b9b9b9"
                              : "#4a8a1f",
                        },
                        "&:disabled": {
                          backgroundColor: "#b9b9b9",
                          color: "#666",
                        },
                      }}
                    >
                      <Check className="h-4 w-4" />
                      <span>
                        Submit Price Change (
                        {(newRows ? newRows.size : 0) +
                          (modifiedRows ? modifiedRows.size : 0)}
                        )
                      </span>
                    </MuiButton>
                  </>
                )}
                {!isEditMode && (
                  <MuiButton
                    variant="contained"
                    size="small"
                    onClick={handleNewPriceChange}
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
                    <span>New Price Change</span>
                  </MuiButton>
                )}
              </div>
            </div>

            {/* Primary Filters */}
            <div className="p-6">
              <div className="flex flex-wrap gap-4 items-end mb-4 mt-4">
                {/* Customer Filter */}
                <div>
                  <FormControl size="small" sx={{ width: "200px" }}>
                    <InputLabel>Customer</InputLabel>
                    <Select
                      value={filters.customer}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, customer: e.target.value }))
                      }
                      label="Customer"
                    >
                      <MenuItem value="all">All Customers</MenuItem>
                      {allPricingData.customers.map((customer) => (
                        <MenuItem
                          key={customer.customerId}
                          value={customer.customerId}
                        >
                          {customer.customerName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Customer Name Search */}
                <div>
                  <TextField
                    label="Customer Name"
                    placeholder="Search customer name..."
                    value={filters.customerName}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        customerName: e.target.value,
                      }))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ width: "200px" }}
                  />
                </div>

                {/* Contract Number Filter */}
                <div>
                  <TextField
                    label="Contract Number"
                    placeholder="Contract number..."
                    value={filters.contractNumber}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        contractNumber: e.target.value,
                      }))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ width: "180px" }}
                  />
                </div>

                {/* Profile ID Filter */}
                <div>
                  <TextField
                    label="Profile ID"
                    placeholder="Profile ID..."
                    value={filters.profileId}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, profileId: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ width: "150px" }}
                  />
                </div>

                {/* Item Number Filter */}
                <div>
                  <TextField
                    label="Item Number"
                    placeholder="Item number..."
                    value={filters.itemNumber}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, itemNumber: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ width: "150px" }}
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <FormControl size="small" sx={{ width: "140px" }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, status: e.target.value }))
                      }
                      label="Status"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="new">New</MenuItem>
                    </Select>
                  </FormControl>
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
                                  key === "region" ||
                                  key === "customer"
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
              {/* Edit Mode Actions - Moved above the grid */}
              {isEditMode && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  {/* Price Change Configuration Summary */}
                  {currentPriceChangeConfig && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#1976d2",
                          fontWeight: 600,
                          fontSize: "14px",
                          mb: 2,
                        }}
                      >
                        Active Price Change Configuration
                      </Typography>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Typography
                            variant="caption"
                            sx={{ color: "#666", display: "block" }}
                          >
                            Template Type
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#1c1b1f", fontWeight: 500 }}
                          >
                            {currentPriceChangeConfig.templateType ===
                            "standard"
                              ? "Standard Template"
                              : "Custom Template"}
                          </Typography>
                        </div>

                        <div>
                          <Typography
                            variant="caption"
                            sx={{ color: "#666", display: "block" }}
                          >
                            Change Requests
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#1c1b1f", fontWeight: 500 }}
                          >
                            {currentPriceChangeConfig.selectedRequests.length}{" "}
                            selected
                          </Typography>
                        </div>
                      </div>
                      {currentPriceChangeConfig.templateType === "custom" &&
                        currentPriceChangeConfig.customHeaderFields && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <Typography
                              variant="caption"
                              sx={{ color: "#666", display: "block", mb: 1 }}
                            >
                              Custom Header Settings
                            </Typography>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-gray-600">EEI:</span>{" "}
                                <span className="font-medium">
                                  {
                                    currentPriceChangeConfig.customHeaderFields
                                      .eei
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Fuel Surcharge:
                                </span>{" "}
                                <span className="font-medium">
                                  {
                                    currentPriceChangeConfig.customHeaderFields
                                      .fuelSurcharge
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Invoice Minimum:
                                </span>{" "}
                                <span className="font-medium">
                                  $
                                  {
                                    currentPriceChangeConfig.customHeaderFields
                                      .invoiceMinimum
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Container Conversion:
                                </span>{" "}
                                <span className="font-medium">
                                  {
                                    currentPriceChangeConfig.customHeaderFields
                                      .containerConversion
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Item Minimums:
                                </span>{" "}
                                <span className="font-medium">
                                  {
                                    currentPriceChangeConfig.customHeaderFields
                                      .itemMinimums
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Economic Adjustment:
                                </span>{" "}
                                <span className="font-medium">
                                  {
                                    currentPriceChangeConfig.customHeaderFields
                                      .economicAdjustmentFee
                                  }
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#1c1b1f",
                        fontWeight: 600,
                        fontSize: "16px",
                      }}
                    >
                      Edit Mode Actions
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#49454f",
                        fontSize: "14px",
                      }}
                    >
                      {editingNewRow
                        ? "Fill in the new row details below and click Save to add the entry"
                        : "Select rows to apply changes or add new entries"}
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MuiButton
                      variant="contained"
                      size="small"
                      onClick={handleAddNewEntry}
                      disabled={editingNewRow}
                      sx={{
                        backgroundColor: editingNewRow ? "#b9b9b9" : "#65b230",
                        borderRadius: "100px",
                        textTransform: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "&:hover": {
                          backgroundColor: editingNewRow
                            ? "#b9b9b9"
                            : "#4a8a1f",
                        },
                        "&:disabled": {
                          backgroundColor: "#b9b9b9",
                        },
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>
                        {editingNewRow
                          ? "Adding New Entry..."
                          : "Add New Price Entry"}
                      </span>
                    </MuiButton>
                    <MuiButton
                      variant="outlined"
                      size="small"
                      onClick={handleApplyChanges}
                      disabled={getSelectedRowIds().length === 0}
                      sx={{
                        borderRadius: "100px",
                        textTransform: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderColor:
                          getSelectedRowIds().length === 0
                            ? "#b9b9b9"
                            : "#65b230",
                        color:
                          getSelectedRowIds().length === 0
                            ? "#b9b9b9"
                            : "#65b230",
                        "&:hover": {
                          backgroundColor:
                            getSelectedRowIds().length === 0
                              ? "transparent"
                              : "rgba(101, 178, 48, 0.08)",
                        },
                        "&:disabled": {
                          borderColor: "#b9b9b9",
                          color: "#b9b9b9",
                        },
                      }}
                    >
                      <PenSquare className="h-4 w-4" />
                      <span>
                        Edit Selected Rows ({getSelectedRowIds().length})
                      </span>
                    </MuiButton>
                  </div>
                </div>
              )}

              <div style={{ width: "100%" }}>
                {isLoading ||
                !rows ||
                !columns ||
                !Array.isArray(rows) ||
                !(newRows instanceof Set) ||
                !(modifiedRows instanceof Set) ||
                !selectedRows ||
                !allPricingData ||
                !allPricingData.customers ||
                !allPricingData.priceHeaders ||
                !allPricingData.priceItems ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "200px",
                      fontSize: "16px",
                      color: "#666",
                    }}
                  >
                    Loading pricing data...
                  </div>
                ) : (
                  <div style={{ width: "100%" }}>
                    <DataGrid
                      rows={rows || []}
                      columns={columns || []}
                      getRowId={(row) => row.id}
                      autoHeight={true}
                      density="standard"
                      editMode="cell"
                      isCellEditable={(params: any) => {
                        // Only allow editing for the new entry row when in editing mode
                        return params.row.isNewEntry && editingNewRow;
                      }}
                      getRowClassName={(params) => {
                        // Add special styling for the new entry row
                        return params.row.isNewEntry && editingNewRow
                          ? "new-entry-row"
                          : "";
                      }}
                      sx={{
                        "& .new-entry-row": {
                          backgroundColor: "#f0f9ff",
                          border: "2px solid #3b82f6",
                        },
                        "& .MuiDataGrid-cell": {
                          fontSize: "0.875rem",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
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
                      }}
                      disableRowSelectionOnClick={true}
                      disableColumnMenu={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Dialog */}
        <Dialog
          open={advancedFiltersOpen}
          onClose={() => setAdvancedFiltersOpen(false)}
          maxWidth="md"
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
            <div className="grid grid-cols-2 gap-4">
              {/* Product Filter */}
              <TextField
                label="Product Name"
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

              {/* Region Filter */}
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={filters.region}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, region: e.target.value }))
                  }
                  label="Region"
                >
                  <MenuItem value="all">All Regions</MenuItem>
                  <MenuItem value="North">North</MenuItem>
                  <MenuItem value="South">South</MenuItem>
                  <MenuItem value="East">East</MenuItem>
                  <MenuItem value="West">West</MenuItem>
                  <MenuItem value="Central">Central</MenuItem>
                </Select>
              </FormControl>

              {/* Quote Name Filter */}
              <TextField
                label="Quote Name"
                placeholder="Quote name..."
                value={filters.quoteName}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, quoteName: e.target.value }))
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Project Name Filter */}
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

              {/* Generator Filter */}
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

              {/* Container Size Filter */}
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

              {/* UOM Filter */}
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Unit of Measure</InputLabel>
                <Select
                  value={filters.uom}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, uom: e.target.value }))
                  }
                  label="Unit of Measure"
                >
                  <MenuItem value="all">All UOM</MenuItem>
                  <MenuItem value="Each">Each</MenuItem>
                  <MenuItem value="Gallon">Gallon</MenuItem>
                  <MenuItem value="Pound">Pound</MenuItem>
                  <MenuItem value="Container">Container</MenuItem>
                  <MenuItem value="Ton">Ton</MenuItem>
                </Select>
              </FormControl>

              {/* Pricing Tier Filter */}
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

              {/* Date Range */}
              <div className="col-span-2">
                <div className="flex gap-4">
                  <TextField
                    label="Effective Date From"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, dateFrom: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Effective Date To"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, dateTo: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="col-span-2">
                <div className="flex gap-4">
                  <TextField
                    label="Min Price"
                    type="number"
                    placeholder="0.00"
                    value={filters.priceRange?.min || ""}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        priceRange: {
                          ...f.priceRange,
                          min: e.target.value,
                        },
                      }))
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Max Price"
                    type="number"
                    placeholder="999999.99"
                    value={filters.priceRange?.max || ""}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        priceRange: {
                          ...f.priceRange,
                          max: e.target.value,
                        },
                      }))
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </div>
              </div>
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

        {/* Price Change Request Selection Dialog */}
        <Dialog
          open={priceChangeDialogOpen}
          onClose={handleCancelPriceChange}
          maxWidth="md"
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
            Select Price Change Request
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]">
                Choose price change request(s) to associate with your new price
                change action:
              </p>
              <div className="flex gap-2"></div>
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-4 space-y-3">
              <TextField
                label="Search requests"
                placeholder="Search by title, description, or customer name..."
                value={priceChangeRequestFilter}
                onChange={(e) => setPriceChangeRequestFilter(e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={assignedToFilter}
                  onChange={(e) => setAssignedToFilter(e.target.value)}
                  label="Assigned To"
                  sx={{
                    borderRadius: "8px",
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="John Smith">John Smith</MenuItem>
                  <MenuItem value="Sarah Johnson">Sarah Johnson</MenuItem>
                  <MenuItem value="Mike Davis">Mike Davis</MenuItem>
                  <MenuItem value="Lisa Chen">Lisa Chen</MenuItem>
                  <MenuItem value="David Wilson">David Wilson</MenuItem>
                  <MenuItem value="Emily Brown">Emily Brown</MenuItem>
                  <MenuItem value="Robert Taylor">Robert Taylor</MenuItem>
                  <MenuItem value="Jennifer Lee">Jennifer Lee</MenuItem>
                  <MenuItem value="Michael Garcia">Michael Garcia</MenuItem>
                  <MenuItem value="Amanda Martinez">Amanda Martinez</MenuItem>
                </Select>
              </FormControl>
            </div>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {filteredPriceChangeRequests.map((request) => (
                <Card
                  key={request.id}
                  sx={{
                    cursor: "pointer",
                    border: selectedPriceChangeRequests.includes(request.id)
                      ? "2px solid #65b230"
                      : "1px solid #b9b9b9",
                    backgroundColor: selectedPriceChangeRequests.includes(
                      request.id
                    )
                      ? "rgba(101,178,48,0.08)"
                      : "transparent",
                    "&:hover": {
                      borderColor: "#65b230",
                      backgroundColor: "rgba(101,178,48,0.04)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => handlePriceChangeRequestSelect(request.id)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: "16px",
                              fontWeight: 500,
                              color: "#1c1b1f",
                              lineHeight: "24px",
                            }}
                          >
                            {request.title}
                          </Typography>

                          <Chip
                            label={request.status}
                            size="small"
                            sx={{
                              backgroundColor:
                                request.status === "New"
                                  ? "rgba(33,150,243,0.1)"
                                  : request.status === "In Progress"
                                  ? "rgba(255,152,0,0.1)"
                                  : request.status === "Activated"
                                  ? "rgba(76,175,80,0.1)"
                                  : request.status === "Declined"
                                  ? "rgba(244,67,54,0.1)"
                                  : request.status === "Withdrawn"
                                  ? "rgba(158,158,158,0.1)"
                                  : "rgba(158,158,158,0.1)",
                              color:
                                request.status === "New"
                                  ? "#1976d2"
                                  : request.status === "In Progress"
                                  ? "#f57c00"
                                  : request.status === "Activated"
                                  ? "#2e7d32"
                                  : request.status === "Declined"
                                  ? "#d32f2f"
                                  : request.status === "Withdrawn"
                                  ? "#616161"
                                  : "#616161",
                              fontSize: "12px",
                              height: "20px",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "14px",
                            lineHeight: "20px",
                            color: "#49454f",
                            mb: 1,
                          }}
                        >
                          {request.description}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Requested by: {request.requestedBy}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Date: {formatDate(request.requestedDate)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Assigned to: {request.assignedTo}
                          </Typography>
                          {request.customerName && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              Customer: {request.customerName}
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Type: {request.requestType}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ ml: 2 }}>
                        <Checkbox
                          checked={selectedPriceChangeRequests.includes(
                            request.id
                          )}
                          sx={{
                            color: "#b9b9b9",
                            "&.Mui-checked": {
                              color: "#65b230",
                            },
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() =>
                            handlePriceChangeRequestSelect(request.id)
                          }
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <MuiButton
              variant="outlined"
              onClick={handleCancelPriceChange}
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
              onClick={handleCreatePriceChange}
              disabled={selectedPriceChangeRequests.length === 0}
              sx={{
                backgroundColor: "#65b230",
                borderRadius: "100px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#4a8a1f",
                },
                "&:disabled": {
                  backgroundColor: "#e0e0e0",
                  color: "#9e9e9e",
                },
              }}
            >
              Create Price Change
            </MuiButton>
          </DialogActions>
        </Dialog>

        {/* Price Change Configuration Dialog */}
        <Dialog
          open={priceChangeConfigDialogOpen}
          onClose={handleCancelPriceChangeConfig}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              fontFamily: "Roboto:Medium, sans-serif",
              fontWeight: 500,
              fontSize: "22px",
              lineHeight: "28px",
              color: "#1c1b1f",
              pb: 1,
            }}
          >
            Configure Price Change
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {/* Selected Requests Summary */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "#f8f9fa",
                borderRadius: 2,
                border: "1px solid #e9ecef",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: "#495057", fontWeight: 600 }}
              >
                Selected Price Change Requests (
                {selectedPriceChangeRequests.length})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedPriceChangeRequests.map((requestId) => {
                  const request = priceChangeRequests.find(
                    (r) => r.id === requestId
                  );
                  return request ? (
                    <Chip
                      key={requestId}
                      label={request.title}
                      size="small"
                      sx={{
                        backgroundColor: "#65b230",
                        color: "white",
                        fontSize: "12px",
                      }}
                    />
                  ) : null;
                })}
              </Box>
            </Box>

            {/* Template Type Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1c1b1f", fontWeight: 600 }}
              >
                Price Header Template
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Card
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    border:
                      templateType === "standard"
                        ? "2px solid #65b230"
                        : "1px solid #e0e0e0",
                    backgroundColor:
                      templateType === "standard"
                        ? "rgba(101,178,48,0.08)"
                        : "transparent",
                    "&:hover": {
                      borderColor: "#65b230",
                      backgroundColor: "rgba(101,178,48,0.04)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => setTemplateType("standard")}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor:
                            templateType === "standard"
                              ? "rgba(101,178,48,0.2)"
                              : "rgba(101,178,48,0.05)",
                        }}
                      >
                        <Settings
                          size={20}
                          color={
                            templateType === "standard"
                              ? "#65b230"
                              : "rgba(101,178,48,0.7)"
                          }
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "#1c1b1f" }}
                        >
                          Standard Template
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#666", fontSize: "0.75rem" }}
                        >
                          Use predefined standard settings
                        </Typography>
                      </Box>
                      {templateType === "standard" && (
                        <Check size={16} color="#65b230" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
                <Card
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    border:
                      templateType === "custom"
                        ? "2px solid #65b230"
                        : "1px solid #e0e0e0",
                    backgroundColor:
                      templateType === "custom"
                        ? "rgba(101,178,48,0.08)"
                        : "transparent",
                    "&:hover": {
                      borderColor: "#65b230",
                      backgroundColor: "rgba(101,178,48,0.04)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => setTemplateType("custom")}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor:
                            templateType === "custom"
                              ? "rgba(101,178,48,0.2)"
                              : "rgba(101,178,48,0.05)",
                        }}
                      >
                        <PenSquare
                          size={20}
                          color={
                            templateType === "custom"
                              ? "#65b230"
                              : "rgba(101,178,48,0.7)"
                          }
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "#1c1b1f" }}
                        >
                          Custom Template
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#666", fontSize: "0.75rem" }}
                        >
                          Customize individual settings
                        </Typography>
                      </Box>
                      {templateType === "custom" && (
                        <Check size={16} color="#65b230" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Standard Template Summary */}
            {templateType === "standard" && (
              <Box sx={{ mb: 4 }}>
                <Card sx={{ bgcolor: "#f9f9f9", border: "1px solid #e0e0e0" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#1c1b1f" }}
                      >
                        Standard Template Settings
                      </Typography>
                      <MuiButton
                        variant="outlined"
                        size="small"
                        onClick={() => setTemplateType("custom")}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          textTransform: "none",
                          borderColor: "#65b230",
                          color: "#65b230",
                          "&:hover": {
                            borderColor: "#4a8a1f",
                            backgroundColor: "rgba(101,178,48,0.04)",
                          },
                        }}
                      >
                        <Settings size={16} />
                        <span>Edit Header</span>
                      </MuiButton>
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#666",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          EEI:
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                        >
                          15%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#666",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          Fuel Surcharge:
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                        >
                          Standard Monthly
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#666",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          Invoice Minimum:
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                        >
                          $350
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#666",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          E-Manifest Fee:
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                        >
                          $25
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#666",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          Economic Adjustment:
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                        >
                          3%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Custom Template Fields */}
            {templateType === "custom" && (
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1c1b1f" }}
                  >
                    Custom Header Settings
                  </Typography>
                  <MuiButton
                    variant="outlined"
                    size="small"
                    onClick={() => setTemplateType("standard")}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      textTransform: "none",
                      borderColor: "#65b230",
                      color: "#65b230",
                      "&:hover": {
                        borderColor: "#4a8a1f",
                        backgroundColor: "rgba(101,178,48,0.04)",
                      },
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>Reset to Standard</span>
                  </MuiButton>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 3,
                  }}
                >
                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel>EEI</InputLabel>
                    <Select
                      value={customHeaderFields.eei}
                      onChange={(e) =>
                        setCustomHeaderFields((prev) => ({
                          ...prev,
                          eei: e.target.value,
                        }))
                      }
                      label="EEI"
                    >
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="Custom">Custom</MenuItem>
                      <MenuItem value="Floating">Floating</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel>Fuel Surcharge (FSC)</InputLabel>
                    <Select
                      value={customHeaderFields.fuelSurcharge}
                      onChange={(e) =>
                        setCustomHeaderFields((prev) => ({
                          ...prev,
                          fuelSurcharge: e.target.value,
                        }))
                      }
                      label="Fuel Surcharge (FSC)"
                    >
                      <MenuItem value="Standard Monthly">
                        Standard Monthly
                      </MenuItem>
                      <MenuItem value="Standard Weekly">
                        Standard Weekly
                      </MenuItem>
                      <MenuItem value="Custom">Custom</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Invoice Minimum"
                    type="number"
                    value={customHeaderFields.invoiceMinimum}
                    onChange={(e) =>
                      setCustomHeaderFields((prev) => ({
                        ...prev,
                        invoiceMinimum: Number(e.target.value),
                      }))
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="350"
                  />

                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel>Container Conversion</InputLabel>
                    <Select
                      value={customHeaderFields.containerConversion}
                      onChange={(e) =>
                        setCustomHeaderFields((prev) => ({
                          ...prev,
                          containerConversion: e.target.value,
                        }))
                      }
                      label="Container Conversion"
                    >
                      <MenuItem value="Standard Conversion 1">
                        Standard Conversion 1
                      </MenuItem>
                      <MenuItem value="Standard Conversion 2">
                        Standard Conversion 2
                      </MenuItem>
                      <MenuItem value="Custom Conversion">
                        Custom Conversion
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel>Item Minimums</InputLabel>
                    <Select
                      value={customHeaderFields.itemMinimums}
                      onChange={(e) =>
                        setCustomHeaderFields((prev) => ({
                          ...prev,
                          itemMinimums: e.target.value,
                        }))
                      }
                      label="Item Minimums"
                    >
                      <MenuItem value="Standard Tables">
                        Standard Tables
                      </MenuItem>
                      <MenuItem value="Custom Tables">Custom Tables</MenuItem>
                      <MenuItem value="No Minimums">No Minimums</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Economic Adjustment Fee (EAF) %"
                    type="number"
                    value={customHeaderFields.economicAdjustmentFee}
                    onChange={(e) =>
                      setCustomHeaderFields((prev) => ({
                        ...prev,
                        economicAdjustmentFee: Number(e.target.value),
                      }))
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="3"
                  />

                  <TextField
                    label="E-Manifest Fee"
                    type="number"
                    value={customHeaderFields.eManifestFee}
                    onChange={(e) =>
                      setCustomHeaderFields((prev) => ({
                        ...prev,
                        eManifestFee: Number(e.target.value),
                      }))
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="25"
                  />

                  <Box sx={{ gridColumn: "span 2" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 2, color: "#666" }}
                    >
                      Additional Options
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={customHeaderFields.hubFee}
                            onChange={(e) =>
                              setCustomHeaderFields((prev) => ({
                                ...prev,
                                hubFee: e.target.checked,
                              }))
                            }
                            sx={{ color: "#65b230" }}
                          />
                        }
                        label="Hub Fee"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={customHeaderFields.regionalPricing}
                            onChange={(e) =>
                              setCustomHeaderFields((prev) => ({
                                ...prev,
                                regionalPricing: e.target.checked,
                              }))
                            }
                            sx={{ color: "#65b230" }}
                          />
                        }
                        label="Regional Pricing"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={customHeaderFields.zoneTransportation}
                            onChange={(e) =>
                              setCustomHeaderFields((prev) => ({
                                ...prev,
                                zoneTransportation: e.target.checked,
                              }))
                            }
                            sx={{ color: "#65b230" }}
                          />
                        }
                        label="Zone Transportation"
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <MuiButton
              variant="outlined"
              onClick={handleBackToPriceChangeSelection}
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
              Back to Selection
            </MuiButton>
            <MuiButton
              variant="contained"
              onClick={handlePriceChangeConfigSubmit}
              sx={{
                backgroundColor: "#65b230",
                borderRadius: "100px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#4a8a1f",
                },
                "&:disabled": {
                  backgroundColor: "#e0e0e0",
                  color: "#9e9e9e",
                },
              }}
            >
              Create Price Changes
            </MuiButton>
          </DialogActions>
        </Dialog>

        {/* Apply Changes to Selected Dialog */}
        <Dialog
          open={applyChangesDialogOpen}
          onClose={handleApplyChangesCancel}
          maxWidth="md"
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
            Apply Changes to Selected ({getSelectedRowIds().length} row(s))
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ mb: 3, color: "#666" }}>
              Update the following fields for all selected rows. Leave fields
              empty to keep existing values.
            </Typography>
            <div className="grid grid-cols-2 gap-4">
              {/* Container Size */}
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Container Size</InputLabel>
                <Select
                  value={bulkEditForm.containerSize}
                  onChange={(e) =>
                    setBulkEditForm((prev) => ({
                      ...prev,
                      containerSize: e.target.value,
                    }))
                  }
                  label="Container Size"
                >
                  <MenuItem value="">Keep existing</MenuItem>
                  <MenuItem value="5G">5G</MenuItem>
                  <MenuItem value="15G">15G</MenuItem>
                  <MenuItem value="20G">20G</MenuItem>
                  <MenuItem value="30G">30G</MenuItem>
                  <MenuItem value="55G">55G</MenuItem>
                  <MenuItem value="Tri-Wall">Tri-Wall</MenuItem>
                  <MenuItem value="275G">275G</MenuItem>
                </Select>
              </FormControl>

              {/* UOM */}
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>UOM</InputLabel>
                <Select
                  value={bulkEditForm.uom}
                  onChange={(e) =>
                    setBulkEditForm((prev) => ({
                      ...prev,
                      uom: e.target.value,
                    }))
                  }
                  label="UOM"
                >
                  <MenuItem value="">Keep existing</MenuItem>
                  <MenuItem value="Each">Each</MenuItem>
                  <MenuItem value="Gallon">Gallon</MenuItem>
                  <MenuItem value="Pound">Pound</MenuItem>
                  <MenuItem value="Container">Container</MenuItem>
                  <MenuItem value="Ton">Ton</MenuItem>
                </Select>
              </FormControl>

              {/* Unit Price */}
              <TextField
                label="Unit Price"
                type="number"
                value={bulkEditForm.unitPrice}
                onChange={(e) =>
                  setBulkEditForm((prev) => ({
                    ...prev,
                    unitPrice: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Keep existing"
                inputProps={{ min: 0, step: 0.01 }}
              />

              {/* Minimum Price */}
              <TextField
                label="Minimum Price"
                type="number"
                value={bulkEditForm.minimumPrice}
                onChange={(e) =>
                  setBulkEditForm((prev) => ({
                    ...prev,
                    minimumPrice: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Keep existing"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <MuiButton
              variant="outlined"
              onClick={handleApplyChangesCancel}
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
              onClick={handleApplyChangesSubmit}
              sx={{
                backgroundColor: "#65b230",
                borderRadius: "100px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#4a8a1f",
                },
              }}
            >
              Apply Changes
            </MuiButton>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
