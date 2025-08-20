"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  IconButton,
  Button as MuiButton,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuList,
} from "@mui/material";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import {
  AlertCircle,
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
  ChevronDown,
  Trash2,
  Edit,
  Square,
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

// Container Conversion Component
const ContainerConversionContent = React.forwardRef<
  { handleSave: () => void },
  {
    onClose: () => void;
    initialConversions: Array<{
      id: string;
      fromSize: string;
      toSize: string;
      multiplier: string;
    }>;
    onSave: (
      conversions: Array<{
        id: string;
        fromSize: string;
        toSize: string;
        multiplier: string;
      }>
    ) => void;
  }
>(({ onClose, initialConversions, onSave }, ref) => {
  const [conversions, setConversions] = useState(initialConversions);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate container sizes from 1G to 350G
  const containerSizes = Array.from({ length: 350 }, (_, i) => `${i + 1}G`);

  const updateConversion = (id: string, field: "multiplier", value: string) => {
    setConversions(
      conversions.map((conv) =>
        conv.id === id ? { ...conv, [field]: value } : conv
      )
    );

    // Clear error when user starts typing
    if (errors[`${id}-${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${id}-${field}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    conversions.forEach((conv) => {
      if (!conv.multiplier) {
        newErrors[`${conv.id}-multiplier`] = "Multiplier is required";
      } else if (
        isNaN(Number(conv.multiplier)) ||
        Number(conv.multiplier) <= 0
      ) {
        newErrors[`${conv.id}-multiplier`] =
          "Multiplier must be a positive number";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose handleSave function to parent component
  React.useImperativeHandle(ref, () => ({
    handleSave: () => {
      if (validateForm()) {
        console.log("Saving conversions:", conversions);
        toast.success("Container conversions saved successfully!");
        // Save the conversions to parent component
        onSave(conversions);
        // Close the modal after successful save
        onClose();
      }
    },
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <Typography variant="body2" color="textSecondary">
          Configure multipliers for predefined container size ranges. Only the
          multiplier values can be edited.
        </Typography>
      </div>

      <div className="space-y-4">
        {conversions.map((conversion, index) => (
          <Card key={conversion.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <FormControl fullWidth size="small" className="mb-3">
                  <InputLabel>From Size</InputLabel>
                  <Select value={conversion.fromSize} disabled>
                    {containerSizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="flex-1">
                <FormControl fullWidth size="small" className="mb-3">
                  <InputLabel>To Size</InputLabel>
                  <Select value={conversion.toSize} disabled>
                    {containerSizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="flex-1">
                <TextField
                  label="Multiplier"
                  type="number"
                  value={conversion.multiplier}
                  onChange={(e) =>
                    updateConversion(
                      conversion.id,
                      "multiplier",
                      e.target.value
                    )
                  }
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  error={!!errors[`${conversion.id}-multiplier`]}
                  helperText={errors[`${conversion.id}-multiplier`]}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});

ContainerConversionContent.displayName = "ContainerConversionContent";

// Fuel Surcharge Component
const FuelSurchargeContent = React.forwardRef<
  { handleSave: () => void },
  {
    onClose: () => void;
    initialRules: Array<{
      id: string;
      lowPrice: string;
      highPrice: string;
      transportation: string;
    }>;
    onSave: (
      rules: Array<{
        id: string;
        lowPrice: string;
        highPrice: string;
        transportation: string;
      }>
    ) => void;
  }
>(({ onClose, initialRules, onSave }, ref) => {
  const [rules, setRules] = useState(initialRules);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addRule = () => {
    const newId = (rules.length + 1).toString();
    setRules([
      ...rules,
      { id: newId, lowPrice: "", highPrice: "", transportation: "" },
    ]);
  };

  const removeRule = (id: string) => {
    if (rules.length > 1) {
      setRules(rules.filter((rule) => rule.id !== id));
    }
  };

  const updateRule = (
    id: string,
    field: "lowPrice" | "highPrice" | "transportation",
    value: string
  ) => {
    setRules(
      rules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule))
    );

    // Clear error when user starts typing
    if (errors[`${id}-${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${id}-${field}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    rules.forEach((rule) => {
      if (!rule.lowPrice) {
        newErrors[`${rule.id}-lowPrice`] = "Low price is required";
      } else if (isNaN(Number(rule.lowPrice)) || Number(rule.lowPrice) < 0) {
        newErrors[`${rule.id}-lowPrice`] =
          "Low price must be a positive number";
      }

      if (!rule.highPrice) {
        newErrors[`${rule.id}-highPrice`] = "High price is required";
      } else if (isNaN(Number(rule.highPrice)) || Number(rule.highPrice) < 0) {
        newErrors[`${rule.id}-highPrice`] =
          "High price must be a positive number";
      }

      if (!rule.transportation) {
        newErrors[`${rule.id}-transportation`] =
          "Transportation percentage is required";
      } else if (
        isNaN(Number(rule.transportation)) ||
        Number(rule.transportation) < 0
      ) {
        newErrors[`${rule.id}-transportation`] =
          "Transportation must be a positive number";
      }

      // Validate price range logic
      if (rule.lowPrice && rule.highPrice) {
        const low = parseFloat(rule.lowPrice);
        const high = parseFloat(rule.highPrice);
        if (low >= high) {
          newErrors[`${rule.id}-highPrice`] =
            "High price must be greater than low price";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose handleSave function to parent component
  React.useImperativeHandle(ref, () => ({
    handleSave: () => {
      if (validateForm()) {
        console.log("Saving fuel surcharge rules:", rules);
        toast.success("Fuel surcharge rules saved successfully!");
        // Save the rules to parent component
        onSave(rules);
        // Close the modal after successful save
        onClose();
      }
    },
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <Typography variant="body2" color="textSecondary">
          Define fuel surcharge percentages based on price ranges. Each row
          represents a price range with an associated transportation surcharge
          percentage.
        </Typography>
      </div>

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <Card key={rule.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <TextField
                  label="Low Price"
                  type="number"
                  value={rule.lowPrice}
                  onChange={(e) =>
                    updateRule(rule.id, "lowPrice", e.target.value)
                  }
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, step: 0.001 }}
                  error={!!errors[`${rule.id}-lowPrice`]}
                  helperText={errors[`${rule.id}-lowPrice`]}
                  InputProps={{
                    startAdornment: (
                      <span className="text-gray-500 mr-2">$</span>
                    ),
                  }}
                />
              </div>

              <div className="flex-1">
                <TextField
                  label="High Price"
                  type="number"
                  value={rule.highPrice}
                  onChange={(e) =>
                    updateRule(rule.id, "highPrice", e.target.value)
                  }
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, step: 0.001 }}
                  error={!!errors[`${rule.id}-highPrice`]}
                  helperText={errors[`${rule.id}-highPrice`]}
                  InputProps={{
                    startAdornment: (
                      <span className="text-gray-500 mr-2">$</span>
                    ),
                  }}
                />
              </div>

              <div className="flex-1">
                <TextField
                  label="Transportation %"
                  type="number"
                  value={rule.transportation}
                  onChange={(e) =>
                    updateRule(rule.id, "transportation", e.target.value)
                  }
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, step: 0.1 }}
                  error={!!errors[`${rule.id}-transportation`]}
                  helperText={errors[`${rule.id}-transportation`]}
                  InputProps={{
                    endAdornment: <span className="text-gray-500 ml-2">%</span>,
                  }}
                />
              </div>

              <IconButton
                onClick={() => removeRule(rule.id)}
                disabled={rules.length === 1}
                color="error"
                size="small"
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <SecondaryButton
          onClick={addRule}
          startIcon={<Plus className="h-4 w-4" />}
          size="small"
        >
          Add Fuel Surcharge Range
        </SecondaryButton>
      </div>
    </div>
  );
});

FuelSurchargeContent.displayName = "FuelSurchargeContent";

interface FilterState {
  customer: string;
  customerName: string;
  contractNumber: string;
  profileId: string;
  productName: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  uom: string;
  projectName: string;
  generator?: string;
  facility?: string;
  containerSize?: string;
  createdBy?: string;
  salesRep?: string;
  priceRange?: {
    min?: string;
    max?: string;
  };
  showModifiedOnly?: boolean;
}

interface AllPricingData {
  customers: CustomerInfo[];
  priceHeaders: PriceHeader[];
  priceItems: PriceItem[];
}

export default function AllCustomerPricingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const customerId = params.customerId as string;

  // Check if user came from execute price change button
  const executeRequestId = searchParams.get("executeRequestId");
  const [allPricingData, setAllPricingData] = useState<AllPricingData>({
    customers: [],
    priceHeaders: [],
    priceItems: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerInfo | null>(
    null
  );
  const [filters, setFilters] = useState<FilterState>({
    customer: "all",
    customerName: "",
    contractNumber: "",
    profileId: "",
    productName: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
    uom: "all",
    projectName: "",
    containerSize: "all",
    showModifiedOnly: false,
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
  const [exitEditModeConfirmOpen, setExitEditModeConfirmOpen] = useState(false);
  const [submitPriceChangeConfirmOpen, setSubmitPriceChangeConfirmOpen] =
    useState(false);

  // State for bulk edit form
  const [bulkEditForm, setBulkEditForm] = useState({
    containerSize: "",
    uom: "",
    generatorState: "",
    unitPrice: "",
    unitPricePercentageIncrease: "",
    minimumPrice: "",
    minimumPricePercentageIncrease: "",
    effectiveDate: "",
    expirationDate: "",
  });

  // State for unit price edit mode
  const [unitPriceEditMode, setUnitPriceEditMode] = useState<
    "absolute" | "percentage"
  >("absolute");

  // State for minimum price edit mode
  const [minimumPriceEditMode, setMinimumPriceEditMode] = useState<
    "absolute" | "percentage"
  >("absolute");

  // State for tracking new and modified rows
  const [newRows, setNewRows] = useState<Set<string>>(new Set());
  const [modifiedRows, setModifiedRows] = useState<Set<string>>(new Set());
  const [modifiedColumns, setModifiedColumns] = useState<
    Map<string, Set<string>>
  >(new Map());

  // Ensure modified rows filter is reset when not in edit mode
  useEffect(() => {
    if (!isEditMode && filters.showModifiedOnly) {
      setFilters((prev) => ({ ...prev, showModifiedOnly: false }));
    }
  }, [isEditMode, filters.showModifiedOnly]);

  // Reset modified rows filter on component mount
  useEffect(() => {
    setFilters((prev) => ({ ...prev, showModifiedOnly: false }));
  }, []);

  // State for split button menu
  const [submitMenuOpen, setSubmitMenuOpen] = useState(false);
  const submitMenuAnchorRef = React.useRef<HTMLDivElement>(null);

  // State for delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteValidationErrorOpen, setDeleteValidationErrorOpen] =
    useState(false);
  const [validationErrorDetails, setValidationErrorDetails] = useState<{
    count: number;
    rows: string[];
  }>({ count: 0, rows: [] });

  // State for row editing
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [newRowId, setNewRowId] = useState<string | null>(null);
  const [newEntryData, setNewEntryData] = useState<Record<string, any>>({});
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [showEditEntryForm, setShowEditEntryForm] = useState(false);
  const [editingEntryData, setEditingEntryData] = useState<Record<string, any>>(
    {}
  );
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [showPriceHeaderModal, setShowPriceHeaderModal] = useState(false);
  const [priceHeaderData, setPriceHeaderData] = useState<Record<string, any>>(
    {}
  );
  const [selectedPriceHeaderId, setSelectedPriceHeaderId] = useState<
    string | null
  >(null);
  const [availablePriceHeaders, setAvailablePriceHeaders] = useState<
    Array<{
      id: string;
      name: string;
      type: "customer" | "project";
      projectName?: string;
    }>
  >([]);
  const [priceHeaderLoading, setPriceHeaderLoading] = useState(false);
  const [isCreatingNewHeader, setIsCreatingNewHeader] = useState(false);
  const [newHeaderName, setNewHeaderName] = useState("");
  const [containerConversionModalOpen, setContainerConversionModalOpen] =
    useState(false);
  const [customConversionRules, setCustomConversionRules] = useState<
    Array<{
      id: string;
      fromSize: string;
      toSize: string;
      multiplier: string;
    }>
  >([
    { id: "1", fromSize: "1G", toSize: "5G", multiplier: "0.35" },
    { id: "2", fromSize: "6G", toSize: "15G", multiplier: "0.5" },
    { id: "3", fromSize: "16G", toSize: "30G", multiplier: "0.75" },
    { id: "4", fromSize: "31G", toSize: "55G", multiplier: "1.00" },
    { id: "5", fromSize: "56G", toSize: "85G", multiplier: "1.5" },
    { id: "6", fromSize: "86G", toSize: "220G", multiplier: "4" },
    { id: "7", fromSize: "221G", toSize: "275G", multiplier: "5" },
    { id: "8", fromSize: "276G", toSize: "350G", multiplier: "6" },
  ]);

  // Fuel Surcharge Modal State
  const [fuelSurchargeModalOpen, setFuelSurchargeModalOpen] = useState(false);
  const [customFuelSurchargeRules, setCustomFuelSurchargeRules] = useState<
    Array<{
      id: string;
      lowPrice: string;
      highPrice: string;
      transportation: string;
    }>
  >([
    { id: "1", lowPrice: "0.00", highPrice: "1.159", transportation: "0" },
    { id: "2", lowPrice: "1.16", highPrice: "1.22", transportation: "1" },
    { id: "3", lowPrice: "1.23", highPrice: "1.29", transportation: "2" },
    { id: "4", lowPrice: "1.30", highPrice: "1.36", transportation: "3" },
    { id: "5", lowPrice: "1.37", highPrice: "1.43", transportation: "4" },
    { id: "6", lowPrice: "1.44", highPrice: "1.50", transportation: "5" },
    { id: "7", lowPrice: "1.51", highPrice: "1.57", transportation: "6" },
    { id: "8", lowPrice: "1.58", highPrice: "1.64", transportation: "7" },
    { id: "9", lowPrice: "1.65", highPrice: "1.71", transportation: "8" },
  ]);
  const containerConversionRef = useRef<{ handleSave: () => void }>(null);
  const fuelSurchargeRef = useRef<{ handleSave: () => void }>(null);

  // State to store the current price change configuration
  const [currentPriceChangeConfig, setCurrentPriceChangeConfig] = useState<{
    selectedRequests: string[];
    excelUploadMode: "upload" | "manual" | null;
    excelFile?: string | null;
  } | null>(null);

  // State for Excel upload functionality
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelUploadMode, setExcelUploadMode] = useState<
    "upload" | "manual" | null
  >(null);

  // Enhanced session state for complete workflow persistence
  const [sessionState, setSessionState] = useState<{
    isEditMode: boolean;
    selectedPriceChangeRequests: string[];
    priceChangeRequestFilter: string;
    assignedToFilter: string;
    excelUploadMode: "upload" | "manual" | null;
    excelFile: string | null;
    newRows: Set<string>;
    modifiedRows: Set<string>;
    modifiedColumns: Map<string, Set<string>>;
    currentPriceChangeConfig: {
      selectedRequests: string[];
      excelUploadMode: "upload" | "manual" | null;
      excelFile?: string | null;
    } | null;
  }>({
    isEditMode: false,
    selectedPriceChangeRequests: [],
    priceChangeRequestFilter: "",
    assignedToFilter: "",
    excelUploadMode: null,
    excelFile: null,
    newRows: new Set(),
    modifiedRows: new Set(),
    modifiedColumns: new Map(),
    currentPriceChangeConfig: null,
  });

  // State for tracking changes
  const [forceRerender, setForceRerender] = useState(0);

  // Flag to prevent multiple executions of the useEffect
  const hasExecutedRef = useRef(false);

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
      status: "Incomplete",
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
      status: "Resubmitted",
      requestedBy: "Alex Thompson",
      requestedDate: "2024-02-12",
      requestType: "Customer",
      customerName: "Clean Energy Solutions",
      assignedTo: "Michael Chen",
    },
    {
      id: "PCR-2024-009",
      title: "Industrial Cleanup Ltd - Container Pricing Update",
      description:
        "Update container pricing structure for Industrial Cleanup Ltd to reflect new container costs and market conditions.",
      status: "New",
      requestedBy: "Sarah Johnson",
      requestedDate: "2024-02-15",
      requestType: "Customer",
      customerName: "Industrial Cleanup Ltd",
      assignedTo: "Emily Rodriguez",
    },
    {
      id: "PCR-2024-010",
      title: "Municipal Waste Services - Regional Pricing",
      description:
        "Implement regional pricing adjustments for municipal waste services across different geographic areas.",
      status: "In Progress",
      requestedBy: "David Brown",
      requestedDate: "2024-02-18",
      requestType: "Multiple Customers",
      assignedTo: "Alex Thompson",
    },
    {
      id: "PCR-2024-011",
      title: "Hazardous Materials Corp - Safety Fee Update",
      description:
        "Update safety handling fees for hazardous materials processing to reflect new safety protocols and equipment costs.",
      status: "New",
      requestedBy: "Michael Chen",
      requestedDate: "2024-02-20",
      requestType: "General/Global",
      assignedTo: "Sarah Johnson",
    },
    {
      id: "PCR-2024-012",
      title: "Green Disposal Inc - Eco-Friendly Service Pricing",
      description:
        "Establish pricing for new eco-friendly disposal services including biodegradable packaging and carbon offset options.",
      status: "New",
      requestedBy: "Emily Rodriguez",
      requestedDate: "2024-02-22",
      requestType: "Customer",
      customerName: "Green Disposal Inc",
      assignedTo: "David Brown",
    },
  ];

  // Auto-open price change modal if user came from execute price change button
  useEffect(() => {
    // Only run once when executeRequestId is present and we're not loading
    if (executeRequestId && !isLoading && !hasExecutedRef.current) {
      // Find the price change request by ID
      const request = priceChangeRequests.find(
        (req) => req.id === executeRequestId
      );
      if (request) {
        setSelectedPriceChangeRequests([executeRequestId]);
        // Skip the selection dialog and go directly to configuration dialog
        setPriceChangeConfigDialogOpen(true);
        hasExecutedRef.current = true;
      } else {
        // If the request ID is invalid, show an error and clear the URL parameter
        toast.error(`Price change request ${executeRequestId} not found`);
        // Remove the invalid parameter from the URL without triggering router navigation
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("executeRequestId");
        const newUrl = `${
          window.location.pathname
        }?${newSearchParams.toString()}`;
        window.history.replaceState({}, "", newUrl);
        hasExecutedRef.current = true;
      }
    }

    // Reset the flag when executeRequestId changes to null/undefined
    if (!executeRequestId) {
      hasExecutedRef.current = false;
    }
  }, [executeRequestId, isLoading, priceChangeRequests]);

  // Helper function to calculate unit price preview for percentage increase
  const getUnitPricePreview = (
    percentageIncrease: string,
    selectedRows: any[]
  ): string => {
    if (!percentageIncrease || selectedRows.length === 0) return "";

    const percentage = parseFloat(percentageIncrease);
    if (isNaN(percentage)) return "";

    // Get the first selected row's current unit price for preview
    const selectedIds = getSelectedRowIds();
    const firstSelectedItem = allPricingData.priceItems.find(
      (item) => item.priceItemId === selectedIds[0]
    );

    if (!firstSelectedItem) return "";

    const newPrice = firstSelectedItem.unitPrice * (1 + percentage / 100);
    return `Preview: $${newPrice.toFixed(
      2
    )} (from $${firstSelectedItem.unitPrice.toFixed(2)})`;
  };

  // Helper function to calculate minimum price preview for percentage increase
  const getMinimumPricePreview = (
    percentageIncrease: string,
    selectedRows: any[]
  ): string => {
    if (!percentageIncrease || selectedRows.length === 0) return "";

    const percentage = parseFloat(percentageIncrease);
    if (isNaN(percentage)) return "";

    // Get the first selected row's current minimum price for preview
    const selectedIds = getSelectedRowIds();
    const firstSelectedItem = allPricingData.priceItems.find(
      (item) => item.priceItemId === selectedIds[0]
    );

    if (!firstSelectedItem) return "";

    const newPrice = firstSelectedItem.minimumPrice * (1 + percentage / 100);
    return `Preview: $${newPrice.toFixed(
      2
    )} (from $${firstSelectedItem.minimumPrice.toFixed(2)})`;
  };

  // Helper functions to get unique values for dropdowns
  const getUniqueCustomers = (): string[] => {
    const customers = allPricingData.customers
      .map((c) =>
        c.status === "inactive"
          ? `${c.customerName} (Inactive)`
          : c.customerName
      )
      .filter((name): name is string => Boolean(name));
    return [...new Set(customers)].sort();
  };

  const getUniqueFacilities = (): string[] => {
    const facilities = allPricingData.priceItems
      .map((item) => item.facilityName)
      .filter((name): name is string => Boolean(name));
    return [...new Set(facilities)].sort();
  };

  const getUniqueContainerSizes = (): string[] => {
    const containerSizes = allPricingData.priceItems
      .map((item) => item.containerSize)
      .filter((size): size is string => Boolean(size));
    return [...new Set(containerSizes)].sort();
  };

  const hasUnsavedChanges = () => {
    return (
      (newRows && newRows.size > 0) || (modifiedRows && modifiedRows.size > 0)
    );
  };

  // Custom header fields state
  const [customHeaderFields, setCustomHeaderFields] = useState({
    eei: "Regular",
    fuelSurcharge: "Standard Monthly",
    invoiceMinimum: 350,
    containerConversion: "Standard Conversion",
    itemMinimums: "Standard Tables",
    economicAdjustmentFee: 3,
    eManifestFee: 25,
    hubFee: true,
    regionalPricing: true,
    zoneTransportation: true,
  });

  // Load all pricing data
  useEffect(() => {
    // Force clear localStorage to ensure fresh data with new generator names
    localStorage.removeItem("sampleCustomers");
    localStorage.removeItem("samplePriceHeaders");
    localStorage.removeItem("samplePriceItems");

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

        // Debug: Check the first few price items to verify they have correct values
        if (sampleData.priceItems.length > 0) {
          console.log(
            "Sample data loaded - first 3 price items:",
            sampleData.priceItems.slice(0, 3).map((item) => ({
              id: item.priceItemId,
              unitPrice: item.unitPrice,
              minimumPrice: item.minimumPrice,
            }))
          );
        }

        setAllPricingData({
          customers: sampleData.customers,
          priceHeaders: sampleData.priceHeaders,
          priceItems: sampleData.priceItems,
        });

        // If a customer ID is provided in the route, look up the customer
        if (customerId) {
          const normalizedCustomerId = customerId.replace("-", "");
          let foundCustomer = sampleData.customers.find(
            (c: CustomerInfo) => c.customerId === customerId
          );

          if (!foundCustomer) {
            foundCustomer = sampleData.customers.find(
              (c: CustomerInfo) => c.customerId === normalizedCustomerId
            );
          }

          if (foundCustomer) {
            setCurrentCustomer(foundCustomer);
          }
        }
      } catch (error) {
        console.error("Failed to load pricing data:", error);
        toast.error("Failed to load pricing data");
      } finally {
        setIsLoading(false);
      }
    };

    loadAllPricingData();
  }, [customerId]);

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

    // Use only the main price items
    const allItems = [...allPricingData.priceItems];

    return allItems.filter((item) => {
      // Always include new rows (temporary IDs) regardless of filters
      if (item.priceItemId.startsWith("temp-")) {
        return true;
      }

      // Get the associated customer and header for this item
      const header = allPricingData.priceHeaders.find(
        (h) => h.priceHeaderId === item.priceHeaderId
      );
      const customer = allPricingData.customers.find(
        (c) => c.customerId === header?.customerId
      );

      // If a customer ID is provided in the route, automatically filter by that customer
      const matchesCustomer = currentCustomer
        ? customer && customer.customerId === currentCustomer.customerId
        : filters.customer === "all" ||
          (customer && customer.customerId === filters.customer);

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

      const matchesProductName =
        !filters.productName ||
        item.productName
          .toLowerCase()
          .includes(filters.productName.toLowerCase());

      const matchesStatus =
        filters.status === "all" || item.status === filters.status;

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
            .includes(filters.generator.toLowerCase())) ||
        (item.generatorState &&
          item.generatorState
            .toLowerCase()
            .includes(filters.generator.toLowerCase()));

      const matchesContainerSize =
        filters.containerSize === "all" ||
        !filters.containerSize ||
        (item.containerSize &&
          item.containerSize
            .toLowerCase()
            .includes(filters.containerSize.toLowerCase()));

      const matchesFacility =
        !filters.facility ||
        (item.facilityName &&
          item.facilityName
            .toLowerCase()
            .includes(filters.facility.toLowerCase()));

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

      // Modified rows filtering (only when in edit mode)
      let matchesModifiedOnly = true;
      if (filters.showModifiedOnly && isEditMode) {
        matchesModifiedOnly =
          newRows.has(item.priceItemId) || modifiedRows.has(item.priceItemId);
      }

      return (
        matchesCustomer &&
        matchesContractNumber &&
        matchesProfileId &&
        matchesProductName &&
        matchesStatus &&
        matchesProjectName &&
        matchesUOM &&
        matchesGenerator &&
        matchesContainerSize &&
        matchesFacility &&
        matchesDateRange &&
        matchesPriceRange &&
        matchesModifiedOnly
      );
    });
  }, [allPricingData, filters, isEditMode, newRows, modifiedRows]);

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

      // Check if this is a new or modified item
      const isNewItem = newRows && newRows.has(item.priceItemId);
      const isModifiedItem = modifiedRows && modifiedRows.has(item.priceItemId);

      // Force numeric values and ensure they are not zero unless actually zero
      const unitPrice = parseFloat(String(item.unitPrice)) || 0;
      const minimumPrice = parseFloat(String(item.minimumPrice)) || 0;

      // Debug logging for price values
      if (item.priceItemId.startsWith("temp-")) {
        console.log("Processing new row prices:", {
          priceItemId: item.priceItemId,
          originalUnitPrice: item.unitPrice,
          parsedUnitPrice: unitPrice,
          originalMinimumPrice: item.minimumPrice,
          parsedMinimumPrice: minimumPrice,
        });
      }

      const generatedPriceRequestId =
        item.priceRequestId ||
        (() => {
          // Generate a dummy price request ID for existing rows
          // Create a deterministic ID based on the item ID to ensure consistency
          const hash = item.priceItemId.split("").reduce((a, b) => {
            a = ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff;
            return a;
          }, 0);
          const requestNumber = (Math.abs(hash) % 12) + 1; // Generate numbers 1-12 to match our mock data
          const dummyId = `PCR-${new Date().getFullYear()}-${String(
            requestNumber
          ).padStart(3, "0")}`;

          // Log when generating dummy IDs for debugging
          if (!item.priceRequestId) {
            console.log(
              `Generated dummy price request ID for ${item.priceItemId}: ${dummyId}`
            );
          }

          return dummyId;
        })();

      return {
        id: item.priceItemId,
        customerId: customer?.customerId || "",
        customerName: customer?.customerName || "",
        productName: item.productName,
        profileId: item.profileId,
        generatorId: item.generatorId,
        generatorState: item.generatorState,
        contractId: item.contractId,
        projectName: item.projectName,
        region: item.region || "",
        facilityName: item.facilityName,
        description: item.productName || "", // Using productName as description for now
        containerSize: item.containerSize,
        uom: item.uom,
        unitPrice: unitPrice,
        minimumPrice: minimumPrice,
        effectiveDate: item.effectiveDate || "",
        expirationDate: item.expirationDate || "",
        entryDate: header?.createdAt || "",
        enteredBy: header?.createdByUser?.toString() || "",
        priceRequestId: generatedPriceRequestId,
        header: header,
        isNew: isNewItem,
        isModified: isModifiedItem,
        isNewEntry: item.priceItemId.startsWith("temp-"), // Set to true for temporary rows
      };
    });

    // Since new rows are now included in filteredPriceItems, we just need to ensure they're at the top
    let finalRows = [...baseRows];

    // Move any new entry rows to the top
    const newEntryRows = finalRows.filter((row) => row.isNewEntry);
    const regularRows = finalRows.filter((row) => !row.isNewEntry);

    if (newEntryRows.length > 0) {
      finalRows = [...newEntryRows, ...regularRows];
    }

    // Ensure no duplicate IDs (safety check)
    const uniqueRows = finalRows.filter(
      (row, index, self) => index === self.findIndex((r) => r.id === row.id)
    );

    if (uniqueRows.length !== finalRows.length) {
      console.warn("Duplicate rows detected and removed:", {
        originalCount: finalRows.length,
        uniqueCount: uniqueRows.length,
        duplicateIds: finalRows
          .filter(
            (row, index, self) =>
              index !== self.findIndex((r) => r.id === row.id)
          )
          .map((r) => r.id),
      });
    }

    // Validate row structure and ensure all required properties exist
    const validatedRows = uniqueRows
      .map((row) => {
        if (!row.id) {
          console.error("Row missing ID:", row);
          return null;
        }

        // Ensure all required properties exist with fallback values
        return {
          id: row.id,
          customerId: row.customerId || "",
          customerName: row.customerName || "",
          productName: row.productName || "",
          profileId: row.profileId || "",
          generatorId: row.generatorId || "",
          generatorState: row.generatorState || "",
          contractId: row.contractId || "",
          projectName: row.projectName || "",
          region: row.region || "",
          facilityName: row.facilityName || "",
          description: row.description || "",
          containerSize: row.containerSize || "",
          uom: row.uom || "",
          unitPrice: row.unitPrice !== undefined ? row.unitPrice : 0,
          minimumPrice: row.minimumPrice !== undefined ? row.minimumPrice : 0,
          effectiveDate: row.effectiveDate || "",
          expirationDate: row.expirationDate || "",
          entryDate: row.entryDate || "",
          enteredBy: row.enteredBy || "",
          priceRequestId: row.priceRequestId || "",
          header: row.header,
          isNew: row.isNew || false,
          isModified: row.isModified || false,
          isNewEntry: row.isNewEntry || false,
          isEditing: (row as any).isEditing || false,
        };
      })
      .filter(Boolean); // Remove any null rows

    console.log("Rows computed:", {
      baseRows,
      filteredItemsCount: filteredPriceItems.length,
      newRowId,
      forceRerender,
      finalRowsCount: validatedRows.length,
      hasDuplicateIds: finalRows.length !== uniqueRows.length,
      allIds: validatedRows.map((r) => r!.id),
      sampleRow: validatedRows[0]
        ? {
            id: validatedRows[0].id,
            unitPrice: validatedRows[0].unitPrice,
            minimumPrice: validatedRows[0].minimumPrice,
            isNewEntry: validatedRows[0].isNewEntry,
            keys: Object.keys(validatedRows[0]),
          }
        : null,
    });
    return validatedRows;
  }, [
    filteredPriceItems,
    allPricingData.priceHeaders,
    allPricingData.customers,
    allPricingData.priceItems,
    newRowId,
    forceRerender,
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
    setSelectedPriceChangeRequests([requestId]);
  };

  const handleCreatePriceChange = () => {
    if (selectedPriceChangeRequests.length === 0) {
      toast.error("Please select a price change request");
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
    const config = {
      selectedRequests: [...selectedPriceChangeRequests],
      excelUploadMode,
      excelFile: excelFile ? excelFile.name : null,
    };

    console.log("Setting current price change configuration:", config);
    setCurrentPriceChangeConfig(config);

    // TODO: Implement the actual price change creation logic with the configuration
    console.log("Creating price changes with:", {
      selectedRequests: selectedPriceChangeRequests,
      excelUploadMode,
      excelFile: excelFile ? excelFile.name : null,
    });

    const modeText =
      excelUploadMode === "upload" ? "Excel upload" : "manual entry";
    toast.success(
      `Creating price changes for the selected request with ${modeText}. Edit mode is now enabled.`
    );

    // Enable edit mode
    setIsEditMode(true);

    // Clear URL parameter if user came from executeRequestId
    if (executeRequestId) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("executeRequestId");
      const newUrl = `${
        window.location.pathname
      }?${newSearchParams.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }

    // Reset dialog state but keep the configuration data
    setPriceChangeConfigDialogOpen(false);
    setSelectedPriceChangeRequests([]);
    setPriceChangeRequestFilter("");
    setAssignedToFilter("");
    setExcelFile(null);
    setExcelUploadMode(null);
  };

  const handleCancelPriceChangeConfig = () => {
    setPriceChangeConfigDialogOpen(false);
    setSelectedPriceChangeRequests([]);
    setPriceChangeRequestFilter("");
    setAssignedToFilter("");
    setCurrentPriceChangeConfig(null); // Clear the price change configuration
    // Reset Excel upload state
    setExcelFile(null);
    setExcelUploadMode(null);

    // Clear URL parameter if user came from executeRequestId
    if (executeRequestId) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("executeRequestId");
      const newUrl = `${
        window.location.pathname
      }?${newSearchParams.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  };

  const handleExcelFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        setExcelFile(file);
        toast.success("Excel file uploaded successfully");
      } else {
        toast.error("Please upload a valid Excel file (.xlsx or .xls)");
      }
    }
  };

  const handleBackToPriceChangeSelection = () => {
    setPriceChangeConfigDialogOpen(false);
    // If user came from URL parameter, don't go back to selection dialog
    if (executeRequestId) {
      // Clear the URL parameter and close all dialogs
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("executeRequestId");
      const newUrl = `${
        window.location.pathname
      }?${newSearchParams.toString()}`;
      window.history.replaceState({}, "", newUrl);
      setSelectedPriceChangeRequests([]);
    } else {
      // Normal flow - go back to selection dialog
      setPriceChangeDialogOpen(true);
    }
  };

  // New handler functions for edit mode
  const handleAddNewEntry = () => {
    // Create a new row ID for the temporary row
    const tempRowId = `temp-${Date.now()}`;

    // Get the price request ID from the current price change configuration
    const priceRequestId =
      currentPriceChangeConfig?.selectedRequests?.[0] || "";

    console.log("Creating new entry with price request ID:", {
      priceRequestId,
      currentPriceChangeConfig,
      selectedRequests: currentPriceChangeConfig?.selectedRequests,
    });

    // Create a new empty row with default values
    const newRow = {
      id: tempRowId,
      customerId: customerId || "",
      customerName:
        allPricingData?.customers?.find((c) => c.customerId === customerId)
          ?.customerName || "",
      productName: "",
      profileId: "",
      generatorId: "",
      generatorState: "",
      contractId: "",
      projectName: "",
      region: "North",
      facilityName: "",
      description: "",
      containerSize: "",
      uom: "",
      unitPrice: 0,
      minimumPrice: 0,
      effectiveDate: new Date().toISOString().split("T")[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      entryDate: new Date().toISOString().split("T")[0],
      enteredBy: "",
      priceRequestId: priceRequestId, // Set the price request ID from the configuration
      header: undefined,
      isNew: true,
      isModified: false,
      isNewEntry: true, // Flag to identify this as a new entry row
      isEditing: true, // Flag to indicate this row should be in edit mode
    };

    console.log("Created new row:", newRow);

    // Add the new row to the beginning of the rows array
    setAllPricingData((prev) => {
      const newPriceItem: PriceItem = {
        priceItemId: tempRowId,
        priceHeaderId: prev.priceHeaders[0]?.priceHeaderId || "",
        productName: "",
        region: "North",
        unitPrice: 0,
        minimumPrice: 0,
        effectiveDate: new Date().toISOString().split("T")[0],
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        status: "new",
        uom: "",
        containerSize: "",
        facilityName: "",
        projectName: "",
        profileId: "",
        generatorId: "",
        generatorState: "",
        contractId: "",
        priceRequestId: priceRequestId, // Add the price request ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = {
        ...prev,
        priceItems: [newPriceItem, ...prev.priceItems],
      };
      console.log("Updated allPricingData:", {
        newPriceItem,
        totalPriceItems: updated.priceItems.length,
        firstItem: updated.priceItems[0],
      });
      return updated;
    });

    // Add to newRows set to track it
    setNewRows((prev) => new Set([...prev, tempRowId]));

    // Set the new row ID for tracking
    setNewRowId(tempRowId);

    // Force a re-render to ensure the DataGrid updates
    setForceRerender((prev) => prev + 1);

    if (priceRequestId) {
      toast.success(
        `New row added with price request ID: ${priceRequestId}. You can now edit the values directly in the table.`
      );
    } else {
      toast.warning(
        "New row added but no price change request is selected. The Price Request ID column will be empty."
      );
    }
  };

  const handleSaveEditEntry = () => {
    console.log("=== SAVE EDIT ENTRY TRIGGERED ===");
    console.log("Edit entry data to save:", editingEntryData);

    if (!editingEntryId) {
      console.error("No editing entry ID found");
      toast.error("No entry to save");
      return;
    }

    // Convert and validate the entered data
    const convertValue = (value: any, fieldName: string): any => {
      if (value === null || value === undefined || value === "") {
        return "";
      }

      // Handle numeric fields
      if (fieldName === "unitPrice" || fieldName === "minimumPrice") {
        const numValue = parseFloat(String(value));
        return isNaN(numValue) ? 0 : numValue;
      }

      // Handle date fields
      if (fieldName === "effectiveDate" || fieldName === "expirationDate") {
        if (value instanceof Date) {
          return value.toISOString().split("T")[0];
        }
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
        return "";
      }

      // Handle string fields
      return String(value).trim();
    };

    const convertedData = {
      productName: convertValue(editingEntryData.productName, "productName"),
      unitPrice: convertValue(editingEntryData.unitPrice, "unitPrice"),
      minimumPrice: convertValue(editingEntryData.minimumPrice, "minimumPrice"),
      effectiveDate: convertValue(
        editingEntryData.effectiveDate,
        "effectiveDate"
      ),
      expirationDate: convertValue(
        editingEntryData.expirationDate,
        "expirationDate"
      ),
      projectName: convertValue(editingEntryData.projectName, "projectName"),
      profileId: convertValue(editingEntryData.profileId, "profileId"),
      generatorId: convertValue(editingEntryData.generatorId, "generatorId"),
      generatorState: convertValue(
        editingEntryData.generatorState,
        "generatorState"
      ),
      contractId: convertValue(editingEntryData.contractId, "contractId"),
      facilityName: convertValue(editingEntryData.facilityName, "facilityName"),
      containerSize: convertValue(
        editingEntryData.containerSize,
        "containerSize"
      ),
      uom: convertValue(editingEntryData.uom, "uom"),
    };

    console.log("Converted data:", convertedData);

    // Validate required fields
    if (!convertedData.productName) {
      toast.error("Product name is required");
      return;
    }
    if (!convertedData.unitPrice || convertedData.unitPrice <= 0) {
      toast.error("Valid unit price is required");
      return;
    }

    // Update the price item in the main data
    setAllPricingData((prev) => ({
      ...prev,
      priceItems: prev.priceItems.map((item) => {
        if (item.priceItemId === editingEntryId) {
          const updatedItem = {
            ...item,
            productName: convertedData.productName,
            containerSize: convertedData.containerSize,
            facilityName: convertedData.facilityName,
            projectName: convertedData.projectName,
            profileId: convertedData.profileId,
            generatorId: convertedData.generatorId,
            generatorState: convertedData.generatorState,
            unitPrice: convertedData.unitPrice,
            minimumPrice: convertedData.minimumPrice,
            uom: convertedData.uom,
            effectiveDate: convertedData.effectiveDate,
            expirationDate: convertedData.expirationDate,
            updatedAt: new Date().toISOString(),
          };
          console.log("Updated price item:", updatedItem);
          return updatedItem;
        }
        return item;
      }),
    }));

    // Track modified rows and columns for highlighting
    setModifiedRows((prev) => new Set([...prev, editingEntryId]));

    // Track which specific columns were modified
    const modifiedFields = new Set<string>();
    Object.keys(convertedData).forEach((field) => {
      if ((convertedData as any)[field] !== "") {
        modifiedFields.add(field);
      }
    });

    if (modifiedFields.size > 0) {
      setModifiedColumns((prev) => {
        const newMap = new Map(prev);
        newMap.set(editingEntryId, modifiedFields);
        return newMap;
      });
    }

    // Reset editing state
    setShowEditEntryForm(false);
    setEditingEntryData({});
    setEditingEntryId(null);

    toast.success("Entry updated successfully");
  };

  const handleCancelEditEntry = () => {
    setShowEditEntryForm(false);
    setEditingEntryData({});
    setEditingEntryId(null);
  };

  const handleOpenPriceHeaderModal = () => {
    // Find all price headers for the current customer
    const customerPriceHeaders = allPricingData.priceHeaders.filter(
      (header) => header.customerId === currentCustomer?.customerId
    );

    // Build the list of available price headers
    const headers: Array<{
      id: string;
      name: string;
      type: "customer" | "project";
      projectName?: string;
    }> = [];

    // Add customer-level header (always first)
    const customerHeader = customerPriceHeaders.find((header) =>
      header.headerName.includes("Standard Pricing")
    );
    if (customerHeader) {
      headers.push({
        id: customerHeader.priceHeaderId,
        name: "Customer",
        type: "customer",
      });
    } else {
      // Create a placeholder for customer header if it doesn't exist
      headers.push({
        id: "customer-default",
        name: "Customer",
        type: "customer",
      });
    }

    // Add project-specific headers (headers with project names)
    const projectHeaders = customerPriceHeaders.filter((header) =>
      header.headerName.startsWith("Project:")
    );
    projectHeaders.forEach((header) => {
      // Extract project name from header name
      const projectName = header.headerName.replace("Project: ", "");

      headers.push({
        id: header.priceHeaderId,
        name: projectName,
        type: "project",
        projectName: projectName,
      });
    });

    setAvailablePriceHeaders(headers);

    // Select the first header by default
    const defaultHeaderId = headers.length > 0 ? headers[0].id : null;
    setSelectedPriceHeaderId(defaultHeaderId);

    // Load the selected header data
    if (defaultHeaderId && defaultHeaderId !== "customer-default") {
      const selectedHeader = customerPriceHeaders.find(
        (header) => header.priceHeaderId === defaultHeaderId
      );
      if (selectedHeader) {
        setPriceHeaderData({
          headerName: selectedHeader.headerName || "",
          effectiveDate: selectedHeader.effectiveDate || "",
          expirationDate: selectedHeader.expirationDate || "",
          status: selectedHeader.status || "",
          createdBy: selectedHeader.createdByUser?.toString() || "",
          createdAt: selectedHeader.createdAt || "",
          updatedAt: selectedHeader.updatedAt || "",
          // Custom header fields from Figma mockup (using default values for now)
          eei: "Regular",
          fuelSurcharge: "Standard Monthly",
          invoiceMinimum: selectedHeader.invoiceMinimum || 350,
          containerConversion: "Standard Conversion",
          itemMinimums: "Standard Tables",
          economicAdjustmentFee: 3,
          eManifestFee: 25,
          hubFee: true,
          regionalPricing: true,
          zoneTransportation: true,
        });
      }
    } else {
      // Set default values for new customer header
      setPriceHeaderData({
        headerName: "",
        effectiveDate: "",
        expirationDate: "",
        status: "",
        createdBy: "",
        createdAt: "",
        updatedAt: "",
        // Custom header fields from Figma mockup
        eei: "Regular",
        fuelSurcharge: "Standard Monthly",
        invoiceMinimum: 350,
        containerConversion: "Standard Conversion",
        itemMinimums: "Standard Tables",
        economicAdjustmentFee: 3,
        eManifestFee: 25,
        hubFee: true,
        regionalPricing: true,
        zoneTransportation: true,
      });
    }

    setShowPriceHeaderModal(true);
  };

  const handleSavePriceHeader = () => {
    // Validation for new header
    if (isCreatingNewHeader) {
      if (!newHeaderName.trim()) {
        toast.error("Please enter a header name");
        return;
      }

      if (
        !priceHeaderData.eei ||
        !priceHeaderData.fuelSurcharge ||
        !priceHeaderData.invoiceMinimum ||
        !priceHeaderData.containerConversion ||
        !priceHeaderData.itemMinimums ||
        !priceHeaderData.economicAdjustmentFee ||
        !priceHeaderData.eManifestFee ||
        !priceHeaderData.effectiveDate ||
        !priceHeaderData.expirationDate ||
        !priceHeaderData.globalContainerMinimum ||
        priceHeaderData.globalContainerMinimum === 0
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate custom E&I fields if "Custom" is selected
      if (priceHeaderData.eei === "Custom") {
        if (
          !priceHeaderData.customEeiRate ||
          priceHeaderData.customEeiRate === 0 ||
          !priceHeaderData.customEeiEffectiveDate ||
          !priceHeaderData.customEeiExpirationDate
        ) {
          toast.error("Please fill in all custom E&I fields");
          return;
        }

        // Validate that custom E&I expiration date is after effective date
        if (
          new Date(priceHeaderData.customEeiExpirationDate) <=
          new Date(priceHeaderData.customEeiEffectiveDate)
        ) {
          toast.error(
            "Custom E&I expiration date must be after effective date"
          );
          return;
        }
      }

      // Validate that expiration date is after effective date
      if (
        new Date(priceHeaderData.expirationDate) <=
        new Date(priceHeaderData.effectiveDate)
      ) {
        toast.error("Expiration date must be after effective date");
        return;
      }

      // Create new header logic
      console.log("Creating new price header:", {
        name: newHeaderName,
        data: priceHeaderData,
      });

      // TODO: Implement API call to create new price header

      toast.success(`Price header "${newHeaderName}" created successfully`);
    } else {
      // Update existing header logic
      console.log("Updating existing price header:", {
        headerId: selectedPriceHeaderId,
        data: priceHeaderData,
      });

      // TODO: Implement API call to update existing price header

      toast.success("Price header updated successfully");
    }

    // Reset modal state
    setShowPriceHeaderModal(false);
    setPriceHeaderData({});
    setIsCreatingNewHeader(false);
    setNewHeaderName("");
    setSelectedPriceHeaderId(null);
  };

  const handleCancelPriceHeader = () => {
    setShowPriceHeaderModal(false);
    setPriceHeaderData({});
    setIsCreatingNewHeader(false);
    setNewHeaderName("");
    setSelectedPriceHeaderId(null);
  };

  const handlePriceHeaderSelectionChange = (value: string) => {
    if (value === "__new__") {
      // Switch to new header creation mode
      setIsCreatingNewHeader(true);
      setSelectedPriceHeaderId(null);
      setNewHeaderName("");

      // Set default values for new header
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      setPriceHeaderData({
        headerName: "",
        effectiveDate: today.toISOString().split("T")[0], // Today
        expirationDate: oneYearFromNow.toISOString().split("T")[0], // One year from today
        status: "",
        createdBy: "",
        createdAt: "",
        updatedAt: "",
        eei: "",
        fuelSurcharge: "",
        invoiceMinimum: "",
        containerConversion: "",
        itemMinimums: "",
        economicAdjustmentFee: "",
        eManifestFee: "",
        hubFee: false,
        regionalPricing: false,
        zoneTransportation: false,
        // Custom E&I fields
        customEeiRate: "",
        customEeiEffectiveDate: "",
        customEeiExpirationDate: "",
        // Global container minimum
        globalContainerMinimum: "",
      });
      return;
    }

    // Switch to existing header editing mode
    setIsCreatingNewHeader(false);
    setNewHeaderName("");
    setPriceHeaderLoading(true);
    setSelectedPriceHeaderId(value);

    // Simulate loading with a brief delay to show the spinner
    setTimeout(() => {
      // Find the selected header
      const customerPriceHeaders = allPricingData.priceHeaders.filter(
        (header) => header.customerId === currentCustomer?.customerId
      );

      if (value === "customer-default") {
        // Set default values for new customer header
        setPriceHeaderData({
          headerName: "",
          effectiveDate: "",
          expirationDate: "",
          status: "",
          createdBy: "",
          createdAt: "",
          updatedAt: "",
          // Custom header fields from Figma mockup
          eei: "Regular",
          fuelSurcharge: "Standard Monthly",
          invoiceMinimum: 350,
          containerConversion: "Standard Conversion",
          itemMinimums: "Standard Tables",
          economicAdjustmentFee: 3,
          eManifestFee: 25,
          hubFee: true,
          regionalPricing: true,
          zoneTransportation: true,
        });
      } else {
        const selectedHeader = customerPriceHeaders.find(
          (header) => header.priceHeaderId === value
        );
        if (selectedHeader) {
          setPriceHeaderData({
            headerName: selectedHeader.headerName || "",
            effectiveDate: selectedHeader.effectiveDate || "",
            expirationDate: selectedHeader.expirationDate || "",
            status: selectedHeader.status || "",
            createdBy: selectedHeader.createdByUser?.toString() || "",
            createdAt: selectedHeader.createdAt || "",
            updatedAt: selectedHeader.updatedAt || "",
            // Custom header fields from Figma mockup (using sample data values)
            eei: selectedHeader.headerName.includes("Project")
              ? "Custom"
              : "Regular",
            fuelSurcharge: selectedHeader.headerName.includes("Project")
              ? "Custom Rate"
              : "Standard Monthly",
            invoiceMinimum: selectedHeader.invoiceMinimum || 350,
            containerConversion: selectedHeader.headerName.includes("Project")
              ? "Custom Conversion"
              : "Standard Conversion",
            itemMinimums: selectedHeader.headerName.includes("Project")
              ? "Custom Tables"
              : "Standard Tables",
            economicAdjustmentFee: selectedHeader.headerName.includes("Project")
              ? 5
              : 3,
            eManifestFee: selectedHeader.headerName.includes("Project")
              ? 35
              : 25,
            hubFee: selectedHeader.headerName.includes("Project"),
            regionalPricing: selectedHeader.headerName.includes("Project"),
            zoneTransportation: selectedHeader.headerName.includes("Project"),
          });
        }
      }

      setPriceHeaderLoading(false);
    }, 500); // 500ms delay to show the spinner
  };

  const handleCancelNewEntry = () => {
    setShowNewEntryForm(false);
    setNewEntryData({});
  };

  // Handle cell edits for new entry row
  const handleNewEntryCellEdit = (field: string, value: any) => {
    console.log("New entry cell edit:", field, value);
    setNewEntryData((prev: Record<string, any>) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle cell edits for edit entry row
  const handleEditEntryCellEdit = (field: string, value: any) => {
    console.log("Edit entry cell edit:", field, value);
    setEditingEntryData((prev: Record<string, any>) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Process row updates for editing
  const processRowUpdate = async (newRow: any, oldRow: any) => {
    console.log("=== PROCESS ROW UPDATE TRIGGERED ===");
    console.log("processRowUpdate called:", {
      newRow: JSON.stringify(newRow, null, 2),
      oldRow: JSON.stringify(oldRow, null, 2),
      newRowId,
      isEditMode,
    });

    // Helper function to safely convert values to proper types
    const convertValue = (value: any, fieldName: string): any => {
      if (value === null || value === undefined || value === "") {
        return "";
      }

      // Handle numeric fields
      if (fieldName === "unitPrice" || fieldName === "minimumPrice") {
        const numValue = parseFloat(String(value));
        return isNaN(numValue) ? 0 : numValue;
      }

      // Handle date fields
      if (fieldName === "effectiveDate" || fieldName === "expirationDate") {
        if (value instanceof Date) {
          return value.toISOString().split("T")[0];
        }
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
        return "";
      }

      // Handle string fields
      return String(value).trim();
    };

    // If this is a new row being added
    if (newRow.isNewEntry || oldRow.isNewEntry || newRowId === newRow.id) {
      console.log("Processing new entry row");

      // Convert and validate the entered data
      const convertedData = {
        productName: convertValue(newRow.productName, "productName"),
        unitPrice: convertValue(newRow.unitPrice, "unitPrice"),
        minimumPrice: convertValue(newRow.minimumPrice, "minimumPrice"),
        effectiveDate: convertValue(newRow.effectiveDate, "effectiveDate"),
        expirationDate: convertValue(newRow.expirationDate, "expirationDate"),
        projectName: convertValue(newRow.projectName, "projectName"),
        profileId: convertValue(newRow.profileId, "profileId"),
        generatorId: convertValue(newRow.generatorId, "generatorId"),
        generatorState: convertValue(newRow.generatorState, "generatorState"),
        contractId: convertValue(newRow.contractId, "contractId"),
        facilityName: convertValue(newRow.facilityName, "facilityName"),
        containerSize: convertValue(newRow.containerSize, "containerSize"),
        uom: convertValue(newRow.uom, "uom"),
      };

      // Check if user has actually entered any data
      const hasEnteredData = Object.values(convertedData).some(
        (value) => value !== "" && value !== 0
      );

      // If no data has been entered, just return the row without saving
      if (!hasEnteredData) {
        console.log("No data entered, returning row without saving");
        return newRow;
      }

      // Validate required fields only if user has started entering data
      if (!convertedData.productName) {
        throw new Error("Product name is required");
      }
      if (!convertedData.unitPrice || convertedData.unitPrice <= 0) {
        throw new Error("Valid unit price is required");
      }

      // Create a new price item from the entered data
      const newPriceItem: PriceItem = {
        priceItemId: newRow.id || `new-${Date.now()}`,
        priceHeaderId: allPricingData.priceHeaders[0]?.priceHeaderId || "",
        productName: convertedData.productName,
        region: newRow.region || "North",
        unitPrice: convertedData.unitPrice,
        minimumPrice: convertedData.minimumPrice,
        effectiveDate:
          convertedData.effectiveDate || new Date().toISOString().split("T")[0],
        expirationDate:
          convertedData.expirationDate ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        status: "new",
        uom: convertedData.uom,
        containerSize: convertedData.containerSize,
        facilityName: convertedData.facilityName,
        projectName: convertedData.projectName,
        profileId: convertedData.profileId,
        generatorId: convertedData.generatorId,
        generatorState: convertedData.generatorState,
        contractId: convertedData.contractId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add the new item to the main data
      setAllPricingData((prev) => {
        const updated = {
          ...prev,
          priceItems: [newPriceItem, ...prev.priceItems], // Add at the top
        };
        console.log("Added new price item to data:", newPriceItem);
        console.log("Updated price items count:", updated.priceItems.length);
        return updated;
      });

      // Add to newRows set to track it
      setNewRows((prev) => new Set([...prev, newPriceItem.priceItemId]));

      // Reset editing state
      setEditingRowId(null);
      setNewRowId(null);

      toast.success("New entry added successfully");

      // Return the updated row data
      return {
        ...newRow,
        id: newPriceItem.priceItemId,
        isNewEntry: false, // Mark as no longer a new entry
        ...convertedData, // Include the converted data
      };
    }

    // For existing rows, track which columns were modified
    const modifiedFields = new Set<string>();

    // Convert all field values to proper types
    const convertedNewRow = { ...newRow };
    const fieldsToTrack = [
      "customerName",
      "productName",
      "containerSize",
      "facilityName",
      "projectName",
      "profileId",
      "generatorId",
      "generatorState",
      "unitPrice",
      "minimumPrice",
      "uom",
      "effectiveDate",
      "expirationDate",
    ];

    fieldsToTrack.forEach((field) => {
      const convertedValue = convertValue(newRow[field], field);
      convertedNewRow[field] = convertedValue;

      // Compare with old value to detect changes
      const oldValue = convertValue(oldRow[field], field);
      if (convertedValue !== oldValue) {
        modifiedFields.add(field);
      }
    });

    // Validate critical fields for existing rows
    if (convertedNewRow.unitPrice < 0) {
      throw new Error("Unit price cannot be negative");
    }
    if (convertedNewRow.minimumPrice < 0) {
      throw new Error("Minimum price cannot be negative");
    }

    // If any fields were modified, update the underlying data
    if (modifiedFields.size > 0) {
      console.log(
        `Row ${newRow.id} modified fields:`,
        Array.from(modifiedFields)
      );

      // Update the price item in the main data
      setAllPricingData((prev) => ({
        ...prev,
        priceItems: prev.priceItems.map((item) => {
          if (item.priceItemId === newRow.id) {
            const updatedItem = {
              ...item,
              productName: convertedNewRow.productName,
              containerSize: convertedNewRow.containerSize,
              facilityName: convertedNewRow.facilityName,
              projectName: convertedNewRow.projectName,
              profileId: convertedNewRow.profileId,
              generatorId: convertedNewRow.generatorId,
              generatorState: convertedNewRow.generatorState,
              unitPrice: convertedNewRow.unitPrice,
              minimumPrice: convertedNewRow.minimumPrice,
              uom: convertedNewRow.uom,
              effectiveDate: convertedNewRow.effectiveDate,
              expirationDate: convertedNewRow.expirationDate,
              updatedAt: new Date().toISOString(),
            };
            console.log("Updated price item:", updatedItem);
            return updatedItem;
          }
          return item;
        }),
      }));

      // Track modified rows and columns for highlighting
      setModifiedRows((prev) => new Set([...prev, newRow.id]));
      setModifiedColumns((prev) => {
        const newMap = new Map(prev);
        newMap.set(newRow.id, modifiedFields);
        return newMap;
      });

      // Also update the header if effective or expiration dates are changed
      if (
        modifiedFields.has("effectiveDate") ||
        modifiedFields.has("expirationDate")
      ) {
        const header = allPricingData.priceHeaders.find(
          (h) => h.priceHeaderId === newRow.header?.priceHeaderId
        );
        if (header) {
          const updatedHeader = {
            ...header,
            ...(modifiedFields.has("effectiveDate") && {
              effectiveDate: convertedNewRow.effectiveDate,
            }),
            ...(modifiedFields.has("expirationDate") && {
              expirationDate: convertedNewRow.expirationDate,
            }),
          };

          // Update the header in the data
          setAllPricingData((prev) => ({
            ...prev,
            priceHeaders: prev.priceHeaders.map((h) =>
              h.priceHeaderId === header.priceHeaderId ? updatedHeader : h
            ),
          }));
        }
      }

      // Force a re-render to ensure the DataGrid updates
      setForceRerender((prev) => prev + 1);
    }

    return convertedNewRow;
  };

  const handleApplyChanges = () => {
    if ((selectedRows as any[]).length === 0) {
      toast.error("Please select at least one row to apply changes");
      return;
    }
    setApplyChangesDialogOpen(true);
  };

  const handleEditSelected = () => {
    const selectedIds = getSelectedRowIds();
    if (selectedIds.length === 0) {
      toast.error("Please select at least one row to edit");
      return;
    }
    // If multiple rows are selected, open the bulk edit dialog
    if (selectedIds.length > 1) {
      setApplyChangesDialogOpen(true);
      return;
    }

    // Find the selected row data
    const selectedRow = rows?.find((row) => row?.id === selectedIds[0]);
    if (!selectedRow) {
      toast.error("Selected row not found");
      return;
    }

    // Set up the edit form with current data
    setEditingEntryId(selectedRow.id);
    setEditingEntryData({
      productName: selectedRow.productName || "",
      unitPrice: selectedRow.unitPrice || "",
      minimumPrice: selectedRow.minimumPrice || "",
      effectiveDate: selectedRow.effectiveDate || "",
      expirationDate: selectedRow.expirationDate || "",
      projectName: selectedRow.projectName || "",
      profileId: selectedRow.profileId || "",
      generatorId: selectedRow.generatorId || "",
      generatorState: selectedRow.generatorState || "",
      contractId: selectedRow.contractId || "",
      facilityName: selectedRow.facilityName || "",
      containerSize: selectedRow.containerSize || "",
      uom: selectedRow.uom || "",
      region: selectedRow.region || "North",
    });
    setShowEditEntryForm(true);
  };

  const handleApplyChangesSubmit = () => {
    // Get selected row IDs
    const selectedIds = getSelectedRowIds();

    // Update selected price items
    setAllPricingData((prev) => ({
      ...prev,
      priceItems: prev.priceItems.map((item) => {
        if (selectedIds.includes(item.priceItemId)) {
          // Calculate new unit price based on percentage increase or absolute value
          let newUnitPrice = item.unitPrice;
          if (bulkEditForm.unitPricePercentageIncrease) {
            const percentageIncrease = parseFloat(
              bulkEditForm.unitPricePercentageIncrease
            );
            newUnitPrice = item.unitPrice * (1 + percentageIncrease / 100);
          } else if (bulkEditForm.unitPrice) {
            newUnitPrice = parseFloat(bulkEditForm.unitPrice);
          }

          // Calculate new minimum price based on percentage increase or absolute value
          let newMinimumPrice = item.minimumPrice;
          if (bulkEditForm.minimumPricePercentageIncrease) {
            const percentageIncrease = parseFloat(
              bulkEditForm.minimumPricePercentageIncrease
            );
            newMinimumPrice =
              item.minimumPrice * (1 + percentageIncrease / 100);
          } else if (bulkEditForm.minimumPrice) {
            newMinimumPrice = parseFloat(bulkEditForm.minimumPrice);
          }

          const updatedItem = {
            ...item,
            ...(bulkEditForm.containerSize && {
              containerSize: bulkEditForm.containerSize,
            }),
            ...(bulkEditForm.uom && { uom: bulkEditForm.uom }),
            ...(bulkEditForm.generatorState && {
              generatorState: bulkEditForm.generatorState,
            }),
            ...(bulkEditForm.unitPrice ||
            bulkEditForm.unitPricePercentageIncrease
              ? {
                  unitPrice: newUnitPrice,
                }
              : {}),
            ...(bulkEditForm.minimumPrice ||
            bulkEditForm.minimumPricePercentageIncrease
              ? {
                  minimumPrice: newMinimumPrice,
                }
              : {}),
            ...(bulkEditForm.effectiveDate && {
              effectiveDate: bulkEditForm.effectiveDate,
            }),
            ...(bulkEditForm.expirationDate && {
              expirationDate: bulkEditForm.expirationDate,
            }),
          };

          // Also update the header if effective or expiration dates are changed
          if (bulkEditForm.effectiveDate || bulkEditForm.expirationDate) {
            const header = allPricingData.priceHeaders.find(
              (h) => h.priceHeaderId === item.priceHeaderId
            );
            if (header) {
              const updatedHeader = {
                ...header,
                ...(bulkEditForm.effectiveDate && {
                  effectiveDate: bulkEditForm.effectiveDate,
                }),
                ...(bulkEditForm.expirationDate && {
                  expirationDate: bulkEditForm.expirationDate,
                }),
              };

              // Update the header in the data
              setAllPricingData((prev) => ({
                ...prev,
                priceHeaders: prev.priceHeaders.map((h) =>
                  h.priceHeaderId === item.priceHeaderId ? updatedHeader : h
                ),
              }));
            }
          }

          // Track modified rows and columns for highlighting
          setModifiedRows((prev) => new Set([...prev, item.priceItemId]));

          // Track which specific columns were modified
          const modifiedFields = new Set<string>();
          if (bulkEditForm.containerSize) modifiedFields.add("containerSize");
          if (bulkEditForm.uom) modifiedFields.add("uom");
          if (bulkEditForm.generatorState) modifiedFields.add("generatorState");
          if (
            bulkEditForm.unitPrice ||
            bulkEditForm.unitPricePercentageIncrease
          )
            modifiedFields.add("unitPrice");
          if (
            bulkEditForm.minimumPrice ||
            bulkEditForm.minimumPricePercentageIncrease
          )
            modifiedFields.add("minimumPrice");
          if (bulkEditForm.effectiveDate) modifiedFields.add("effectiveDate");
          if (bulkEditForm.expirationDate) modifiedFields.add("expirationDate");

          if (modifiedFields.size > 0) {
            setModifiedColumns((prev) => {
              const newMap = new Map(prev);
              newMap.set(item.priceItemId, modifiedFields);
              return newMap;
            });
          }

          return updatedItem;
        }
        return item;
      }),
    }));

    // Reset form and close dialog
    setBulkEditForm({
      containerSize: "",
      uom: "",
      generatorState: "",
      unitPrice: "",
      unitPricePercentageIncrease: "",
      minimumPrice: "",
      minimumPricePercentageIncrease: "",
      effectiveDate: "",
      expirationDate: "",
    });
    setUnitPriceEditMode("absolute");
    setMinimumPriceEditMode("absolute");
    setApplyChangesDialogOpen(false);
    setSelectedRows([] as any);
    toast.success(`Updated ${selectedIds.length} price item(s) successfully`);
  };

  const handleApplyChangesCancel = () => {
    setBulkEditForm({
      containerSize: "",
      uom: "",
      generatorState: "",
      unitPrice: "",
      unitPricePercentageIncrease: "",
      minimumPrice: "",
      minimumPricePercentageIncrease: "",
      effectiveDate: "",
      expirationDate: "",
    });
    setUnitPriceEditMode("absolute");
    setMinimumPriceEditMode("absolute");
    setApplyChangesDialogOpen(false);
  };

  const handleExitEditMode = () => {
    const hasPendingChanges =
      (newRows && newRows.size > 0) || (modifiedRows && modifiedRows.size > 0);

    if (hasPendingChanges) {
      setExitEditModeConfirmOpen(true);
    } else {
      // No pending changes, exit immediately
      exitEditMode();
    }
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedRows([] as any);
    setNewRows(new Set());
    setModifiedRows(new Set());
    setModifiedColumns(new Map());
    setCurrentPriceChangeConfig(null);
    setExitEditModeConfirmOpen(false);
    // Reset the modified rows filter when exiting edit mode
    setFilters((prev) => ({ ...prev, showModifiedOnly: false }));
    toast.info("Exited edit mode");
  };

  const handleSubmitPriceChange = () => {
    setSubmitPriceChangeConfirmOpen(true);
  };

  const submitPriceChange = () => {
    const totalChanges =
      (newRows ? newRows.size : 0) + (modifiedRows ? modifiedRows.size : 0);

    // TODO: Implement actual price change submission logic here
    // This would typically involve:
    // 1. Validating all changes
    // 2. Sending data to backend API
    // 3. Handling success/error responses

    toast.success(
      `Successfully submitted price change with ${totalChanges} modified entries`
    );

    // Reset edit mode after successful submission
    setIsEditMode(false);
    setSelectedRows([] as any);
    setNewRows(new Set());
    setModifiedRows(new Set());
    setModifiedColumns(new Map());
    setCurrentPriceChangeConfig(null);
    setSubmitPriceChangeConfirmOpen(false);
  };

  // Split button handlers
  const handleSubmitMenuToggle = () => {
    setSubmitMenuOpen((prevOpen) => !prevOpen);
  };

  const handleSubmitMenuClose = (event: Event) => {
    if (
      submitMenuAnchorRef.current &&
      submitMenuAnchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setSubmitMenuOpen(false);
  };

  const handleSubmitOptionClick = (action: "submit" | "draft") => {
    if (action === "submit") {
      handleSubmitPriceChange();
    } else if (action === "draft") {
      handleSaveAsDraft();
    }
    setSubmitMenuOpen(false);
  };

  const handleSaveAsDraft = () => {
    const totalChanges =
      (newRows ? newRows.size : 0) + (modifiedRows ? modifiedRows.size : 0);

    // This function just confirms the current state
    toast.success(`Changes saved with ${totalChanges} modified entries`);

    // Note: Don't reset edit mode - user can continue editing
    setSubmitPriceChangeConfirmOpen(false);
  };

  // Delete handlers
  const handleDeleteSelected = () => {
    const selectedIds = getSelectedRowIds();
    if (selectedIds.length === 0) {
      toast.error("No rows selected for deletion");
      return;
    }

    // Separate new rows (temporary rows) from existing rows
    const selectedNewRows = selectedIds.filter((id) => id.startsWith("temp-"));
    const selectedExistingRows = selectedIds.filter(
      (id) => !id.startsWith("temp-")
    );

    // Handle new rows immediately (no validation needed)
    if (selectedNewRows.length > 0) {
      // Remove from allPricingData
      setAllPricingData((prev) => ({
        ...prev,
        priceItems: prev.priceItems.filter(
          (item) => !selectedNewRows.includes(item.priceItemId)
        ),
      }));

      // Remove from newRows set
      setNewRows((prev) => {
        const updated = new Set(prev);
        selectedNewRows.forEach((id) => updated.delete(id));
        return updated;
      });

      // Clear newRowId if any of the deleted rows was the current new row
      if (newRowId && selectedNewRows.includes(newRowId)) {
        setNewRowId(null);
      }

      // Clear selection and force re-render
      setSelectedRows([]);
      setForceRerender((prev) => prev + 1);

      toast.success(
        `${selectedNewRows.length} new row(s) removed successfully`
      );
    }

    // Handle existing rows with validation (if any)
    if (selectedExistingRows.length > 0) {
      // Check if any selected rows have effective dates less than or equal to today
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison

      console.log("Today's date:", today.toISOString());
      console.log("Selected existing row IDs:", selectedExistingRows);

      const rowsWithPastEffectiveDates = selectedExistingRows.filter((id) => {
        const row = allPricingData.priceItems.find(
          (item) => item.priceItemId === id
        );
        if (!row) {
          console.log(`Row not found for ID: ${id}`);
          return false;
        }

        console.log(`Row found:`, row);

        // Check if the row itself has an effective date
        if (row.effectiveDate) {
          const effectiveDate = new Date(row.effectiveDate);
          effectiveDate.setHours(0, 0, 0, 0);
          console.log(
            `Row effective date: ${
              row.effectiveDate
            } -> ${effectiveDate.toISOString()}`
          );

          if (effectiveDate <= today) {
            console.log(
              `Row has past effective date: ${effectiveDate.toISOString()} <= ${today.toISOString()}`
            );
            return true;
          }
        }

        // Find the corresponding price header to get the effective date
        const header = allPricingData.priceHeaders.find(
          (h) => h.priceHeaderId === row.priceHeaderId
        );
        if (!header) {
          console.log(
            `Header not found for priceHeaderId: ${row.priceHeaderId}`
          );
          return false;
        }

        if (!header.effectiveDate) {
          console.log(`Header has no effective date:`, header);
          return false;
        }

        const effectiveDate = new Date(header.effectiveDate);
        effectiveDate.setHours(0, 0, 0, 0); // Set to start of day for comparison

        console.log(
          `Header effective date: ${
            header.effectiveDate
          } -> ${effectiveDate.toISOString()}`
        );

        if (effectiveDate <= today) {
          console.log(
            `Header has past effective date: ${effectiveDate.toISOString()} <= ${today.toISOString()}`
          );
          return true;
        }

        return false;
      });

      console.log(
        "Rows with past effective dates:",
        rowsWithPastEffectiveDates
      );

      if (rowsWithPastEffectiveDates.length > 0) {
        console.log("Validation failed - showing error dialog");
        setValidationErrorDetails({
          count: rowsWithPastEffectiveDates.length,
          rows: rowsWithPastEffectiveDates,
        });
        setDeleteValidationErrorOpen(true);
        return;
      }

      // If validation passes, show confirmation dialog for existing rows
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    const selectedIds = getSelectedRowIds();

    // TODO: Implement actual deletion logic here
    // This would typically involve:
    // 1. Validating deletion permissions
    // 2. Sending delete requests to backend API
    // 3. Handling success/error responses

    // For now, we'll just remove the items from the local state
    setAllPricingData((prev) => ({
      ...prev,
      priceItems: prev.priceItems.filter(
        (item) => !selectedIds.includes(item.priceItemId)
      ),
    }));

    // Clear selections and close dialog
    setSelectedRows([]);
    setDeleteConfirmOpen(false);

    toast.success(`Successfully deleted ${selectedIds.length} item(s)`);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

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
            width: 60,
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
                    setSelectedRows(rows?.map((row) => row.id) || []);
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
              if (!params || !params.row) {
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
      field: "profileId",
      headerName: "Profile",
      width: 120,
      flex: 0.5,
      minWidth: 100,
      editable: true,
      renderCell: (params: any) => {
        if (!params || !params.row) {
          console.warn("Invalid params in profileId renderCell:", params);
          return <div>-</div>;
        }
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("profileId");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "projectName",
      headerName: "Project",
      width: 150,
      flex: 1,
      minWidth: 120,
      editable: true,
      renderCell: (params: any) => {
        if (!params || !params.row) {
          console.warn("Invalid params in projectName renderCell:", params);
          return <div>-</div>;
        }
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("projectName");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "generatorId",
      headerName: "Generator",
      width: 200,
      flex: 0.8,
      minWidth: 180,
      // editable: true, // Disabled direct editing
      renderCell: (params: any) => {
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("generatorId");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "generatorState",
      headerName: "Generator State",
      width: 120,
      flex: 0.5,
      minWidth: 100,
      // editable: true, // Disabled direct editing
      renderCell: (params: any) => {
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("generatorState");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "contractId",
      headerName: "Contract",
      width: 120,
      flex: 0.5,
      minWidth: 100,
      // editable: true, // Disabled direct editing
      renderCell: (params: any) => {
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("contractId");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "region",
      headerName: "Region",
      width: 100,
      flex: 0.5,
      minWidth: 80,
      // editable: true, // Disabled direct editing
      renderCell: (params: any) => {
        if (!params || !params.row) {
          console.warn("Invalid params in region renderCell:", params);
          return <div>-</div>;
        }
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("region");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "facilityName",
      headerName: "Facility",
      width: 150,
      flex: 1,
      minWidth: 120,
      // editable: true, // Disabled direct editing
      type: "singleSelect",
      valueOptions: getUniqueFacilities().map((value) => ({
        value,
        label: value,
      })),
      renderCell: (params: any) => {
        if (!params || !params.row) {
          console.warn("Invalid params in facilityName renderCell:", params);
          return <div>-</div>;
        }
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("facilityName");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "productName",
      headerName: "Item",
      width: 100,
      flex: 0,
      minWidth: 80,
      editable: true,
      renderCell: (params: any) => {
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("productName");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      flex: 1,
      minWidth: 150,
      // editable: true, // Disabled direct editing
      renderCell: (params: any) => {
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("description");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "uom",
      headerName: "UOM",
      width: 100,
      flex: 0,
      minWidth: 80,
      editable: true,
      type: "singleSelect",
      valueOptions: ["Each", "Gallon", "Pound", "Container", "Ton"],
      renderCell: (params: any) => {
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("uom");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "containerSize",
      headerName: "Container Size",
      width: 130,
      flex: 0.8,
      minWidth: 110,
      editable: true,
      type: "singleSelect",
      valueOptions: getUniqueContainerSizes().map((value) => ({
        value,
        label: value,
      })),
      renderCell: (params: any) => {
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("containerSize");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "unitPrice",
      headerName: "Price",
      width: 120,
      flex: 0,
      minWidth: 100,
      editable: true,
      type: "number",
      valueGetter: (params: any) => {
        // Ensure we get the actual value from the row data
        if (!params || !params.row) {
          console.warn("Invalid params in unitPrice valueGetter:", params);
          return 0;
        }
        const value = params.row.unitPrice;
        return value !== undefined && value !== null ? value : 0;
      },
      valueSetter: (params: any) => {
        if (!params || !params.row) {
          console.error("Invalid params in unitPrice valueSetter:", params);
          return { id: "temp", unitPrice: 0 };
        }
        const value = parseFloat(params.value) || 0;
        return { ...params.row, unitPrice: value, id: params.row.id };
      },
      renderCell: (params: any) => {
        if (!params || !params.row) {
          console.warn("Invalid params in unitPrice renderCell:", params);
          return <div>$0.00</div>;
        }
        // Use the row data directly instead of params.value to ensure we get the actual value
        const price = formatCurrency(params.row.unitPrice);
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isPriceModified = modifiedFields?.has("unitPrice");
        return (
          <div
            style={{
              fontWeight: isPriceModified ? "bold" : "500",
              color: isPriceModified ? "#1c1b1f" : "inherit",
            }}
          >
            {price}
          </div>
        );
      },
    },
    {
      field: "minimumPrice",
      headerName: "Price Minimum",
      width: 120,
      flex: 0,
      minWidth: 100,
      editable: true,
      type: "number",
      valueGetter: (params: any) => {
        // Ensure we get the actual value from the row data
        if (!params || !params.row) {
          console.warn("Invalid params in minimumPrice valueGetter:", params);
          return 0;
        }
        const value = params.row.minimumPrice;
        return value !== undefined && value !== null ? value : 0;
      },
      valueSetter: (params: any) => {
        if (!params || !params.row) {
          console.error("Invalid params in minimumPrice valueSetter:", params);
          return { id: "temp", minimumPrice: 0 };
        }
        const value = parseFloat(params.value) || 0;
        return { ...params.row, minimumPrice: value, id: params.row.id };
      },
      renderCell: (params: any) => {
        if (!params || !params.row) {
          console.warn("Invalid params in minimumPrice renderCell:", params);
          return <div>$0.00</div>;
        }
        // Use the row data directly instead of params.value to ensure we get the actual value
        const price = formatCurrency(params.row.minimumPrice);
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isPriceModified = modifiedFields?.has("minimumPrice");
        return (
          <div
            style={{
              fontWeight: isPriceModified ? "bold" : "normal",
              color: isPriceModified ? "#1c1b1f" : "inherit",
            }}
          >
            {price}
          </div>
        );
      },
    },
    {
      field: "effectiveDate",
      headerName: "Effective Date",
      width: 120,
      flex: 0,
      minWidth: 100,
      // editable: isEditMode, // Disabled direct editing
      type: "date",
      valueGetter: (params: any) => {
        try {
          const value = params.row?.effectiveDate;
          return value ? new Date(value) : null;
        } catch {
          return null;
        }
      },
      valueSetter: (params: any) => {
        if (!params || !params.row) {
          console.error("Invalid params in effectiveDate valueSetter:", params);
          return { id: "temp", effectiveDate: "" };
        }

        try {
          const value = params.value;
          const dateString =
            value instanceof Date ? value.toISOString().split("T")[0] : "";
          return {
            ...params.row,
            effectiveDate: dateString,
            id: params.row.id,
          };
        } catch {
          return { ...params.row, effectiveDate: "", id: params.row.id };
        }
      },
      renderCell: (params: any) => {
        if (!params || !params.row) {
          console.warn("Invalid params in effectiveDate renderCell:", params);
          return <div>-</div>;
        }
        // Get the original value from the row data for display
        const originalValue = params.row.effectiveDate;
        const date = originalValue ? formatDate(originalValue) : "";
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("effectiveDate");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {date}
          </div>
        );
      },
    },
    {
      field: "expirationDate",
      headerName: "Expiry Date",
      width: 120,
      flex: 0,
      minWidth: 100,
      // editable: isEditMode, // Disabled direct editing
      type: "date",
      valueGetter: (params: any) => {
        try {
          const value = params.row?.expirationDate;
          return value ? new Date(value) : null;
        } catch {
          return null;
        }
      },
      valueSetter: (params: any) => {
        if (!params || !params.row) {
          console.error(
            "Invalid params in expirationDate valueSetter:",
            params
          );
          return { id: "temp", expirationDate: "" };
        }

        try {
          const value = params.value;
          const dateString =
            value instanceof Date ? value.toISOString().split("T")[0] : "";
          return {
            ...params.row,
            expirationDate: dateString,
            id: params.row.id,
          };
        } catch {
          return { ...params.row, expirationDate: "", id: params.row.id };
        }
      },
      renderCell: (params: any) => {
        if (!params || !params.row) {
          console.warn("Invalid params in expirationDate renderCell:", params);
          return <div>-</div>;
        }
        // Get the original value from the row data for display
        const originalValue = params.row.expirationDate;
        const date = originalValue ? formatDate(originalValue) : "";
        const modifiedFields = modifiedColumns.get(params.row.id);
        const isModified = modifiedFields?.has("expirationDate");
        return (
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: isModified ? "#1c1b1f" : "inherit",
            }}
          >
            {date}
          </div>
        );
      },
    },
    {
      field: "entryDate",
      headerName: "Entry Date",
      width: 120,
      flex: 0,
      minWidth: 100,
      editable: false,
      renderCell: (params: any) => {
        const date = formatDate(params.value);
        return (
          <div
            style={{
              color: "#666",
              fontStyle: "italic",
              fontSize: "0.875rem",
            }}
          >
            {date}
          </div>
        );
      },
    },
    {
      field: "enteredBy",
      headerName: "Entered By",
      width: 120,
      flex: 0,
      minWidth: 100,
      editable: false,
      renderCell: (params: any) => {
        return (
          <div
            style={{
              color: "#666",
              fontStyle: "italic",
              fontSize: "0.875rem",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: "priceRequestId",
      headerName: "Price Request ID",
      width: 140,
      flex: 0,
      minWidth: 120,
      editable: false,
      renderCell: (params: any) => {
        const requestId = params.value;
        if (!requestId) {
          return (
            <div
              style={{
                color: "#999",
                fontStyle: "italic",
                fontSize: "0.875rem",
              }}
            >
              -
            </div>
          );
        }
        return (
          <Link
            href={`/change-requests/${requestId}`}
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer text-sm"
            style={{
              fontSize: "0.875rem",
            }}
          >
            {requestId}
          </Link>
        );
      },
    },
  ];

  const toggleModifiedRowsFilter = () => {
    setFilters((prev) => ({
      ...prev,
      showModifiedOnly: !prev.showModifiedOnly,
    }));
  };

  const clearFilters = () => {
    setFilters({
      customer: "all",
      customerName: "",
      contractNumber: "",
      profileId: "",
      productName: "",
      status: "all",
      dateFrom: "",
      dateTo: "",
      uom: "all",
      projectName: "",
      generator: "",
      facility: "",
      containerSize: "all",
      showModifiedOnly: false,
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
        "Generator State": item.generatorState || "",
        Facility: item.facilityName || "",
        "Container Size": item.containerSize || "",
        UOM: item.uom || "",
        Price: item.unitPrice,
        Minimum: item.minimumPrice,
        "Effective Date": header?.effectiveDate
          ? formatDate(header.effectiveDate)
          : "",
        "Expiration Date": header?.expirationDate
          ? formatDate(header.expirationDate)
          : "",
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Roboto:Medium',_sans-serif] font-medium text-[32px] leading-[40px] text-[#1c1b1f] mb-2">
                {currentCustomer
                  ? `${currentCustomer.customerName} Pricing`
                  : "All Customer Pricing"}
              </h1>

              <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f] mb-2">
                {currentCustomer
                  ? `View and filter pricing entries for ${currentCustomer.customerName}`
                  : "View and filter pricing entries across all customers, contracts, profiles, and item numbers"}
              </p>

              {/* Active Status Indicator */}
              {currentCustomer && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#65b230] rounded-full"></div>
                  <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#65b230]">
                    Active
                  </span>
                </div>
              )}
            </div>

            {/* Price Header Button */}
            {currentCustomer && (
              <SecondaryButton
                onClick={() => handleOpenPriceHeaderModal()}
                icon={Settings}
                size="small"
              >
                Price Header
              </SecondaryButton>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#b9b9b9] rounded shadow-sm">
          <div className="p-6 border-b border-[#b9b9b9]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[22px] leading-[28px] text-[#1c1b1f]">
                  Price Sheet
                </span>
                <span className="inline-flex items-center bg-[rgba(158,158,158,0.1)] text-[#49454f] rounded-full px-3 py-1 text-xs font-medium border border-[#b9b9b9]">
                  {filteredPriceItems.length} items
                </span>
                {hasUnsavedChanges() && (
                  <span className="inline-flex items-center bg-[rgba(101,178,48,0.1)] text-[#65b230] rounded-full px-3 py-1 text-xs font-medium border border-[#65b230]">
                    {(newRows ? newRows.size : 0) +
                      (modifiedRows ? modifiedRows.size : 0)}{" "}
                    pending changes
                  </span>
                )}
                {isEditMode && (
                  <span className="inline-flex items-center bg-[rgba(25,118,210,0.1)] text-[#1976d2] rounded-full px-3 py-1 text-xs font-medium border border-[#1976d2]">
                    <div className="w-2 h-2 bg-[#1976d2] rounded-full mr-2 animate-pulse"></div>
                    Edit Mode Active
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {isEditMode && (
                  <>
                    <SecondaryButton onClick={handleExitEditMode} icon={X}>
                      Exit Edit Mode
                    </SecondaryButton>
                    {/* Submit Price Change Split Button */}
                    <div className="flex-shrink-0">
                      <ButtonGroup
                        variant="contained"
                        ref={submitMenuAnchorRef}
                        aria-label="split button"
                        style={{
                          backgroundColor: hasUnsavedChanges()
                            ? "#65b230"
                            : "#e0e0e0",
                          borderRadius: "100px",
                          overflow: "hidden",
                        }}
                      >
                        <MuiButton
                          disabled={!hasUnsavedChanges()}
                          onClick={() => handleSubmitOptionClick("submit")}
                          style={{
                            backgroundColor: hasUnsavedChanges()
                              ? "#65b230"
                              : "#e0e0e0",
                            color: hasUnsavedChanges() ? "white" : "#9e9e9e",
                            fontFamily: "Roboto, sans-serif",
                            fontWeight: 500,
                            fontSize: "14px",
                            lineHeight: "21px",
                            textTransform: "uppercase",
                            letterSpacing: "0.1px",
                            border: "none",
                            padding: "8px 16px",
                            minWidth: "auto",
                            cursor: hasUnsavedChanges()
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          <Check
                            className="w-4 h-4 mr-2"
                            style={{
                              color: hasUnsavedChanges() ? "white" : "#9e9e9e",
                            }}
                          />
                          <span>
                            Submit Price Change (
                            {(newRows ? newRows.size : 0) +
                              (modifiedRows ? modifiedRows.size : 0)}
                            )
                          </span>
                        </MuiButton>
                        <MuiButton
                          size="small"
                          disabled={
                            (!newRows || newRows.size === 0) &&
                            (!modifiedRows || modifiedRows.size === 0)
                          }
                          onClick={handleSubmitMenuToggle}
                          aria-controls={
                            submitMenuOpen ? "split-button-menu" : undefined
                          }
                          aria-expanded={submitMenuOpen ? "true" : undefined}
                          aria-label="select submit action"
                          aria-haspopup="menu"
                          style={{
                            backgroundColor:
                              (!newRows || newRows.size === 0) &&
                              (!modifiedRows || modifiedRows.size === 0)
                                ? "#e0e0e0"
                                : "#65b230",
                            color:
                              (!newRows || newRows.size === 0) &&
                              (!modifiedRows || modifiedRows.size === 0)
                                ? "#9e9e9e"
                                : "white",
                            border: "none",
                            padding: "8px 8px",
                            minWidth: "32px",
                            cursor:
                              (!newRows || newRows.size === 0) &&
                              (!modifiedRows || modifiedRows.size === 0)
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          <ChevronDown
                            className="h-4 w-4"
                            style={{
                              color:
                                (!newRows || newRows.size === 0) &&
                                (!modifiedRows || modifiedRows.size === 0)
                                  ? "#9e9e9e"
                                  : "white",
                            }}
                          />
                        </MuiButton>
                      </ButtonGroup>
                      <Popper
                        sx={{
                          zIndex: 1,
                        }}
                        open={submitMenuOpen}
                        anchorEl={submitMenuAnchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                      >
                        {({ TransitionProps, placement }) => (
                          <Grow
                            {...TransitionProps}
                            style={{
                              transformOrigin:
                                placement === "bottom"
                                  ? "center top"
                                  : "center bottom",
                            }}
                          >
                            <Paper>
                              <ClickAwayListener
                                onClickAway={handleSubmitMenuClose}
                              >
                                <MenuList id="split-button-menu" autoFocusItem>
                                  <MenuItem
                                    onClick={() =>
                                      handleSubmitOptionClick("draft")
                                    }
                                    style={{
                                      fontFamily: "Roboto, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                      lineHeight: "21px",
                                    }}
                                  >
                                    Save as Draft
                                  </MenuItem>
                                </MenuList>
                              </ClickAwayListener>
                            </Paper>
                          </Grow>
                        )}
                      </Popper>
                    </div>
                  </>
                )}
                {!isEditMode && (
                  <>
                    <SecondaryButton
                      onClick={handleExportToExcel}
                      icon={Download}
                    >
                      Export Excel
                    </SecondaryButton>
                    <PrimaryButton onClick={handleNewPriceChange} icon={Plus}>
                      New Price Change
                    </PrimaryButton>
                  </>
                )}
              </div>
            </div>

            {/* Primary Filters */}
            <div className="p-6">
              <div className="flex flex-wrap gap-4 items-end mb-4 mt-4">
                {/* Customer Filter */}
                {/* <div>
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
                          {customer.status === "inactive" && " (Inactive)"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div> */}

                {/* Item Name Filter */}
                <div>
                  <TextField
                    label="Item"
                    placeholder="Item..."
                    value={filters.productName}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, productName: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ width: "150px" }}
                  />
                </div>

                {/* Contract Number Filter */}
                {/* <div>
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
                </div> */}

                {/* Profile ID Filter */}
                <div>
                  <TextField
                    label="Profile"
                    placeholder="Profile..."
                    value={filters.profileId}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, profileId: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ width: "150px" }}
                  />
                </div>

                {/* Generator Filter */}
                <div>
                  <TextField
                    label="Generator"
                    placeholder="Generator name or state..."
                    value={filters.generator || ""}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, generator: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ width: "180px" }}
                  />
                </div>

                {/* Project Name Filter */}
                <div>
                  <TextField
                    label="Project Name"
                    placeholder="Project name..."
                    value={filters.projectName}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, projectName: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ width: "150px" }}
                  />
                </div>

                {/* Facility Filter */}
                <div>
                  <TextField
                    label="Facility"
                    placeholder="Facility..."
                    value={filters.facility || ""}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, facility: e.target.value }))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ width: "150px" }}
                  />
                </div>

                {/* Status Filter */}

                {/* <FormControl size="small" sx={{ width: "140px" }}>
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
                </FormControl> */}

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

                {/* Modified Button - Only show in edit mode */}
                {isEditMode && (
                  <SecondaryButton
                    onClick={toggleModifiedRowsFilter}
                    className={`${
                      filters.showModifiedOnly
                        ? "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                        : ""
                    }`}
                  >
                    Modified (
                    {(newRows ? newRows.size : 0) +
                      (modifiedRows ? modifiedRows.size : 0)}
                    )
                  </SecondaryButton>
                )}
              </div>

              {/* Active Filters Chips */}
              {Object.entries(filters).some(([key, value]) => {
                // For showModifiedOnly, only show if it's true AND we're in edit mode
                if (key === "showModifiedOnly") {
                  return value === true && isEditMode;
                }
                // For other filters, show if they have a value
                return (
                  ["all", "", undefined, null].indexOf(value as any) === -1
                );
              }) && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 items-center p-3 rounded-md bg-[rgba(101,178,48,0.08)] border border-[rgba(101,178,48,0.2)]">
                    {Object.entries(filters)
                      .filter(([key, value]) => {
                        // For showModifiedOnly, only show if it's true AND we're in edit mode
                        if (key === "showModifiedOnly") {
                          return value === true && isEditMode;
                        }
                        // For other filters, show if they have a value
                        return (
                          ["all", "", undefined, null].indexOf(value as any) ===
                          -1
                        );
                      })
                      .map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center bg-white text-[#1c1b1f] rounded px-2 py-1 text-xs font-medium shadow-sm"
                        >
                          {key === "showModifiedOnly"
                            ? "Show Modified Only"
                            : key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                          {key !== "showModifiedOnly" && `: ${value}`}
                          <IconButton
                            size="small"
                            onClick={() =>
                              setFilters((f) => ({
                                ...f,
                                [key]:
                                  key === "showModifiedOnly"
                                    ? false
                                    : key === "status" ||
                                      key === "uom" ||
                                      key === "region" ||
                                      key === "customer"
                                    ? "all"
                                    : "",
                              }))
                            }
                            aria-label={`Remove filter ${key}`}
                            sx={{
                              ml: 0.5,
                              color: "#1c1b1f",
                              "&:hover": {
                                color: "#65b230",
                              },
                            }}
                          >
                            ×
                          </IconButton>
                        </span>
                      ))}
                    <SecondaryButton
                      onClick={clearFilters}
                      sx={{
                        ml: 1,
                        fontSize: "12px",
                        height: "28px",
                        px: 1.5,
                      }}
                    >
                      Clear Filters
                    </SecondaryButton>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Items Table */}
            <div className="p-6">
              {/* Edit Mode Actions - Sticky positioned */}
              {isEditMode && (
                <div
                  className="sticky top-0 z-40 mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
                  style={{
                    backgroundColor: "rgba(249, 250, 251, 0.98)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {/* Essential Edit Mode Actions - Always Visible */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#1c1b1f",
                          fontWeight: 600,
                          fontSize: "16px",
                        }}
                      >
                        Edit Mode
                      </Typography>
                    </div>

                    {/* Action Buttons - Always Accessible */}
                    <div className="flex items-center space-x-3">
                      {/* Color Legend - Compact with Counts */}
                      <div className="flex items-center space-x-3 text-xs">
                        {newRows.size > 0 && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">
                              New ({newRows.size})
                            </span>
                          </div>
                        )}
                        {modifiedRows.size > 0 && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-gray-600">
                              Modified ({modifiedRows.size})
                            </span>
                          </div>
                        )}
                      </div>

                      <PrimaryButton
                        onClick={handleAddNewEntry}
                        disabled={false}
                        icon={Plus}
                        size="small"
                      >
                        Add Line
                      </PrimaryButton>

                      <SecondaryButton
                        onClick={handleEditSelected}
                        disabled={getSelectedRowIds().length === 0}
                        icon={PenSquare}
                        size="small"
                      >
                        {getSelectedRowIds().length === 1
                          ? "Edit"
                          : "Bulk Edit"}{" "}
                        ({getSelectedRowIds().length})
                      </SecondaryButton>
                      <SecondaryButton
                        onClick={handleDeleteSelected}
                        disabled={getSelectedRowIds().length === 0}
                        icon={Trash2}
                        size="small"
                        sx={{
                          borderColor: "#d32f2f",
                          color: "#d32f2f",
                          "&:hover": {
                            borderColor: "#b71c1c",
                            color: "#b71c1c",
                            backgroundColor: "rgba(211, 47, 47, 0.04)",
                          },
                          "&:disabled": {
                            borderColor: "#e0e0e0",
                            color: "#9e9e9e",
                          },
                        }}
                      >
                        Delete ({getSelectedRowIds().length})
                      </SecondaryButton>
                    </div>
                  </div>

                  {/* Price Change Configuration - Compact Summary */}
                  {currentPriceChangeConfig && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#666",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          Price Change Configuration:{" "}
                          {currentPriceChangeConfig.excelUploadMode === "upload"
                            ? "Excel Upload"
                            : "Manual Entry"}{" "}
                          {currentPriceChangeConfig.selectedRequests.length >
                            0 && (
                            <>
                              {" "}
                              •{" "}
                              <Box sx={{ display: "inline-flex", gap: 1 }}>
                                {currentPriceChangeConfig.selectedRequests.map(
                                  (requestId) => {
                                    const request = priceChangeRequests.find(
                                      (r) => r.id === requestId
                                    );
                                    return request ? (
                                      <Chip
                                        key={requestId}
                                        label={`${request.id}: ${request.title}`}
                                        size="small"
                                        component={Link}
                                        href={`/change-requests/${request.id}`}
                                        sx={{
                                          backgroundColor: "#65b230",
                                          color: "white",
                                          fontSize: "12px",
                                          cursor: "pointer",
                                          "&:hover": {
                                            backgroundColor: "#4a8a1f",
                                          },
                                        }}
                                      />
                                    ) : null;
                                  }
                                )}
                              </Box>
                            </>
                          )}
                        </Typography>
                      </div>
                    </div>
                  )}
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
                  <div style={{ width: "100%", height: "600px" }}>
                    <DataGrid
                      key={`datagrid-${modifiedRows.size}-${
                        modifiedColumns.size
                      }-${newRows.size}-${
                        newRowId || "no-new"
                      }-${forceRerender}`}
                      rows={rows || []}
                      columns={columns || []}
                      getRowId={(row) => row.id}
                      density="comfortable"
                      editMode="cell"
                      processRowUpdate={(newRow, oldRow) => {
                        console.log("Processing row update:", {
                          newRow,
                          oldRow,
                          newRowId: newRow?.id,
                          oldRowId: oldRow?.id,
                          newRowKeys: Object.keys(newRow || {}),
                          oldRowKeys: Object.keys(oldRow || {}),
                        });

                        // Ensure the row has an ID
                        if (!newRow?.id) {
                          console.error("Row update missing ID:", newRow);
                          toast.error("Row update failed: missing ID");
                          return oldRow; // Return the old row to prevent the update
                        }

                        // If this is a new entry row, handle it specially
                        if (newRow.isNewEntry) {
                          // Update the local state
                          setAllPricingData((prev) => {
                            const updated = {
                              ...prev,
                              priceItems: prev.priceItems.map((item) =>
                                item.priceItemId === newRow.id
                                  ? {
                                      ...item,
                                      productName: newRow.productName || "",
                                      profileId: newRow.profileId || "",
                                      generatorId: newRow.generatorId || "",
                                      contractId: newRow.contractId || "",
                                      projectName: newRow.projectName || "",
                                      region: newRow.region || "North",
                                      facilityName: newRow.facilityName || "",
                                      containerSize: newRow.containerSize || "",
                                      uom: newRow.uom || "",
                                      unitPrice:
                                        parseFloat(newRow.unitPrice) || 0,
                                      minimumPrice:
                                        parseFloat(newRow.minimumPrice) || 0,
                                      effectiveDate: newRow.effectiveDate || "",
                                      expirationDate:
                                        newRow.expirationDate || "",
                                      updatedAt: new Date().toISOString(),
                                    }
                                  : item
                              ),
                            };
                            return updated;
                          });

                          // Mark as modified
                          setModifiedRows(
                            (prev) => new Set([...prev, newRow.id])
                          );

                          return newRow;
                        }

                        // For existing rows, handle normal updates
                        if (oldRow.isModified !== newRow.isModified) {
                          setModifiedRows((prev) => {
                            const updated = new Set(prev);
                            if (newRow.isModified) {
                              updated.add(newRow.id);
                            } else {
                              updated.delete(newRow.id);
                            }
                            return updated;
                          });
                        }

                        // Always return the new row with the ID preserved
                        return { ...newRow, id: newRow.id };
                      }}
                      onProcessRowUpdateError={(error) => {
                        console.error("Row update error:", error);
                        toast.error("Failed to update row. Please try again.");
                      }}
                      getRowClassName={(params: any) => {
                        // Add special styling for different row types
                        if (params.row.isNew) {
                          return "new-row";
                        }
                        if (params.row.isModified) {
                          return "modified-row";
                        }
                        return "";
                      }}
                      sx={{
                        "& .new-row": {
                          backgroundColor: "#f0fff4",
                          "&:hover": {
                            backgroundColor: "#ecfdf5",
                          },
                        },
                        "& .modified-row": {
                          backgroundColor: "#fef3c7",
                          "&:hover": {
                            backgroundColor: "#fefce8",
                          },
                        },
                        "& .MuiDataGrid-cell": {
                          fontSize: "0.875rem",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                        },
                        "& .MuiDataGrid-cell:first-of-type": {
                          padding: "12px 8px",
                          minWidth: "60px",
                          maxWidth: "60px",
                        },
                        "& .MuiDataGrid-columnHeader": {
                          fontSize: "0.875rem",
                          padding: "12px 16px",
                          backgroundColor: "#E0E0E0",
                          borderBottom: "2px solid #65B230 !important",
                        },
                        "& .MuiDataGrid-columnHeader:first-of-type": {
                          padding: "12px 8px",
                          minWidth: "60px",
                          maxWidth: "60px",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          borderBottom: "2px solid #65B230 !important",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          backgroundColor: "#E0E0E0",
                        },
                      }}
                      disableRowSelectionOnClick={true}
                      // Disabled direct cell editing - users must use modals
                      // isCellEditable={(params) => {
                      //   // Only allow editing when in edit mode and not for certain columns
                      //   if (!isEditMode) return false;
                      //
                      //   // Don't allow editing for selection column, entry date, entered by, or price request ID
                      //   if (
                      //     params.field === "selection" ||
                      //     params.field === "entryDate" ||
                      //     params.field === "enteredBy"
                      //   ) {
                      //     return false;
                      //   }
                      //
                      //   return true;
                      // }}
                      disableColumnMenu={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Edit Dialog */}
        <Dialog
          open={applyChangesDialogOpen}
          onClose={() => setApplyChangesDialogOpen(false)}
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
            Bulk Edit Selected Rows ({getSelectedRowIds().length})
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

              {/* Unit Price with Inline Toggle */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Unit Price
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUnitPriceEditMode("absolute");
                        setBulkEditForm((prev) => ({
                          ...prev,
                          unitPricePercentageIncrease: "",
                        }));
                      }}
                      className={`px-2 py-1 text-xs rounded-l border transition-colors ${
                        unitPriceEditMode === "absolute"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      $
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUnitPriceEditMode("percentage");
                        setBulkEditForm((prev) => ({
                          ...prev,
                          unitPrice: "",
                        }));
                      }}
                      className={`px-2 py-1 text-xs rounded-r border-l-0 border transition-colors ${
                        unitPriceEditMode === "percentage"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>
                {unitPriceEditMode === "absolute" ? (
                  <TextField
                    type="number"
                    value={bulkEditForm.unitPrice}
                    onChange={(e) => {
                      setBulkEditForm((prev) => ({
                        ...prev,
                        unitPrice: e.target.value,
                      }));
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Enter new unit price"
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Set absolute unit price"
                  />
                ) : (
                  <TextField
                    type="number"
                    value={bulkEditForm.unitPricePercentageIncrease}
                    onChange={(e) => {
                      setBulkEditForm((prev) => ({
                        ...prev,
                        unitPricePercentageIncrease: e.target.value,
                      }));
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="e.g., 5 for 5% increase"
                    inputProps={{ min: 0, step: 0.1 }}
                    helperText="Enter percentage to increase existing price"
                  />
                )}
              </div>

              {/* Minimum Price with Inline Toggle */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Minimum Price
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMinimumPriceEditMode("absolute");
                        setBulkEditForm((prev) => ({
                          ...prev,
                          minimumPricePercentageIncrease: "",
                        }));
                      }}
                      className={`px-2 py-1 text-xs rounded-l border transition-colors ${
                        minimumPriceEditMode === "absolute"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      $
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMinimumPriceEditMode("percentage");
                        setBulkEditForm((prev) => ({
                          ...prev,
                          minimumPrice: "",
                        }));
                      }}
                      className={`px-2 py-1 text-xs rounded-r border-l-0 border transition-colors ${
                        minimumPriceEditMode === "percentage"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>
                {minimumPriceEditMode === "absolute" ? (
                  <TextField
                    type="number"
                    value={bulkEditForm.minimumPrice}
                    onChange={(e) => {
                      setBulkEditForm((prev) => ({
                        ...prev,
                        minimumPrice: e.target.value,
                      }));
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Enter new minimum price"
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Set absolute minimum price"
                  />
                ) : (
                  <TextField
                    type="number"
                    value={bulkEditForm.minimumPricePercentageIncrease}
                    onChange={(e) => {
                      setBulkEditForm((prev) => ({
                        ...prev,
                        minimumPricePercentageIncrease: e.target.value,
                      }));
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="e.g., 5 for 5% increase"
                    inputProps={{ min: 0, step: 0.1 }}
                    helperText="Enter percentage to increase existing minimum price"
                  />
                )}
              </div>

              {/* Effective Date */}
              <TextField
                label="Effective Date"
                type="date"
                value={bulkEditForm.effectiveDate}
                onChange={(e) =>
                  setBulkEditForm((prev) => ({
                    ...prev,
                    effectiveDate: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Keep existing"
                InputLabelProps={{ shrink: true }}
              />

              {/* Expiration Date */}
              <TextField
                label="Expiration Date"
                type="date"
                value={bulkEditForm.expirationDate}
                onChange={(e) =>
                  setBulkEditForm((prev) => ({
                    ...prev,
                    expirationDate: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Keep existing"
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <SecondaryButton
              onClick={() => {
                setApplyChangesDialogOpen(false);
                // Reset the bulk edit form when canceling
                setBulkEditForm({
                  containerSize: "",
                  uom: "",
                  generatorState: "",
                  unitPrice: "",
                  unitPricePercentageIncrease: "",
                  minimumPrice: "",
                  minimumPricePercentageIncrease: "",
                  effectiveDate: "",
                  expirationDate: "",
                });
              }}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleApplyChangesSubmit}>
              Apply Changes
            </PrimaryButton>
          </DialogActions>
        </Dialog>

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
              {/* Container Size Filter */}
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel
                  sx={{
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Container Size
                </InputLabel>
                <Select
                  value={filters.containerSize || "all"}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      containerSize: e.target.value,
                    }))
                  }
                  label="Container Size"
                >
                  <MenuItem value="all">All Container Sizes</MenuItem>
                  {getUniqueContainerSizes().map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* UOM Filter */}
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel
                  sx={{
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Unit of Measure
                </InputLabel>
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

              {/* Date Range */}
              <div>
                <div className="grid grid-cols-2 gap-4">
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
              <div>
                <div className="grid grid-cols-2 gap-4">
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
            <SecondaryButton onClick={() => setAdvancedFiltersOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={() => setAdvancedFiltersOpen(false)}>
              Apply Filters
            </PrimaryButton>
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
            Select Price Request
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[22.86px] text-[#49454f]">
                Choose a price change request to associate with your new price
                change action. Select one request using the radio buttons:
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
                            {request.id}: {request.title}
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
                                  : request.status === "Incomplete"
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
                                  : request.status === "Incomplete"
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
                        <Radio
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
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <SecondaryButton onClick={handleCancelPriceChange}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={handleCreatePriceChange}
              disabled={selectedPriceChangeRequests.length === 0}
            >
              Continue
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Price Change Configuration Dialog */}
        <Dialog
          open={priceChangeConfigDialogOpen}
          onClose={() => {}} // Prevent closing by clicking outside
          maxWidth="md"
          fullWidth
          disableEscapeKeyDown
        >
          <DialogTitle
            sx={{
              fontFamily: "Roboto:Medium, sans-serif",
              fontWeight: 500,
              fontSize: "22px",
              lineHeight: "28px",
              color: "#1c1b1f",
              pb: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Configure Price Entry
            <IconButton
              onClick={handleCancelPriceChangeConfig}
              sx={{
                color: "#666",
                "&:hover": {
                  color: "#1c1b1f",
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <X size={20} />
            </IconButton>
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
                Selected Price Request
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedPriceChangeRequests.map((requestId) => {
                  const request = priceChangeRequests.find(
                    (r) => r.id === requestId
                  );
                  return request ? (
                    <Chip
                      key={requestId}
                      label={`${request.id}: ${request.title}`}
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

            {/* Import Options Toggle */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1c1b1f", fontWeight: 600 }}
              >
                Entry Options
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "#666" }}>
                Choose how you'd like to proceed with the price change. You can
                upload an Excel template or start with manual entry.
              </Typography>

              {/* Toggle Buttons */}
              <Box sx={{ mb: 3 }}>
                <ButtonGroup variant="outlined" sx={{ width: "100%" }}>
                  <MuiButton
                    onClick={() => setExcelUploadMode("upload")}
                    sx={{
                      flex: 1,
                      backgroundColor:
                        excelUploadMode === "upload"
                          ? "#65b230"
                          : "transparent",
                      color: excelUploadMode === "upload" ? "white" : "#1c1b1f",
                      borderColor: "#65b230",
                      "&:hover": {
                        backgroundColor:
                          excelUploadMode === "upload"
                            ? "#5a9e2a"
                            : "rgba(101,178,48,0.04)",
                        borderColor: "#65b230",
                      },
                      textTransform: "none",
                      py: 1.5,
                    }}
                  >
                    <Upload size={16} style={{ marginRight: "8px" }} />
                    Excel Upload
                  </MuiButton>
                  <MuiButton
                    onClick={() => setExcelUploadMode("manual")}
                    sx={{
                      flex: 1,
                      backgroundColor:
                        excelUploadMode === "manual"
                          ? "#65b230"
                          : "transparent",
                      color: excelUploadMode === "manual" ? "white" : "#1c1b1f",
                      borderColor: "#65b230",
                      "&:hover": {
                        backgroundColor:
                          excelUploadMode === "manual"
                            ? "#5a9e2a"
                            : "rgba(101,178,48,0.04)",
                        borderColor: "#65b230",
                      },
                      textTransform: "none",
                      py: 1.5,
                    }}
                  >
                    <PenSquare size={16} style={{ marginRight: "8px" }} />
                    Manual Entry
                  </MuiButton>
                </ButtonGroup>
              </Box>

              {/* Excel Upload Section - Always visible when upload mode is selected */}
              {excelUploadMode === "upload" && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: "#1c1b1f", fontWeight: 600 }}
                  >
                    Upload Excel Template
                  </Typography>

                  {/* Download Template Section */}

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#65b230",
                      cursor: "pointer",
                      textDecoration: "underline",
                      "&:hover": {
                        color: "#4a7c59",
                      },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      pb: 2,
                    }}
                    onClick={() => {
                      // Create a basic Excel template with sample headers
                      const templateData = [
                        [
                          "Customer ID",
                          "Product Name",
                          "Unit Price",
                          "Minimum Price",
                          "UOM",
                          "Generator State",
                          "Effective Date",
                          "Notes",
                        ],
                        [
                          "CUST-001",
                          "Sample Product",
                          "10.00",
                          "5.00",
                          "EA",
                          "CA",
                          "2024-01-01",
                          "Example entry",
                        ],
                        ["", "", "", "", "", "", "", ""],
                        ["", "", "", "", "", "", "", ""],
                      ];

                      const ws = XLSX.utils.aoa_to_sheet(templateData);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Pricing Template");

                      // Download the file
                      XLSX.writeFile(wb, "pricing_template.xlsx");
                    }}
                  >
                    <Download size={16} />
                    Download Example Template
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <input
                      accept=".xlsx,.xls"
                      style={{ display: "none" }}
                      id="excel-file-upload"
                      type="file"
                      onChange={handleExcelFileUpload}
                    />
                    <label htmlFor="excel-file-upload">
                      <Card
                        sx={{
                          cursor: "pointer",
                          border: excelFile
                            ? "2px solid #65b230"
                            : "2px dashed #e0e0e0",
                          backgroundColor: excelFile
                            ? "rgba(101,178,48,0.08)"
                            : "transparent",
                          "&:hover": {
                            borderColor: "#65b230",
                            backgroundColor: "rgba(101,178,48,0.04)",
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <CardContent sx={{ p: 3, textAlign: "center" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Upload
                              size={24}
                              color={excelFile ? "#65b230" : "#666"}
                            />
                            <Typography
                              variant="h6"
                              sx={{ color: excelFile ? "#65b230" : "#666" }}
                            >
                              {excelFile
                                ? excelFile.name
                                : "Click to upload Excel file"}
                            </Typography>
                          </Box>
                          {!excelFile && (
                            <Typography variant="body2" sx={{ color: "#666" }}>
                              Supported formats: .xlsx, .xls
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </label>
                  </Box>
                </Box>
              )}

              {/* Manual Entry Section - Always visible when manual mode is selected */}
              {excelUploadMode === "manual" && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: "#1c1b1f", fontWeight: 600 }}
                  >
                    Manual Entry
                  </Typography>
                  <Card
                    sx={{ bgcolor: "#f8f9fa", border: "1px solid #e9ecef" }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <PenSquare size={20} color="#65b230" />
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#1c1b1f", fontWeight: 600 }}
                        >
                          Ready for Manual Entry
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        You can proceed with manual price entry. The pricing
                        grid will be available for direct editing once you begin
                        the price change.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <SecondaryButton onClick={handleBackToPriceChangeSelection}>
              Back to Selection
            </SecondaryButton>
            <PrimaryButton onClick={handlePriceChangeConfigSubmit}>
              Begin Price Entry
            </PrimaryButton>
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

              {/* Unit Price with Inline Toggle */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Unit Price
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUnitPriceEditMode("absolute");
                        setBulkEditForm((prev) => ({
                          ...prev,
                          unitPricePercentageIncrease: "",
                        }));
                      }}
                      className={`px-2 py-1 text-xs rounded-l border transition-colors ${
                        unitPriceEditMode === "absolute"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      $
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUnitPriceEditMode("percentage");
                        setBulkEditForm((prev) => ({ ...prev, unitPrice: "" }));
                      }}
                      className={`px-2 py-1 text-xs rounded-r border-l-0 border transition-colors ${
                        unitPriceEditMode === "percentage"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>
                {unitPriceEditMode === "absolute" ? (
                  <TextField
                    type="number"
                    value={bulkEditForm.unitPrice}
                    onChange={(e) => {
                      setBulkEditForm((prev) => ({
                        ...prev,
                        unitPrice: e.target.value,
                      }));
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Enter new unit price"
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Set absolute unit price"
                  />
                ) : (
                  <TextField
                    type="number"
                    value={bulkEditForm.unitPricePercentageIncrease}
                    onChange={(e) => {
                      setBulkEditForm((prev) => ({
                        ...prev,
                        unitPricePercentageIncrease: e.target.value,
                      }));
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="e.g., 5 for 5% increase"
                    inputProps={{ min: 0, step: 0.1 }}
                    helperText={
                      bulkEditForm.unitPricePercentageIncrease
                        ? getUnitPricePreview(
                            bulkEditForm.unitPricePercentageIncrease,
                            selectedRows
                          )
                        : "Enter percentage to increase existing price"
                    }
                  />
                )}
              </div>

              {/* Minimum Price with Inline Toggle */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Minimum Price
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMinimumPriceEditMode("absolute");
                        setBulkEditForm((prev) => ({
                          ...prev,
                          minimumPricePercentageIncrease: "",
                        }));
                      }}
                      className={`px-2 py-1 text-xs rounded-l border transition-colors ${
                        minimumPriceEditMode === "absolute"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      $
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMinimumPriceEditMode("percentage");
                        setBulkEditForm((prev) => ({
                          ...prev,
                          minimumPrice: "",
                        }));
                      }}
                      className={`px-2 py-1 text-xs rounded-r border-l-0 border transition-colors ${
                        minimumPriceEditMode === "percentage"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>
                {minimumPriceEditMode === "absolute" ? (
                  <TextField
                    type="number"
                    value={bulkEditForm.minimumPrice}
                    onChange={(e) => {
                      setBulkEditForm((prev) => ({
                        ...prev,
                        minimumPrice: e.target.value,
                      }));
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Enter new minimum price"
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Set absolute minimum price"
                  />
                ) : (
                  <TextField
                    type="number"
                    value={bulkEditForm.minimumPricePercentageIncrease}
                    onChange={(e) => {
                      setBulkEditForm((prev) => ({
                        ...prev,
                        minimumPricePercentageIncrease: e.target.value,
                      }));
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="e.g., 5 for 5% increase"
                    inputProps={{ min: 0, step: 0.1 }}
                    helperText={
                      bulkEditForm.minimumPricePercentageIncrease
                        ? getMinimumPricePreview(
                            bulkEditForm.minimumPricePercentageIncrease,
                            selectedRows
                          )
                        : "Enter percentage to increase existing minimum price"
                    }
                  />
                )}
              </div>

              {/* Effective Date */}
              <TextField
                label="Effective Date"
                type="date"
                value={bulkEditForm.effectiveDate}
                onChange={(e) =>
                  setBulkEditForm((prev) => ({
                    ...prev,
                    effectiveDate: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Keep existing"
                InputLabelProps={{ shrink: true }}
              />

              {/* Expiration Date */}
              <TextField
                label="Expiration Date"
                type="date"
                value={bulkEditForm.expirationDate}
                onChange={(e) =>
                  setBulkEditForm((prev) => ({
                    ...prev,
                    expirationDate: e.target.value,
                  }))
                }
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Keep existing"
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <SecondaryButton onClick={handleApplyChangesCancel}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleApplyChangesSubmit}>
              Apply Changes
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Exit Edit Mode Confirmation Dialog */}
        <Dialog
          open={exitEditModeConfirmOpen}
          onClose={() => setExitEditModeConfirmOpen(false)}
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
            Unsaved Changes
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You have unsaved changes that will be lost if you exit edit mode:
            </Typography>
            <div className="space-y-2">
              {newRows && newRows.size > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">
                    {newRows.size} new entr{newRows.size === 1 ? "y" : "ies"} to
                    be added
                  </span>
                </div>
              )}
              {modifiedRows && modifiedRows.size > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">
                    {modifiedRows.size} entr
                    {modifiedRows.size === 1 ? "y" : "ies"} with modifications
                  </span>
                </div>
              )}
            </div>
            <Typography variant="body2" sx={{ mt: 3, color: "#666" }}>
              Are you sure you want to exit edit mode and lose these changes?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <SecondaryButton onClick={() => setExitEditModeConfirmOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={exitEditMode}
              sx={{
                backgroundColor: "#dc2626",
                "&:hover": { backgroundColor: "#b91c1c" },
              }}
            >
              Exit Without Saving
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Submit Price Change Confirmation Dialog */}
        <Dialog
          open={submitPriceChangeConfirmOpen}
          onClose={() => setSubmitPriceChangeConfirmOpen(false)}
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
            Submit Price Change
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are about to submit the following changes:
            </Typography>
            <div className="space-y-2">
              {newRows && newRows.size > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">
                    {newRows.size} new entr{newRows.size === 1 ? "y" : "ies"} to
                    be added
                  </span>
                </div>
              )}
              {modifiedRows && modifiedRows.size > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">
                    {modifiedRows.size} entr
                    {modifiedRows.size === 1 ? "y" : "ies"} with modifications
                  </span>
                </div>
              )}
            </div>
            <Typography variant="body2" sx={{ mt: 3, color: "#666" }}>
              This action will submit all price modifications. Are you sure you
              want to proceed?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <SecondaryButton
              onClick={() => setSubmitPriceChangeConfirmOpen(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={submitPriceChange}>
              Submit Price Change
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={handleDeleteCancel}
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
            Delete Selected Items
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are about to delete the following items:
            </Typography>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">
                {getSelectedRowIds().length} item
                {getSelectedRowIds().length === 1 ? "" : "s"} selected for
                deletion
              </span>
            </div>
            <Typography variant="body2" sx={{ color: "#666" }}>
              This action cannot be undone. Are you sure you want to proceed?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <SecondaryButton onClick={handleDeleteCancel}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={handleDeleteConfirm}
              sx={{
                backgroundColor: "#d32f2f",
                "&:hover": { backgroundColor: "#b71c1c" },
              }}
            >
              Delete Items
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Delete Validation Error Dialog */}
        <Dialog
          open={deleteValidationErrorOpen}
          onClose={() => setDeleteValidationErrorOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              fontFamily: "Roboto:Medium, sans-serif",
              fontWeight: 500,
              fontSize: "22px",
              lineHeight: "28px",
              color: "#d32f2f",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <AlertCircle className="h-6 w-6 text-[#d32f2f]" />
            Cannot Delete Selected Items
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 3, color: "#1c1b1f" }}>
              You cannot delete {validationErrorDetails.count} selected item
              {validationErrorDetails.count === 1 ? "" : "s"} because they have
              effective dates on or before today's date.
            </Typography>

            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: "#666", fontWeight: 600 }}
            >
              Why can't these items be deleted?
            </Typography>

            <div className="bg-[#fff3e0] border border-[#ffb74d] rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#f57c00] mt-0.5 flex-shrink-0" />
                <div>
                  <Typography
                    variant="body2"
                    sx={{ color: "#e65100", fontWeight: 600, mb: 1 }}
                  >
                    Active or Past Effective Dates
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#666", lineHeight: 1.5 }}
                  >
                    Items with effective dates on or before today cannot be
                    deleted to maintain data integrity and prevent disruption to
                    active pricing agreements.
                  </Typography>
                </div>
              </div>
            </div>

            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: "#666", fontWeight: 600 }}
            >
              What you can do:
            </Typography>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#65b230] rounded-full"></div>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Only select items with future effective dates for deletion
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#65b230] rounded-full"></div>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Use the "Effective Date" filter to find items with future
                  dates
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#65b230] rounded-full"></div>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Contact your administrator if you need to modify active
                  pricing
                </Typography>
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <PrimaryButton
              onClick={() => setDeleteValidationErrorOpen(false)}
              sx={{
                backgroundColor: "#65b230",
                "&:hover": { backgroundColor: "#5a9e2a" },
              }}
            >
              I Understand
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Add New Entry Form Dialog */}
        <Dialog
          open={showNewEntryForm}
          onClose={handleCancelNewEntry}
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
            Add New Price Entry
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 4 }}>
            <div className="pt-4 grid grid-cols-2 gap-4">
              {/* Product Name */}
              <TextField
                label="Product Name *"
                value={newEntryData.productName || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("productName", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                required
              />

              {/* Unit Price */}
              <TextField
                label="Unit Price *"
                type="number"
                value={newEntryData.unitPrice || ""}
                onChange={(e) =>
                  handleNewEntryCellEdit("unitPrice", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />

              {/* Minimum Price */}
              <TextField
                label="Minimum Price *"
                type="number"
                value={newEntryData.minimumPrice || ""}
                onChange={(e) =>
                  handleNewEntryCellEdit("minimumPrice", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />

              {/* Container Size */}
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Container Size</InputLabel>
                <Select
                  value={newEntryData.containerSize || ""}
                  onChange={(e) =>
                    handleNewEntryCellEdit("containerSize", e.target.value)
                  }
                  label="Container Size"
                >
                  <MenuItem value="">Select Container Size</MenuItem>
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
                  value={newEntryData.uom || ""}
                  onChange={(e) =>
                    handleNewEntryCellEdit("uom", e.target.value)
                  }
                  label="UOM"
                >
                  <MenuItem value="">Select UOM</MenuItem>
                  <MenuItem value="Each">Each</MenuItem>
                  <MenuItem value="Gallon">Gallon</MenuItem>
                  <MenuItem value="Pound">Pound</MenuItem>
                  <MenuItem value="Container">Container</MenuItem>
                  <MenuItem value="Ton">Ton</MenuItem>
                </Select>
              </FormControl>

              {/* Project Name */}
              <TextField
                label="Project Name"
                value={newEntryData.projectName || ""}
                onChange={(e) =>
                  handleNewEntryCellEdit("projectName", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Profile ID */}
              <TextField
                label="Profile ID"
                value={newEntryData.profileId || ""}
                onChange={(e) =>
                  handleNewEntryCellEdit("profileId", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Generator ID */}
              <TextField
                label="Generator ID"
                value={newEntryData.generatorId || ""}
                onChange={(e) =>
                  handleNewEntryCellEdit("generatorId", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Generator State */}
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Generator State</InputLabel>
                <Select
                  value={newEntryData.generatorState || ""}
                  onChange={(e) =>
                    handleNewEntryCellEdit("generatorState", e.target.value)
                  }
                  label="Generator State"
                >
                  <MenuItem value="">Select State</MenuItem>
                  <MenuItem value="AL">AL</MenuItem>
                  <MenuItem value="AK">AK</MenuItem>
                  <MenuItem value="AZ">AZ</MenuItem>
                  <MenuItem value="AR">AR</MenuItem>
                  <MenuItem value="CA">CA</MenuItem>
                  <MenuItem value="CO">CO</MenuItem>
                  <MenuItem value="CT">CT</MenuItem>
                  <MenuItem value="DE">DE</MenuItem>
                  <MenuItem value="FL">FL</MenuItem>
                  <MenuItem value="GA">GA</MenuItem>
                  <MenuItem value="HI">HI</MenuItem>
                  <MenuItem value="ID">ID</MenuItem>
                  <MenuItem value="IL">IL</MenuItem>
                  <MenuItem value="IN">IN</MenuItem>
                  <MenuItem value="IA">IA</MenuItem>
                  <MenuItem value="KS">KS</MenuItem>
                  <MenuItem value="KY">KY</MenuItem>
                  <MenuItem value="LA">LA</MenuItem>
                  <MenuItem value="ME">ME</MenuItem>
                  <MenuItem value="MD">MD</MenuItem>
                  <MenuItem value="MA">MA</MenuItem>
                  <MenuItem value="MI">MI</MenuItem>
                  <MenuItem value="MN">MN</MenuItem>
                  <MenuItem value="MS">MS</MenuItem>
                  <MenuItem value="MO">MO</MenuItem>
                  <MenuItem value="MT">MT</MenuItem>
                  <MenuItem value="NE">NE</MenuItem>
                  <MenuItem value="NV">NV</MenuItem>
                  <MenuItem value="NH">NH</MenuItem>
                  <MenuItem value="NJ">NJ</MenuItem>
                  <MenuItem value="NM">NM</MenuItem>
                  <MenuItem value="NY">NY</MenuItem>
                  <MenuItem value="NC">NC</MenuItem>
                  <MenuItem value="ND">ND</MenuItem>
                  <MenuItem value="OH">OH</MenuItem>
                  <MenuItem value="OK">OK</MenuItem>
                  <MenuItem value="OR">OR</MenuItem>
                  <MenuItem value="PA">PA</MenuItem>
                  <MenuItem value="RI">RI</MenuItem>
                  <MenuItem value="SC">SC</MenuItem>
                  <MenuItem value="SD">SD</MenuItem>
                  <MenuItem value="TN">TN</MenuItem>
                  <MenuItem value="TX">TX</MenuItem>
                  <MenuItem value="UT">UT</MenuItem>
                  <MenuItem value="VT">VT</MenuItem>
                  <MenuItem value="VA">VA</MenuItem>
                  <MenuItem value="WA">WA</MenuItem>
                  <MenuItem value="WV">WV</MenuItem>
                  <MenuItem value="WI">WI</MenuItem>
                  <MenuItem value="WY">WY</MenuItem>
                </Select>
              </FormControl>

              {/* Contract ID */}
              <TextField
                label="Contract ID"
                value={newEntryData.contractId || ""}
                onChange={(e) =>
                  handleNewEntryCellEdit("contractId", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Facility Name */}
              <TextField
                label="Facility Name"
                value={newEntryData.facilityName || ""}
                onChange={(e) =>
                  handleNewEntryCellEdit("facilityName", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Effective Date */}
              <TextField
                label="Effective Date"
                type="date"
                value={newEntryData.effectiveDate || ""}
                onChange={(e) =>
                  handleNewEntryCellEdit("effectiveDate", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              {/* Expiration Date */}
              <TextField
                label="Expiration Date"
                type="date"
                value={newEntryData.expirationDate || ""}
                onChange={(e) =>
                  handleNewEntryCellEdit("expirationDate", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <SecondaryButton onClick={handleCancelNewEntry}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleAddNewEntry}>Add Line</PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Edit Entry Form Dialog */}
        <Dialog
          open={showEditEntryForm}
          onClose={handleCancelEditEntry}
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
            Edit Price Entry
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <div className="grid grid-cols-2 gap-4">
              {/* Product Name */}
              <TextField
                label="Product Name *"
                value={editingEntryData.productName || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("productName", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                required
              />

              {/* Unit Price */}
              <TextField
                label="Unit Price *"
                type="number"
                value={editingEntryData.unitPrice || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("unitPrice", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />

              {/* Minimum Price */}
              <TextField
                label="Minimum Price *"
                type="number"
                value={editingEntryData.minimumPrice || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("minimumPrice", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />

              {/* Container Size */}
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Container Size</InputLabel>
                <Select
                  value={editingEntryData.containerSize || ""}
                  onChange={(e) =>
                    handleEditEntryCellEdit("containerSize", e.target.value)
                  }
                  label="Container Size"
                >
                  <MenuItem value="">Select Container Size</MenuItem>
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
                  value={editingEntryData.uom || ""}
                  onChange={(e) =>
                    handleEditEntryCellEdit("uom", e.target.value)
                  }
                  label="UOM"
                >
                  <MenuItem value="">Select UOM</MenuItem>
                  <MenuItem value="Each">Each</MenuItem>
                  <MenuItem value="Gallon">Gallon</MenuItem>
                  <MenuItem value="Pound">Pound</MenuItem>
                  <MenuItem value="Container">Container</MenuItem>
                  <MenuItem value="Ton">Ton</MenuItem>
                </Select>
              </FormControl>

              {/* Project Name */}
              <TextField
                label="Project Name"
                value={editingEntryData.projectName || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("projectName", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Profile ID */}
              <TextField
                label="Profile ID"
                value={editingEntryData.profileId || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("profileId", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Generator ID */}
              <TextField
                label="Generator ID"
                value={editingEntryData.generatorId || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("generatorId", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Generator State */}
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Generator State</InputLabel>
                <Select
                  value={editingEntryData.generatorState || ""}
                  onChange={(e) =>
                    handleEditEntryCellEdit("generatorState", e.target.value)
                  }
                  label="Generator State"
                >
                  <MenuItem value="">Select State</MenuItem>
                  <MenuItem value="AL">AL</MenuItem>
                  <MenuItem value="AK">AK</MenuItem>
                  <MenuItem value="AZ">AZ</MenuItem>
                  <MenuItem value="AR">AR</MenuItem>
                  <MenuItem value="CA">CA</MenuItem>
                  <MenuItem value="CO">CO</MenuItem>
                  <MenuItem value="CT">CT</MenuItem>
                  <MenuItem value="DE">DE</MenuItem>
                  <MenuItem value="FL">FL</MenuItem>
                  <MenuItem value="GA">GA</MenuItem>
                  <MenuItem value="HI">HI</MenuItem>
                  <MenuItem value="ID">ID</MenuItem>
                  <MenuItem value="IL">IL</MenuItem>
                  <MenuItem value="IN">IN</MenuItem>
                  <MenuItem value="IA">IA</MenuItem>
                  <MenuItem value="KS">KS</MenuItem>
                  <MenuItem value="KY">KY</MenuItem>
                  <MenuItem value="LA">LA</MenuItem>
                  <MenuItem value="ME">ME</MenuItem>
                  <MenuItem value="MD">MD</MenuItem>
                  <MenuItem value="MA">MA</MenuItem>
                  <MenuItem value="MI">MI</MenuItem>
                  <MenuItem value="MN">MN</MenuItem>
                  <MenuItem value="MS">MS</MenuItem>
                  <MenuItem value="MO">MO</MenuItem>
                  <MenuItem value="MT">MT</MenuItem>
                  <MenuItem value="NE">NE</MenuItem>
                  <MenuItem value="NV">NV</MenuItem>
                  <MenuItem value="NH">NH</MenuItem>
                  <MenuItem value="NJ">NJ</MenuItem>
                  <MenuItem value="NM">NM</MenuItem>
                  <MenuItem value="NY">NY</MenuItem>
                  <MenuItem value="NC">NC</MenuItem>
                  <MenuItem value="ND">ND</MenuItem>
                  <MenuItem value="OH">OH</MenuItem>
                  <MenuItem value="OK">OK</MenuItem>
                  <MenuItem value="OR">OR</MenuItem>
                  <MenuItem value="PA">PA</MenuItem>
                  <MenuItem value="RI">RI</MenuItem>
                  <MenuItem value="SC">SC</MenuItem>
                  <MenuItem value="SD">SD</MenuItem>
                  <MenuItem value="TN">TN</MenuItem>
                  <MenuItem value="TX">TX</MenuItem>
                  <MenuItem value="UT">UT</MenuItem>
                  <MenuItem value="VT">VT</MenuItem>
                  <MenuItem value="VA">VA</MenuItem>
                  <MenuItem value="WA">WA</MenuItem>
                  <MenuItem value="WV">WV</MenuItem>
                  <MenuItem value="WI">WI</MenuItem>
                  <MenuItem value="WY">WY</MenuItem>
                </Select>
              </FormControl>

              {/* Contract ID */}
              <TextField
                label="Contract ID"
                value={editingEntryData.contractId || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("contractId", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Facility Name */}
              <TextField
                label="Facility Name"
                value={editingEntryData.facilityName || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("facilityName", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
              />

              {/* Effective Date */}
              <TextField
                label="Effective Date"
                type="date"
                value={editingEntryData.effectiveDate || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("effectiveDate", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              {/* Expiration Date */}
              <TextField
                label="Expiration Date"
                type="date"
                value={editingEntryData.expirationDate || ""}
                onChange={(e) =>
                  handleEditEntryCellEdit("expirationDate", e.target.value)
                }
                variant="outlined"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <SecondaryButton onClick={handleCancelEditEntry}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleSaveEditEntry}>
              Update Entry
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Price Header Modal */}
        <Dialog
          open={showPriceHeaderModal}
          onClose={handleCancelPriceHeader}
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
            {isCreatingNewHeader
              ? "Create New Price Header"
              : "Custom Header Settings"}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {/* Price Header Selection */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Select Price Header</InputLabel>
                <Select
                  value={
                    isCreatingNewHeader
                      ? "__new__"
                      : selectedPriceHeaderId || ""
                  }
                  onChange={(e) =>
                    handlePriceHeaderSelectionChange(e.target.value)
                  }
                  label="Select Price Header"
                >
                  <MenuItem value="__new__">
                    <div className="flex items-center">
                      <span className="text-[#65b230] font-medium">
                        + Add New Header
                      </span>
                    </div>
                  </MenuItem>
                  {availablePriceHeaders.length > 0 && (
                    <div className="border-t border-gray-200 my-1" />
                  )}
                  {availablePriceHeaders.map((header) => (
                    <MenuItem key={header.id} value={header.id}>
                      {header.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* New Header Name Field */}
              {isCreatingNewHeader && (
                <div className="mt-4">
                  <TextField
                    label="Header Name"
                    value={newHeaderName}
                    onChange={(e) => setNewHeaderName(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Enter a name for the new price header"
                    helperText="This name will be used to identify the price header"
                    error={isCreatingNewHeader && newHeaderName.trim() === ""}
                  />
                </div>
              )}
            </div>

            {/* Main Content with Loading Overlay */}
            <div className="relative">
              {/* Loading Spinner Overlay */}
              {priceHeaderLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#65b230]"></div>
                    <span className="text-sm text-gray-600">
                      Loading header data...
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* EEI */}
                <FormControl
                  variant="outlined"
                  size="small"
                  fullWidth
                  error={isCreatingNewHeader && !priceHeaderData.eei}
                >
                  <InputLabel>E&I {isCreatingNewHeader && "*"}</InputLabel>
                  <Select
                    value={
                      priceHeaderData.eei ||
                      (isCreatingNewHeader ? "" : "Regular")
                    }
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setPriceHeaderData((prev) => {
                        const updated: any = {
                          ...prev,
                          eei: newValue,
                        };

                        // Set default dates for custom E&I if "Custom" is selected
                        if (newValue === "Custom") {
                          // Only set defaults if the custom fields don't already have values
                          if (!prev.customEeiEffectiveDate) {
                            const today = new Date();
                            updated.customEeiEffectiveDate = today
                              .toISOString()
                              .split("T")[0];
                          }
                          if (!prev.customEeiExpirationDate) {
                            const oneYearFromNow = new Date();
                            oneYearFromNow.setFullYear(
                              new Date().getFullYear() + 1
                            );
                            updated.customEeiExpirationDate = oneYearFromNow
                              .toISOString()
                              .split("T")[0];
                          }
                        } else {
                          // Clear custom E&I fields if not "Custom"
                          updated.customEeiRate = "";
                          updated.customEeiEffectiveDate = "";
                          updated.customEeiExpirationDate = "";
                        }

                        return updated;
                      });
                    }}
                    label={`EEI ${isCreatingNewHeader ? "*" : ""}`}
                  >
                    <MenuItem value="Regular">Regular</MenuItem>
                    <MenuItem value="Custom">Custom</MenuItem>
                    <MenuItem value="None">None</MenuItem>
                  </Select>
                  {isCreatingNewHeader && !priceHeaderData.eei && (
                    <div className="text-red-500 text-xs mt-1 ml-3">
                      This field is required
                    </div>
                  )}
                </FormControl>

                {/* Custom E&I Fields - Only show when "Custom" is selected */}
                {priceHeaderData.eei === "Custom" && (
                  <div className="col-span-2 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontSize: "14px",
                        color: "#1976d2",
                        marginBottom: 3,
                        fontWeight: 500,
                      }}
                    >
                      Custom E&I Configuration
                    </Typography>
                    <div className="grid grid-cols-3 gap-4">
                      {/* E&I Rate */}
                      <TextField
                        label="E&I Rate (%) *"
                        type="number"
                        value={priceHeaderData.customEeiRate || ""}
                        onChange={(e) =>
                          setPriceHeaderData((prev) => ({
                            ...prev,
                            customEeiRate: parseFloat(e.target.value) || 0,
                          }))
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                        error={
                          !priceHeaderData.customEeiRate ||
                          priceHeaderData.customEeiRate === 0
                        }
                        helperText={
                          !priceHeaderData.customEeiRate ||
                          priceHeaderData.customEeiRate === 0
                            ? "Enter E&I rate percentage"
                            : ""
                        }
                      />

                      {/* Custom E&I Effective Date */}
                      <TextField
                        label="E&I Effective Date *"
                        type="date"
                        value={priceHeaderData.customEeiEffectiveDate || ""}
                        onChange={(e) =>
                          setPriceHeaderData((prev) => ({
                            ...prev,
                            customEeiEffectiveDate: e.target.value,
                          }))
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                        error={!priceHeaderData.customEeiEffectiveDate}
                        helperText={
                          !priceHeaderData.customEeiEffectiveDate
                            ? "Select E&I effective date"
                            : ""
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />

                      {/* Custom E&I Expiration Date */}
                      <TextField
                        label="E&I Expiration Date *"
                        type="date"
                        value={priceHeaderData.customEeiExpirationDate || ""}
                        onChange={(e) =>
                          setPriceHeaderData((prev) => ({
                            ...prev,
                            customEeiExpirationDate: e.target.value,
                          }))
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                        error={!priceHeaderData.customEeiExpirationDate}
                        helperText={
                          !priceHeaderData.customEeiExpirationDate
                            ? "Select E&I expiration date"
                            : ""
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      Note: Custom E&I rates apply only to this price header and
                      override standard rates
                    </div>
                  </div>
                )}

                {/* Fuel Surcharge (FSC) */}
                <FormControl
                  variant="outlined"
                  size="small"
                  fullWidth
                  error={isCreatingNewHeader && !priceHeaderData.fuelSurcharge}
                >
                  <InputLabel>
                    Fuel Surcharge (FSC) {isCreatingNewHeader && "*"}
                  </InputLabel>
                  <Select
                    value={
                      priceHeaderData.fuelSurcharge ||
                      (isCreatingNewHeader ? "" : "Standard Monthly")
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "Custom Rate") {
                        setFuelSurchargeModalOpen(true);
                      }
                      setPriceHeaderData((prev) => ({
                        ...prev,
                        fuelSurcharge: value,
                      }));
                    }}
                    label={`Fuel Surcharge (FSC) ${
                      isCreatingNewHeader ? "*" : ""
                    }`}
                  >
                    <MenuItem value="Standard Monthly">
                      Standard Monthly
                    </MenuItem>
                    <MenuItem value="Standard Weekly">Standard Weekly</MenuItem>
                    <MenuItem value="Custom Rate">Custom</MenuItem>
                    <MenuItem value="None">None</MenuItem>
                  </Select>
                  {isCreatingNewHeader && !priceHeaderData.fuelSurcharge && (
                    <div className="text-red-500 text-xs mt-1 ml-3">
                      This field is required
                    </div>
                  )}

                  {/* Edit Custom Fuel Surcharge Button - Only show when Custom Rate is selected */}
                  {priceHeaderData.fuelSurcharge === "Custom Rate" && (
                    <div className="mt-2">
                      <SecondaryButton
                        onClick={() => setFuelSurchargeModalOpen(true)}
                        startIcon={<Edit className="h-4 w-4" />}
                        size="small"
                      >
                        Edit Custom Fuel Surcharge
                      </SecondaryButton>
                    </div>
                  )}
                </FormControl>

                {/* Container Conversion */}
                <div>
                  <FormControl
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={
                      isCreatingNewHeader &&
                      !priceHeaderData.containerConversion
                    }
                  >
                    <InputLabel>
                      Container Breakdown Type {isCreatingNewHeader && "*"}
                    </InputLabel>
                    <Select
                      value={
                        priceHeaderData.containerConversion ||
                        (isCreatingNewHeader ? "" : "Standard Conversion")
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "Custom Conversion") {
                          // Initialize with existing rules if any, otherwise start with empty
                          // Only reset if all rules are empty (this shouldn't happen with default values)
                          if (
                            customConversionRules.every(
                              (rule) =>
                                !rule.fromSize &&
                                !rule.toSize &&
                                !rule.multiplier
                            )
                          ) {
                            // Reset to default if no rules configured
                            setCustomConversionRules([
                              {
                                id: "1",
                                fromSize: "1G",
                                toSize: "5G",
                                multiplier: "0.35",
                              },
                              {
                                id: "2",
                                fromSize: "6G",
                                toSize: "15G",
                                multiplier: "0.5",
                              },
                              {
                                id: "3",
                                fromSize: "16G",
                                toSize: "30G",
                                multiplier: "0.75",
                              },
                              {
                                id: "4",
                                fromSize: "31G",
                                toSize: "55G",
                                multiplier: "1.00",
                              },
                              {
                                id: "5",
                                fromSize: "56G",
                                toSize: "85G",
                                multiplier: "1.5",
                              },
                              {
                                id: "6",
                                fromSize: "86G",
                                toSize: "220G",
                                multiplier: "4",
                              },
                              {
                                id: "7",
                                fromSize: "221G",
                                toSize: "275G",
                                multiplier: "5",
                              },
                              {
                                id: "8",
                                fromSize: "276G",
                                toSize: "350G",
                                multiplier: "6",
                              },
                            ]);
                          }
                          setContainerConversionModalOpen(true);
                        }
                        setPriceHeaderData((prev) => ({
                          ...prev,
                          containerConversion: value,
                        }));
                      }}
                      label={`Container Conversion ${
                        isCreatingNewHeader ? "*" : ""
                      }`}
                    >
                      <MenuItem value="Standard Conversion">
                        Standard Conversion
                      </MenuItem>

                      <MenuItem value="Custom Conversion">
                        Custom Conversion
                      </MenuItem>
                    </Select>
                    {isCreatingNewHeader &&
                      !priceHeaderData.containerConversion && (
                        <div className="text-red-500 text-xs mt-1 ml-3">
                          This field is required
                        </div>
                      )}
                  </FormControl>

                  {/* Edit Custom Conversion Button - Only show when Custom Conversion is selected */}
                  {priceHeaderData.containerConversion ===
                    "Custom Conversion" && (
                    <div className="mt-2">
                      <SecondaryButton
                        onClick={() => setContainerConversionModalOpen(true)}
                        startIcon={<Edit className="h-4 w-4" />}
                        size="small"
                      >
                        Edit Custom Conversion
                      </SecondaryButton>
                    </div>
                  )}
                </div>

                {/* Invoice Minimum */}
                <TextField
                  label={`Invoice Minimum ${isCreatingNewHeader ? "*" : ""}`}
                  type="number"
                  value={
                    priceHeaderData.invoiceMinimum ||
                    (isCreatingNewHeader ? "" : 350)
                  }
                  onChange={(e) =>
                    setPriceHeaderData((prev) => ({
                      ...prev,
                      invoiceMinimum: parseFloat(e.target.value) || 0,
                    }))
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, step: 1.0 }}
                  error={
                    isCreatingNewHeader &&
                    (!priceHeaderData.invoiceMinimum ||
                      priceHeaderData.invoiceMinimum === "")
                  }
                  helperText={
                    isCreatingNewHeader &&
                    (!priceHeaderData.invoiceMinimum ||
                      priceHeaderData.invoiceMinimum === "")
                      ? "This field is required"
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <span className="text-gray-500 mr-2">$</span>
                    ),
                  }}
                />

                {/* Global Container Minimum */}
                <TextField
                  label={`Global Container Minimum ${
                    isCreatingNewHeader ? "*" : ""
                  }`}
                  type="number"
                  value={
                    priceHeaderData.globalContainerMinimum ||
                    (isCreatingNewHeader ? "" : 40)
                  }
                  onChange={(e) =>
                    setPriceHeaderData((prev) => ({
                      ...prev,
                      globalContainerMinimum: parseFloat(e.target.value) || 0,
                    }))
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  error={
                    isCreatingNewHeader &&
                    (!priceHeaderData.globalContainerMinimum ||
                      priceHeaderData.globalContainerMinimum === 0)
                  }
                  helperText={
                    isCreatingNewHeader &&
                    (!priceHeaderData.globalContainerMinimum ||
                      priceHeaderData.globalContainerMinimum === 0)
                      ? "Enter global container minimum amount"
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <span className="text-gray-500 mr-2">$</span>
                    ),
                  }}
                />

                {/* Item Minimums */}
                <FormControl
                  variant="outlined"
                  size="small"
                  fullWidth
                  error={isCreatingNewHeader && !priceHeaderData.itemMinimums}
                >
                  <InputLabel>
                    Item Container Minimums {isCreatingNewHeader && "*"}
                  </InputLabel>
                  <Select
                    value={
                      priceHeaderData.itemMinimums ||
                      (isCreatingNewHeader ? "" : "Standard Tables")
                    }
                    onChange={(e) =>
                      setPriceHeaderData((prev) => ({
                        ...prev,
                        itemMinimums: e.target.value,
                      }))
                    }
                    label={`Item Minimums ${isCreatingNewHeader ? "*" : ""}`}
                  >
                    <MenuItem value="Standard Tables">Standard Tables</MenuItem>
                    <MenuItem value="Custom Tables">Custom Tables</MenuItem>
                    <MenuItem value="None">None</MenuItem>
                  </Select>
                  {isCreatingNewHeader && !priceHeaderData.itemMinimums && (
                    <div className="text-red-500 text-xs mt-1 ml-3">
                      This field is required
                    </div>
                  )}
                </FormControl>

                {/* Economic Adjustment Fee (EAF) % */}
                <TextField
                  label={`EAF ${isCreatingNewHeader ? "*" : ""}`}
                  type="number"
                  value={
                    priceHeaderData.economicAdjustmentFee ||
                    (isCreatingNewHeader ? "" : 3)
                  }
                  onChange={(e) =>
                    setPriceHeaderData((prev) => ({
                      ...prev,
                      economicAdjustmentFee: parseFloat(e.target.value) || 0,
                    }))
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                  error={
                    isCreatingNewHeader &&
                    (!priceHeaderData.economicAdjustmentFee ||
                      priceHeaderData.economicAdjustmentFee === "")
                  }
                  helperText={
                    isCreatingNewHeader &&
                    (!priceHeaderData.economicAdjustmentFee ||
                      priceHeaderData.economicAdjustmentFee === "")
                      ? "This field is required"
                      : ""
                  }
                  InputProps={{
                    endAdornment: <span className="text-gray-500 ml-2">%</span>,
                  }}
                />

                {/* E-Manifest Fee */}
                <TextField
                  label={`E-Manifest Fee ${isCreatingNewHeader ? "*" : ""}`}
                  type="number"
                  value={
                    priceHeaderData.eManifestFee ||
                    (isCreatingNewHeader ? "" : 25)
                  }
                  onChange={(e) =>
                    setPriceHeaderData((prev) => ({
                      ...prev,
                      eManifestFee: parseFloat(e.target.value) || 0,
                    }))
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  error={
                    isCreatingNewHeader &&
                    (!priceHeaderData.eManifestFee ||
                      priceHeaderData.eManifestFee === "")
                  }
                  helperText={
                    isCreatingNewHeader &&
                    (!priceHeaderData.eManifestFee ||
                      priceHeaderData.eManifestFee === "")
                      ? "This field is required"
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <span className="text-gray-500 mr-2">$</span>
                    ),
                  }}
                />
              </div>

              {/* Date Fields Section */}
              <div className="mt-6">
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "14px",
                    color: "#666666",
                    marginBottom: 2,
                    fontWeight: 400,
                  }}
                >
                  Date Settings{" "}
                  {isCreatingNewHeader && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Effective and expiration dates are required)
                    </span>
                  )}
                </Typography>
                <div className="grid grid-cols-2 gap-6">
                  {/* Effective Date */}
                  <TextField
                    label={`Effective Date ${isCreatingNewHeader ? "*" : ""}`}
                    type="date"
                    value={priceHeaderData.effectiveDate || ""}
                    onChange={(e) =>
                      setPriceHeaderData((prev) => ({
                        ...prev,
                        effectiveDate: e.target.value,
                      }))
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={
                      isCreatingNewHeader &&
                      (!priceHeaderData.effectiveDate ||
                        priceHeaderData.effectiveDate === "")
                    }
                    helperText={
                      isCreatingNewHeader &&
                      (!priceHeaderData.effectiveDate ||
                        priceHeaderData.effectiveDate === "")
                        ? "This field is required"
                        : ""
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    placeholder={
                      isCreatingNewHeader ? "Select effective date" : ""
                    }
                  />

                  {/* Expiration Date */}
                  <TextField
                    label={`Expiration Date ${isCreatingNewHeader ? "*" : ""}`}
                    type="date"
                    value={priceHeaderData.expirationDate || ""}
                    onChange={(e) =>
                      setPriceHeaderData((prev) => ({
                        ...prev,
                        expirationDate: e.target.value,
                      }))
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={
                      isCreatingNewHeader &&
                      (!priceHeaderData.expirationDate ||
                        priceHeaderData.expirationDate === "")
                    }
                    helperText={
                      isCreatingNewHeader &&
                      (!priceHeaderData.expirationDate ||
                        priceHeaderData.expirationDate === "")
                        ? "This field is required"
                        : ""
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    placeholder={
                      isCreatingNewHeader ? "Select expiration date" : ""
                    }
                  />
                </div>
                {isCreatingNewHeader && (
                  <div className="mt-2 text-xs text-gray-500">
                    Note: Expiration date must be after the effective date
                  </div>
                )}
              </div>

              {/* Additional Options Section */}
              <div className="mt-6">
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "14px",
                    color: "#666666",
                    marginBottom: 2,
                    fontWeight: 400,
                  }}
                >
                  Additional Options
                </Typography>

                <div className="flex flex-wrap gap-4">
                  {/* Hub Fee */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={priceHeaderData.hubFee || false}
                        onChange={(e) =>
                          setPriceHeaderData((prev) => ({
                            ...prev,
                            hubFee: e.target.checked,
                          }))
                        }
                        sx={{
                          color: "#65b230",
                          "&.Mui-checked": {
                            color: "#65b230",
                          },
                        }}
                      />
                    }
                    label="Hub Fee"
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontSize: "16px",
                        color: "rgba(0,0,0,0.87)",
                      },
                    }}
                  />

                  {/* Regional Pricing */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={priceHeaderData.regionalPricing || false}
                        onChange={(e) =>
                          setPriceHeaderData((prev) => ({
                            ...prev,
                            regionalPricing: e.target.checked,
                          }))
                        }
                        sx={{
                          color: "#65b230",
                          "&.Mui-checked": {
                            color: "#65b230",
                          },
                        }}
                      />
                    }
                    label="Regional Pricing"
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontSize: "16px",
                        color: "rgba(0,0,0,0.87)",
                      },
                    }}
                  />

                  {/* Zone Transportation */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={priceHeaderData.zoneTransportation || false}
                        onChange={(e) =>
                          setPriceHeaderData((prev) => ({
                            ...prev,
                            zoneTransportation: e.target.checked,
                          }))
                        }
                        sx={{
                          color: "#65b230",
                          "&.Mui-checked": {
                            color: "#65b230",
                          },
                        }}
                      />
                    }
                    label="Zone Transportation"
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontSize: "16px",
                        color: "rgba(0,0,0,0.87)",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <SecondaryButton onClick={handleCancelPriceHeader}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleSavePriceHeader}>
              {isCreatingNewHeader ? "Create Header" : "Save Changes"}
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Container Conversion Modal */}
        <Dialog
          open={containerConversionModalOpen}
          onClose={() => setContainerConversionModalOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: "90vh",
              maxHeight: "90vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              m: 0,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">
              Custom Container Breakdown Configuration
            </Typography>
            <IconButton
              onClick={() => setContainerConversionModalOpen(false)}
              sx={{ color: "grey.500" }}
            >
              <X />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, overflow: "hidden" }}>
            <div style={{ height: "100%", overflow: "auto" }}>
              <ContainerConversionContent
                ref={containerConversionRef}
                onClose={() => setContainerConversionModalOpen(false)}
                initialConversions={customConversionRules}
                onSave={(conversions) => {
                  setCustomConversionRules(conversions);
                  // You can also save to localStorage or API here
                  console.log("Saving custom conversion rules:", conversions);
                }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <SecondaryButton
              onClick={() => setContainerConversionModalOpen(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={() => {
                if (containerConversionRef.current) {
                  containerConversionRef.current.handleSave();
                }
              }}
            >
              Save Conversions
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Fuel Surcharge Modal */}
        <Dialog
          open={fuelSurchargeModalOpen}
          onClose={() => setFuelSurchargeModalOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: "90vh",
              maxHeight: "90vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              m: 0,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">
              Custom Fuel Surcharge Configuration
            </Typography>
            <IconButton
              onClick={() => setFuelSurchargeModalOpen(false)}
              sx={{ color: "grey.500" }}
            >
              <X />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, overflow: "hidden" }}>
            <div style={{ height: "100%", overflow: "auto" }}>
              <FuelSurchargeContent
                ref={fuelSurchargeRef}
                onClose={() => setFuelSurchargeModalOpen(false)}
                initialRules={customFuelSurchargeRules}
                onSave={(rules) => {
                  setCustomFuelSurchargeRules(rules);
                  // You can also save to localStorage or API here
                  console.log("Saving custom fuel surcharge rules:", rules);
                }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <SecondaryButton onClick={() => setFuelSurchargeModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={() => {
                if (fuelSurchargeRef.current) {
                  fuelSurchargeRef.current.handleSave();
                }
              }}
            >
              Save Fuel Surcharge Ranges
            </PrimaryButton>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
