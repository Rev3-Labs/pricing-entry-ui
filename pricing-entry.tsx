"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Plus,
  Trash2,
  Save,
  Send,
  Download,
  Upload,
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Filter,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { usePricingService } from "./hooks/usePricingService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox as UICheckbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface GridRow {
  id: string;
  pricingType: string;
  pricePriority: string;
  customerId: string;
  productId: string;
  regionId: string;
  profileId: string;
  generatorId: string;
  contractId: string;
  quoteId: string;
  jobId: string;
  generatorRegionId: string;
  vendorId: string;
  containerSizeId: string;
  billingUomId: string;
  unitPrice: string;
  minimumPrice: string;
  effectiveDate: string;
  expirationDate: string;
}

interface CellPosition {
  rowIndex: number;
  colKey: keyof GridRow;
}

const initialRow: Omit<GridRow, "id"> = {
  pricingType: "",
  pricePriority: "1",
  customerId: "",
  productId: "",
  regionId: "",
  profileId: "",
  generatorId: "",
  contractId: "",
  quoteId: "",
  jobId: "",
  generatorRegionId: "",
  vendorId: "",
  containerSizeId: "",
  billingUomId: "",
  unitPrice: "",
  minimumPrice: "",
  effectiveDate: "",
  expirationDate: "",
};

const pricingTypes = [
  "Regional",
  "Product-specific",
  "Profile-specific",
  "Generator-specific",
  "Contract-specific",
];
const states = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

// Column configuration for better navigation
const columns: {
  key: keyof GridRow;
  label: string;
  width: string;
  type: "text" | "number" | "select" | "dropdown" | "date";
  required?: boolean;
}[] = [
  {
    key: "productId",
    label: "Product",
    width: "min-w-[120px]",
    type: "text",
    required: true,
  },
  {
    key: "regionId",
    label: "Region",
    width: "min-w-[100px]",
    type: "dropdown",
    required: true,
  },
  { key: "profileId", label: "Profile", width: "min-w-[100px]", type: "text" },
  {
    key: "generatorId",
    label: "Generator",
    width: "min-w-[120px]",
    type: "text",
  },
  {
    key: "contractId",
    label: "Gov. Contract",
    width: "min-w-[120px]",
    type: "text",
  },
  { key: "quoteId", label: "Quote", width: "min-w-[100px]", type: "text" },
  { key: "jobId", label: "Job", width: "min-w-[100px]", type: "text" },

  { key: "vendorId", label: "Vendor", width: "min-w-[100px]", type: "text" },
  {
    key: "containerSizeId",
    label: "Container Size",
    width: "min-w-[120px]",
    type: "dropdown",
    required: true,
  },
  {
    key: "billingUomId",
    label: "UOM",
    width: "min-w-[120px]",
    type: "dropdown",
    required: true,
  },
  {
    key: "unitPrice",
    label: "Price",
    width: "min-w-[100px]",
    type: "number",
    required: true,
  },
  {
    key: "minimumPrice",
    label: "Minimum",
    width: "min-w-[100px]",
    type: "number",
  },
  {
    key: "effectiveDate",
    label: "Effective Date",
    width: "min-w-[120px]",
    type: "date",
  },
  {
    key: "expirationDate",
    label: "Expiration Date",
    width: "min-w-[120px]",
    type: "date",
  },
];

// 1. Add standard conversion table data and state for custom conversion
const STANDARD_CONVERSIONS = [
  { size: "1-5 gallon", value: "0.35" },
  { size: "6-15 gallon", value: "0.50" },
  { size: "16-30 gallon", value: "0.75" },
  { size: "31-55 gallon", value: "1" },
  { size: "85 gallon", value: "1.5" },
  { size: "Cubic Yard Boxes", value: "4" },
  { size: "250/275-gallon totes", value: "5" },
  { size: "330/350-gallon totes", value: "6" },
];

// Helper to get the standard value for a given size
const getStandardValue = (size: string) => {
  const found = STANDARD_CONVERSIONS.find((row) => row.size === size);
  return found ? parseFloat(found.value) : 0;
};

export default function PricingEntry() {
  // All hooks must be declared before any return!
  const {
    customers,
    products,
    regions,
    containerSizes,
    billingUoms,
    terms,
    facilities,
    generators,
    loading,
    error,
    saveDraft,
    submitPricing,
    validatePricing,
  } = usePricingService();

  // Remove header-level state for effective date and quote
  const [customerName, setCustomerName] = useState("");
  const [termsConditions, setTermsConditions] = useState("");
  const [invoiceMinimum, setInvoiceMinimum] = useState("500.00");
  const [eiPercent, setEiPercent] = useState("2.5");
  const [eManifestFee, setEManifestFee] = useState("15.00");
  const [ancillaryChargesModalOpen, setAncillaryChargesModalOpen] =
    useState(false);

  const [gridData, setGridData] = useState<GridRow[]>([]);

  // Enhanced cell selection and editing
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [clipboardData, setClipboardData] = useState<string[][]>([]);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pastedData, setPastedData] = useState<string[][]>([]);

  const tableRef = useRef<HTMLTableElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [conversionType, setConversionType] = useState<"standard" | "custom">(
    "standard"
  );
  const [customEditMode, setCustomEditMode] = useState(false);
  const [customConversions, setCustomConversions] = useState(
    STANDARD_CONVERSIONS.map((row) => ({ ...row }))
  );
  const [customDraft, setCustomDraft] = useState(
    STANDARD_CONVERSIONS.map((row) => ({ ...row }))
  );

  const [conversionModalOpen, setConversionModalOpen] = useState(false);

  // Add Row Dialog State
  const [addRowDialogOpen, setAddRowDialogOpen] = useState(false);
  const [newRowConversionType, setNewRowConversionType] = useState<
    "standard" | "custom"
  >("standard");

  // Filter state
  const [filterQuote, setFilterQuote] = useState("");
  const [filterGenerator, setFilterGenerator] = useState("");
  const [filterContract, setFilterContract] = useState("");
  const [filterJob, setFilterJob] = useState("");
  const [filterEffectiveDate, setFilterEffectiveDate] = useState<
    Date | undefined
  >();
  const [filterExpirationDate, setFilterExpirationDate] = useState<
    Date | undefined
  >();

  // Active filters state
  const [activeFilters, setActiveFilters] = useState<{
    [key: string]: string | string[] | Date | undefined;
  }>({});
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<string | null>(
    null
  );

  // Use a client-only incrementing counter for row IDs to avoid hydration mismatch
  const nextRowId = useRef(1); // Start at 1 since we no longer have an initial row

  // Temporary custom conversions for Add Row dialog
  const [addRowCustomDraft, setAddRowCustomDraft] = useState(
    STANDARD_CONVERSIONS.map((row) => ({ ...row }))
  );

  const [rowToDelete, setRowToDelete] = useState<string | null>(null);

  // Add these inside the component, above the return:
  const cancelDeleteRow = () => setRowToDelete(null);
  const confirmDeleteRow = () => {
    if (rowToDelete) {
      setGridData((prev) => prev.filter((row) => row.id !== rowToDelete));
      setRowToDelete(null);
    }
  };

  // Add grid handlers inside the component, above the return:
  const handleCellClick = (rowIndex: number, colKey: keyof GridRow) => {
    setSelectedCell({ rowIndex, colKey });
    setEditingCell(null);
  };
  const handleCellDoubleClick = (rowIndex: number, colKey: keyof GridRow) => {
    setSelectedCell({ rowIndex, colKey });
    setEditingCell({ rowIndex, colKey });
  };
  const handleInputChange = (value: string) => {
    if (!editingCell) return;
    const { rowIndex, colKey } = editingCell;
    setGridData((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [colKey]: value };
      return updated;
    });
  };
  const handleInputBlur = () => {
    setEditingCell(null);
  };
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!editingCell) return;
    const { rowIndex, colKey } = editingCell;
    const colIndex = columns.findIndex((col) => col.key === colKey);
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      setEditingCell(null);
      // Move to next cell
      let nextRow = rowIndex;
      let nextCol = colIndex + 1;
      if (nextCol >= columns.length) {
        nextCol = 0;
        nextRow++;
      }
      if (nextRow < gridData.length) {
        setSelectedCell({ rowIndex: nextRow, colKey: columns[nextCol].key });
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  // Enhanced keyboard navigation for Excel-like editing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    const { rowIndex, colKey } = selectedCell;
    const colIndex = columns.findIndex((col) => col.key === colKey);
    let nextRow = rowIndex;
    let nextCol = colIndex;
    let startEdit = false;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (rowIndex > 0) nextRow--;
        break;
      case "ArrowDown":
        e.preventDefault();
        if (rowIndex < filteredGridData.length - 1) nextRow++;
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (colIndex > 0) nextCol--;
        break;
      case "ArrowRight":
        e.preventDefault();
        if (colIndex < columns.length - 1) nextCol++;
        break;
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          if (colIndex > 0) nextCol--;
          else if (rowIndex > 0) {
            nextRow--;
            nextCol = columns.length - 1;
          }
        } else {
          if (colIndex < columns.length - 1) nextCol++;
          else if (rowIndex < filteredGridData.length - 1) {
            nextRow++;
            nextCol = 0;
          }
        }
        startEdit = true;
        break;
      case "Enter":
        e.preventDefault();
        if (e.shiftKey) {
          if (rowIndex > 0) nextRow--;
        } else {
          if (rowIndex < filteredGridData.length - 1) nextRow++;
        }
        startEdit = true;
        break;
      case "F2":
        e.preventDefault();
        setEditingCell({ rowIndex, colKey });
        return;
      default:
        // Start editing on any printable character
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          setEditingCell({ rowIndex, colKey });
          return;
        }
        return;
    }
    setSelectedCell({ rowIndex: nextRow, colKey: columns[nextCol].key });
    if (startEdit)
      setEditingCell({ rowIndex: nextRow, colKey: columns[nextCol].key });
  };

  // Handle paste functionality
  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const clipboardText = e.clipboardData.getData("text");
    if (!clipboardText) return;

    // Parse clipboard data (Excel format: tab-separated values, newline-separated rows)
    const rows = clipboardText.trim().split("\n");
    const parsedData = rows.map((row) => row.split("\t"));

    setPastedData(parsedData);
    setPasteModalOpen(true);
  };

  // Apply pasted data to grid
  const applyPastedData = () => {
    if (pastedData.length === 0) return;

    const newRows: GridRow[] = [];

    pastedData.forEach((rowData, rowIndex) => {
      const newRow: GridRow = {
        id: (nextRowId.current + rowIndex).toString(),
        ...initialRow,
      };

      // Map pasted data to grid columns
      rowData.forEach((cellValue, colIndex) => {
        if (colIndex < columns.length) {
          const colKey = columns[colIndex].key;
          newRow[colKey] = cellValue.trim();
        }
      });

      newRows.push(newRow);
    });

    nextRowId.current += pastedData.length;
    setGridData((prev) => [...prev, ...newRows]);
    setPasteModalOpen(false);
    setPastedData([]);
  };

  // Add renderCell after the handlers, before the return:
  const renderCell = (
    row: GridRow,
    rowIndex: number,
    col: (typeof columns)[0]
  ) => {
    const isEditing =
      editingCell?.rowIndex === rowIndex && editingCell?.colKey === col.key;
    const isSelected =
      selectedCell?.rowIndex === rowIndex && selectedCell?.colKey === col.key;
    const value = row[col.key] || "";

    if (isEditing) {
      if (col.type === "dropdown") {
        let options: string[] = [];
        if (col.key === "regionId") options = regions.map((r) => r.regionName);
        else if (col.key === "containerSizeId")
          options = containerSizes.map((c) => c.sizeName);
        else if (col.key === "billingUomId")
          options = billingUoms.map((u) => u.uomName);
        return (
          <td
            key={col.key}
            className="px-3 py-2 border-r border-gray-200 relative"
          >
            <div className="absolute inset-0 bg-white border-2 border-blue-500 rounded-sm">
              <Select value={value} onValueChange={handleInputChange}>
                <SelectTrigger className="border-0 p-0 h-full focus:ring-0 text-sm bg-transparent">
                  <SelectValue
                    placeholder={`Select ${col.label.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm opacity-0">{value}</div>
          </td>
        );
      } else if (col.type === "date") {
        return (
          <td
            key={col.key}
            className="px-3 py-2 border-r border-gray-200 relative"
          >
            <div className="absolute inset-0 bg-white border-2 border-blue-500 rounded-sm">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-0 p-0 h-full w-full focus:ring-0 text-sm justify-start font-normal bg-transparent"
                  >
                    {value
                      ? format(new Date(value), "MMM dd, yyyy")
                      : `Pick a date`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(date) =>
                      handleInputChange(date ? format(date, "yyyy-MM-dd") : "")
                    }
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={2000}
                    toYear={2100}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="text-sm opacity-0">{value}</div>
          </td>
        );
      } else if (col.type === "number") {
        return (
          <td
            key={col.key}
            className="px-3 py-2 border-r border-gray-200 relative"
          >
            <div className="absolute inset-0 bg-white border-2 border-blue-500 rounded-sm">
              <Input
                ref={inputRef}
                value={value}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="border-0 p-0 h-full w-full focus:ring-0 text-sm bg-transparent"
                type="number"
                step="0.01"
                autoFocus
              />
            </div>
            <div className="text-sm opacity-0">{value}</div>
          </td>
        );
      } else {
        return (
          <td
            key={col.key}
            className="px-3 py-2 border-r border-gray-200 relative"
          >
            <div className="absolute inset-0 bg-white border-2 border-blue-500 rounded-sm">
              <Input
                ref={inputRef}
                value={value}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="border-0 p-0 h-full w-full focus:ring-0 text-sm bg-transparent"
                type="text"
                autoFocus
              />
            </div>
            <div className="text-sm opacity-0">{value}</div>
          </td>
        );
      }
    }

    return (
      <td
        key={col.key}
        className={`px-3 py-2 border-r border-gray-200 cursor-pointer transition-colors ${
          isSelected ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50"
        }`}
        onClick={() => handleCellClick(rowIndex, col.key)}
        onDoubleClick={() => handleCellDoubleClick(rowIndex, col.key)}
      >
        <div className="text-sm min-h-[20px] flex items-center">
          {value || <span className="text-gray-400">-</span>}
        </div>
      </td>
    );
  };

  // Filtering logic
  const filteredGridData = gridData.filter((row) => {
    return Object.entries(activeFilters).every(([colKey, filterValue]) => {
      if (!filterValue) return true;
      // Type guard for GridRow key
      const key = colKey as keyof GridRow;
      if (Array.isArray(filterValue)) {
        return filterValue.includes(row[key] as string);
      }
      // Text/number filter: contains (case-insensitive)
      return String(row[key] || "")
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    });
  });

  // Helper to update a filter
  const setFilter = (colKey: string, value: any) => {
    setActiveFilters((prev) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        const { [colKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [colKey]: value };
    });
  };

  // Helper to get unique values for dropdown columns
  const getUniqueValues = (colKey: keyof GridRow) => {
    const values = Array.from(
      new Set(
        gridData.map((row) => row[colKey as keyof GridRow]).filter(Boolean)
      )
    );
    return values;
  };

  // All hooks above! Now safe to return early:
  if (loading && !customers.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading pricing data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Restore header section only
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        {/* Top Bar */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {customerName || "Pricing Entry"}
              </h1>
              {customerName && (
                <p className="text-sm text-gray-600 mt-1">Pricing Entry</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                Draft
              </span>
              <span>•</span>
              <span>Last saved: Never</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasteModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Paste from Excel
            </Button>
          </div>
        </div>
        {/* Main Fields Row */}
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Customer Info */}
            <div className="flex-1">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {customerName || "Customer Name"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">CN-1234</p>
                <p className="text-sm text-gray-600">
                  123 Main Street, Anytown, ST 12345
                </p>
              </div>
            </div>
            {/* Right: Ancillary Charges */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 min-w-[280px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                  Ancillary Charges
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAncillaryChargesModalOpen(true)}
                  className="h-6 px-2 text-xs"
                >
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-700 block mb-1">
                    Invoice Minimum
                  </Label>
                  <div className="h-8 flex items-center text-sm font-medium text-gray-900">
                    ${invoiceMinimum}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-700 block mb-1">
                    E&I %
                  </Label>
                  <div className="h-8 flex items-center text-sm font-medium text-gray-900">
                    {eiPercent}%
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-700 block mb-1">
                    e-Manifest Fee
                  </Label>
                  <div className="h-8 flex items-center text-sm font-medium text-gray-900">
                    ${eManifestFee}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Data Grid Section */}
      <div className="flex-1 p-6">
        {/* Grid Header with Actions and Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-medium text-gray-900">Line Items</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Total:{" "}
                <strong className="text-gray-900">{gridData.length}</strong>
              </span>
              <span>
                Valid:{" "}
                <strong className="text-green-600">
                  {/* validRows placeholder */}
                </strong>
              </span>
              <span>
                Missing:{" "}
                <strong className="text-red-600">
                  {/* missingRows placeholder */}
                </strong>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Grid
            </Button>
          </div>
        </div>
        {/* Add a filter bar above the grid */}
        {/* Skipping filter bar for now */}
        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div
            className="overflow-x-auto max-h-[65vh] overflow-y-auto"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          >
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 text-left font-medium text-gray-900 border-r border-gray-200 w-10 bg-gray-50">
                    <div className="flex items-center justify-center">
                      <span className="text-xs text-gray-500">#</span>
                    </div>
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-3 text-left font-medium text-gray-900 border-r border-gray-200 ${col.width} bg-gray-50`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        <Popover
                          open={filterPopoverOpen === col.key}
                          onOpenChange={(open) =>
                            setFilterPopoverOpen(open ? col.key : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={
                                activeFilters[col.key]
                                  ? "text-blue-600"
                                  : "text-gray-400 hover:text-gray-700"
                              }
                            >
                              <Filter className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-3">
                            <div className="mb-2 text-xs font-semibold text-gray-700">
                              Filter {col.label}
                            </div>
                            {col.type === "dropdown" ? (
                              <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                                {getUniqueValues(col.key as keyof GridRow).map(
                                  (val) => (
                                    <label
                                      key={val as string}
                                      className="flex items-center gap-2 text-xs"
                                    >
                                      <UICheckbox
                                        checked={
                                          Array.isArray(activeFilters[col.key])
                                            ? (
                                                activeFilters[
                                                  col.key
                                                ] as string[]
                                              ).includes(val as string)
                                            : false
                                        }
                                        onCheckedChange={(checked) => {
                                          let arr = Array.isArray(
                                            activeFilters[col.key]
                                          )
                                            ? [
                                                ...(activeFilters[
                                                  col.key
                                                ] as string[]),
                                              ]
                                            : [];
                                          if (checked) arr.push(val as string);
                                          else
                                            arr = arr.filter((v) => v !== val);
                                          setFilter(col.key, arr);
                                        }}
                                      />
                                      {val as string}
                                    </label>
                                  )
                                )}
                              </div>
                            ) : (
                              <Input
                                autoFocus
                                value={
                                  typeof activeFilters[col.key] === "string"
                                    ? (activeFilters[col.key] as string)
                                    : ""
                                }
                                onChange={(e) =>
                                  setFilter(col.key, e.target.value)
                                }
                                placeholder={`Filter by ${col.label.toLowerCase()}`}
                                className="h-8 text-xs mt-1"
                              />
                            )}
                            <div className="mt-3 flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setFilter(col.key, "")}
                              >
                                Clear
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setFilterPopoverOpen(null)}
                              >
                                Done
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGridData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      No pricing rows found. Click "Add Row" to get started.
                    </td>
                  </tr>
                ) : (
                  filteredGridData.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2 border-r border-gray-200 bg-gray-25">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-500 font-medium">
                            {rowIndex + 1}
                          </span>
                          <span className="border-l border-gray-200 pl-2 flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-gray-400 hover:text-red-600"
                              disabled={gridData.length === 1}
                              aria-label="Delete row"
                              onClick={() => setRowToDelete(row.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </span>
                        </div>
                      </td>
                      {columns.map((col) => renderCell(row, rowIndex, col))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Add Row Button */}
        <div className="mt-4 flex justify-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setAddRowDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
        </div>
      </div>
      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    Valid:{" "}
                    <strong className="text-green-600">
                      {/* validRows placeholder */}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>
                    Missing:{" "}
                    <strong className="text-red-600">
                      {/* missingRows placeholder */}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>
                    Total:{" "}
                    <strong className="text-blue-600">{gridData.length}</strong>
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Price Range: {/* minPrice and maxPrice placeholder */}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="min-w-[120px]">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button className="min-w-[120px]">
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Dialogs and Modals */}
      <Dialog open={conversionModalOpen} onOpenChange={setConversionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {conversionType === "standard"
                ? "Container Conversion Table (Standard)"
                : "Container Conversion Table (Custom)"}
            </DialogTitle>
          </DialogHeader>
          {conversionType === "standard" ? (
            <div>
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-1 px-2 text-left">Container Size</th>
                    <th className="py-1 px-2 text-left">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {STANDARD_CONVERSIONS.map((row) => (
                    <tr key={row.size}>
                      <td className="py-1 px-2">{row.size}</td>
                      <td className="py-1 px-2">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="mt-3 text-xs text-gray-600 list-disc list-inside">
                <li>
                  These conversions apply to all disposal and transportation
                  items priced per container unless quoted separately.
                </li>
                <li>
                  Numbers are a factor of a 55-gallon drum (e.g., 55-gallon
                  price × factor = sell price).
                </li>
                <li>
                  The greater of the conversion factor or $40 minimum applies
                  unless quoted otherwise.
                </li>
                <li>
                  Some waste may have a different minimum, see Non-Standard
                  Minimum table.
                </li>
              </ul>
            </div>
          ) : (
            <div>
              {customEditMode && (
                <div className="mb-3 p-2 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-900 rounded">
                  <strong>Custom Mode:</strong> You are editing conversion
                  multipliers. Changes will apply to this pricing entry only.
                </div>
              )}
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-1 px-2 text-left">Container Size</th>
                    <th className="py-1 px-2 text-left">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {(customEditMode ? customDraft : customConversions).map(
                    (row, idx) => {
                      const standard = getStandardValue(row.size);
                      const custom = parseFloat(row.value);
                      const diff = custom - standard;
                      let diffDisplay = null;
                      if (Math.abs(diff) > 0.0001) {
                        diffDisplay = (
                          <span
                            className={
                              diff > 0
                                ? "text-green-600 ml-2 text-xs"
                                : "text-red-600 ml-2 text-xs"
                            }
                          >
                            {diff > 0 ? "+" : ""}
                            {diff.toFixed(2)}
                          </span>
                        );
                      }
                      return (
                        <tr key={row.size}>
                          <td className="py-1 px-2">{row.size}</td>
                          <td className="py-1 px-2 flex items-center">
                            {customEditMode ? (
                              <>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={row.value}
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    setCustomDraft((prev) =>
                                      prev.map((r, i) =>
                                        i === idx ? { ...r, value: newVal } : r
                                      )
                                    );
                                  }}
                                  className="w-24 h-7 text-right text-sm"
                                />
                                {diffDisplay}
                              </>
                            ) : (
                              <>
                                {row.value}
                                {diffDisplay}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
              <ul className="mt-3 text-xs text-gray-600 list-disc list-inside">
                <li>
                  These conversions apply to all disposal and transportation
                  items priced per container unless quoted separately.
                </li>
                <li>
                  Numbers are a factor of a 55-gallon drum (e.g., 55-gallon
                  price × factor = sell price).
                </li>
                <li>
                  The greater of the conversion factor or $40 minimum applies
                  unless quoted otherwise.
                </li>
                <li>
                  Some waste may have a different minimum, see Non-Standard
                  Minimum table.
                </li>
              </ul>
              <DialogFooter className="mt-4 flex gap-2">
                {customEditMode ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setCustomConversions(
                          customDraft.map((row) => ({ ...row }))
                        );
                        setCustomEditMode(false);
                        setConversionModalOpen(false);
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCustomEditMode(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCustomEditMode(true)}
                  >
                    Edit
                  </Button>
                )}
                <DialogClose asChild>
                  <Button size="sm" variant="ghost">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={addRowDialogOpen} onOpenChange={setAddRowDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Pricing Row</DialogTitle>
            <DialogDescription>
              Select the conversion type for this new pricing row. This will
              determine how container size conversions are calculated.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Conversion Type
              </Label>
              <ToggleGroup
                type="single"
                value={newRowConversionType}
                onValueChange={(val) => {
                  if (val)
                    setNewRowConversionType(val as "standard" | "custom");
                }}
                className="gap-2"
              >
                <ToggleGroupItem value="standard" className="flex-1">
                  <div className="text-center">
                    <div className="font-medium">Standard</div>
                    <div className="text-xs text-gray-500">
                      Use default conversions
                    </div>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem value="custom" className="flex-1">
                  <div className="text-center">
                    <div className="font-medium">Custom</div>
                    <div className="text-xs text-gray-500">
                      Use custom conversions
                    </div>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            {newRowConversionType === "custom" && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-2">
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> Custom conversion factors will apply to
                  this pricing entry only.
                </div>
              </div>
            )}
            {/* Conversion Table */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">
                {newRowConversionType === "standard"
                  ? "Container Conversion Table (Standard)"
                  : "Container Conversion Table (Custom)"}
              </h4>
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-1 px-2 text-left">Container Size</th>
                    <th className="py-1 px-2 text-left">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {(newRowConversionType === "standard"
                    ? STANDARD_CONVERSIONS
                    : addRowCustomDraft
                  ).map((row, idx) => (
                    <tr key={row.size}>
                      <td className="py-1 px-2">{row.size}</td>
                      <td className="py-1 px-2">
                        {newRowConversionType === "custom" ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={row.value}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setAddRowCustomDraft((prev) =>
                                prev.map((r, i) =>
                                  i === idx ? { ...r, value: newVal } : r
                                )
                              );
                            }}
                            className="w-24 h-7 text-right text-sm"
                          />
                        ) : (
                          row.value
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddRowDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newRowConversionType === "custom") {
                  setCustomConversions(
                    addRowCustomDraft.map((row) => ({ ...row }))
                  );
                }
                // Add row logic
                const newRow: GridRow = {
                  id: nextRowId.current.toString(),
                  ...initialRow,
                  quoteId: filterQuote || "",
                  generatorId: filterGenerator || "",
                  contractId: filterContract || "",
                  jobId: filterJob || "",
                  effectiveDate: filterEffectiveDate
                    ? format(filterEffectiveDate, "yyyy-MM-dd")
                    : "",
                  expirationDate: filterExpirationDate
                    ? format(filterExpirationDate, "yyyy-MM-dd")
                    : "",
                };
                nextRowId.current++;
                setGridData([...gridData, newRow]);
                setAddRowDialogOpen(false);
              }}
            >
              Add Row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!rowToDelete} onOpenChange={() => setRowToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Row</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this row? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteRow}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRow}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Ancillary Charges Edit Modal */}
      <Dialog
        open={ancillaryChargesModalOpen}
        onOpenChange={setAncillaryChargesModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ancillary Charges</DialogTitle>
            <DialogDescription>
              Adjust the ancillary charges for this pricing entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label
                htmlFor="modal-invoice-min"
                className="text-sm font-medium text-gray-700"
              >
                Invoice Minimum
              </Label>
              <Input
                id="modal-invoice-min"
                type="number"
                step="0.01"
                value={invoiceMinimum}
                onChange={(e) => setInvoiceMinimum(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="modal-ei-percent"
                className="text-sm font-medium text-gray-700"
              >
                E&I %
              </Label>
              <Input
                id="modal-ei-percent"
                type="number"
                step="0.1"
                value={eiPercent}
                onChange={(e) => setEiPercent(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="modal-emanifest-fee"
                className="text-sm font-medium text-gray-700"
              >
                e-Manifest Fee
              </Label>
              <Input
                id="modal-emanifest-fee"
                type="number"
                step="0.01"
                value={eManifestFee}
                onChange={(e) => setEManifestFee(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAncillaryChargesModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setAncillaryChargesModalOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Paste from Excel Modal */}
      <Dialog open={pasteModalOpen} onOpenChange={setPasteModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Paste from Excel</DialogTitle>
            <DialogDescription>
              Paste your Excel data below. The data should match the column
              structure of the grid.
            </DialogDescription>
          </DialogHeader>
          {/* Conversion Type Selector */}
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Conversion Type
            </Label>
            <ToggleGroup
              type="single"
              value={newRowConversionType}
              onValueChange={(val) => {
                if (val) setNewRowConversionType(val as "standard" | "custom");
              }}
              className="gap-2"
            >
              <ToggleGroupItem value="standard" className="flex-1">
                <div className="text-center">
                  <div className="font-medium">Standard</div>
                  <div className="text-xs text-gray-500">
                    Use default conversions
                  </div>
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem value="custom" className="flex-1">
                <div className="text-center">
                  <div className="font-medium">Custom</div>
                  <div className="text-xs text-gray-500">
                    Use custom conversions
                  </div>
                </div>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {/* Custom Conversion Table if Custom is selected */}
          {newRowConversionType === "custom" && (
            <div className="mb-4 border rounded bg-yellow-50 p-3">
              <div className="mb-2 text-sm text-yellow-800">
                <strong>
                  Custom conversion factors will apply to these imported rows
                  only.
                </strong>
              </div>
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-1 px-2 text-left">Container Size</th>
                    <th className="py-1 px-2 text-left">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {addRowCustomDraft.map((row, idx) => (
                    <tr key={row.size}>
                      <td className="py-1 px-2">{row.size}</td>
                      <td className="py-1 px-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={row.value}
                          onChange={(e) => {
                            const newVal = e.target.value;
                            setAddRowCustomDraft((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, value: newVal } : r
                              )
                            );
                          }}
                          className="w-24 h-7 text-right text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      const rows = text.trim().split("\n");
                      const parsedData = rows.map((row) => row.split("\t"));
                      setPastedData(parsedData);
                    }
                  } catch (err) {
                    console.error("Failed to read clipboard:", err);
                  }
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Get from Clipboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPastedData([])}
              >
                Clear
              </Button>
            </div>

            {pastedData.length > 0 && (
              <div
                className="border rounded-lg bg-white"
                style={{ maxWidth: "100%" }}
              >
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="text-sm font-medium text-gray-900">
                    Preview ({pastedData.length} rows)
                  </h4>
                </div>
                <div
                  className="max-h-96 overflow-x-auto overflow-y-auto"
                  style={{ maxWidth: "100%" }}
                >
                  <table className="w-full min-w-max text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        {columns.map((col, index) => (
                          <th
                            key={col.key}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-200"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pastedData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-100">
                          {columns.map((col, colIndex) => (
                            <td
                              key={col.key}
                              className="px-3 py-2 text-xs border-r border-gray-200"
                            >
                              {row[colIndex] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-600">
              <p>
                <strong>Instructions:</strong>
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Copy data from Excel (Ctrl+C)</li>
                <li>Click "Get from Clipboard" or paste directly (Ctrl+V)</li>
                <li>
                  Review the preview to ensure data matches column structure
                </li>
                <li>Click "Add Rows" to import the data</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newRowConversionType === "custom") {
                  setCustomConversions(
                    addRowCustomDraft.map((row) => ({ ...row }))
                  );
                }
                applyPastedData();
              }}
              disabled={pastedData.length === 0}
            >
              Add Rows ({pastedData.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
