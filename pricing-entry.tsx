"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
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
  Filter as FilterIcon,
} from "lucide-react";
import { format, addYears, parseISO, isValid, addDays } from "date-fns";
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
// @ts-ignore: No types for react-date-range
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { createPortal } from "react-dom";

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
  activeDates: { from: string; to: string };
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
  activeDates: { from: "", to: "" },
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
  type: "text" | "number" | "select" | "dropdown" | "date" | "daterange";
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
    key: "activeDates",
    label: "Active Dates",
    width: "min-w-[220px]",
    type: "daterange",
    required: true,
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

interface DateInputProps {
  value: { from: string; to: string };
  onChange: (range: { from: string; to: string }) => void;
}

function DateInput({ value, onChange }: DateInputProps): React.ReactElement {
  const [startDate, setStartDate] = React.useState(value?.from || "");
  const [endDate, setEndDate] = React.useState(value?.to || "");

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // If we have a valid start date, set end date to 1 year later
    if (newStartDate && newStartDate.length >= 4) {
      try {
        const startDateObj = new Date(newStartDate);
        if (isValid(startDateObj)) {
          const endDateObj = addYears(startDateObj, 1);
          const endDateString = format(endDateObj, "yyyy-MM-dd");
          setEndDate(endDateString);

          // Update the parent component
          onChange({
            from: newStartDate,
            to: endDateString,
          });
          return;
        }
      } catch (e) {
        // Invalid date, continue without updating end date
      }
    }

    // Update parent with current values
    onChange({
      from: newStartDate,
      to: endDate,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    // Update the parent component
    onChange({
      from: startDate,
      to: newEndDate,
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={startDate}
        onChange={handleStartDateChange}
        placeholder="Start date"
        className="w-24 text-sm border-0 p-0 h-full focus:ring-0 bg-transparent"
      />
      <span className="text-gray-400 text-sm">-</span>
      <input
        type="text"
        value={endDate}
        onChange={handleEndDateChange}
        placeholder="End date"
        className="w-24 text-sm border-0 p-0 h-full focus:ring-0 bg-transparent"
      />
    </div>
  );
}

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

  // Add Row Dialog State
  const [addRowDialogOpen, setAddRowDialogOpen] = useState(false);

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

  const [rowToDelete, setRowToDelete] = useState<string | null>(null);

  // Add these inside the component, above the return:
  const cancelDeleteRow = () => setRowToDelete(null);
  const confirmDeleteRow = () => {
    if (rowToDelete) {
      setGridData((prev) => prev.filter((row) => row.id !== rowToDelete));
      setRowToDelete(null);
    }
  };

  const handleAddRow = () => {
    // Prefill new row with filter values for relevant columns
    const newRow = {
      id: nextRowId.current.toString(),
      ...initialRow,
      ...Object.fromEntries(
        Object.entries(activeFilters)
          .filter(([colKey]) => columns.some((col) => col.key === colKey))
          .map(([colKey, val]) =>
            colKey === "activeDates" &&
            typeof val === "object" &&
            val &&
            "from" in val &&
            "to" in val
              ? [colKey, val]
              : [colKey, typeof val === "string" ? val : ""]
          )
      ),
    };
    nextRowId.current++;
    setGridData((prev) => [...prev, newRow]);

    // Focus the new row
    setTimeout(() => {
      setSelectedCell({
        rowIndex: gridData.length,
        colKey: columns[0].key,
      });
      setEditingCell({
        rowIndex: gridData.length,
        colKey: columns[0].key,
      });
    }, 0);
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
          if (colKey === "activeDates") {
            // Try to parse as date range (e.g. '2024-01-01 - 2024-01-31')
            const match = cellValue.match(
              /(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/
            );
            if (match) {
              newRow[colKey] = { from: match[1], to: match[2] };
            } else {
              newRow[colKey] = { from: "", to: "" };
            }
          } else {
            newRow[colKey] = cellValue.trim();
          }
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
    const value =
      col.key === "activeDates"
        ? row[col.key] &&
          typeof row[col.key] === "object" &&
          "from" in row[col.key] &&
          "to" in row[col.key]
          ? (row[col.key] as { from: string; to: string })
          : { from: "", to: "" }
        : typeof row[col.key] === "string"
        ? row[col.key]
        : "";

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
              <Select
                value={typeof value === "string" ? value : ""}
                onValueChange={handleInputChange}
              >
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
            <div className="text-sm opacity-0">
              {typeof value === "string" ? value : ""}
            </div>
          </td>
        );
      } else if (col.type === "daterange") {
        const dateValue = value as { from: string; to: string };
        return (
          <td
            key={col.key}
            className="px-3 py-2 border-r border-gray-200 relative"
          >
            <div className="absolute inset-0 bg-white border-2 border-blue-500 rounded-sm">
              <DateInput
                value={dateValue}
                onChange={(range) => {
                  setGridData((prev) => {
                    const updated = [...prev];
                    updated[rowIndex] = {
                      ...updated[rowIndex],
                      [col.key]: range,
                    };
                    return updated;
                  });
                }}
              />
            </div>
            <div className="text-sm opacity-0">
              {dateValue.from && dateValue.to
                ? `${dateValue.from} - ${dateValue.to}`
                : ""}
            </div>
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
                value={typeof value === "string" ? value : ""}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="border-0 p-0 h-full w-full focus:ring-0 text-sm bg-transparent"
                type="number"
                step="0.01"
                autoFocus
              />
            </div>
            <div className="text-sm opacity-0">
              {typeof value === "string" ? value : ""}
            </div>
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
                value={typeof value === "string" ? value : ""}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="border-0 p-0 h-full w-full focus:ring-0 text-sm bg-transparent"
                type="text"
                autoFocus
              />
            </div>
            <div className="text-sm opacity-0">
              {typeof value === "string" ? value : ""}
            </div>
          </td>
        );
      }
    }

    if (col.type === "daterange") {
      const dateValue = value as { from: string; to: string };
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
            {dateValue.from &&
            dateValue.to &&
            isValid(parseISO(dateValue.from)) &&
            isValid(parseISO(dateValue.to)) ? (
              `${format(parseISO(dateValue.from), "MMM dd, yyyy")} - ${format(
                parseISO(dateValue.to),
                "MMM dd, yyyy"
              )}`
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        </td>
      );
    }

    return (
      <td
        key={col.key}
        className={`px-3 py-2 border-r border-gray-200 cursor-pointer transition-colors ${
          isSelected ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50"
        }`}
        onClick={() => handleCellClick(rowIndex, col.key)}
        onDoubleClick={() => handleCellDoubleClick(rowIndex, col.key)}
        onContextMenu={
          typeof value === "string" && value.trim() !== ""
            ? (e) => handleCellContextMenu(e, col.key, value)
            : undefined
        }
      >
        <div className="text-sm min-h-[20px] flex items-center">
          {typeof value === "string" ? (
            value
          ) : (
            <span className="text-gray-400">-</span>
          )}
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
    const values = gridData.map((row) => row[colKey]);
    // Only return string values
    return Array.from(
      new Set(values.filter((v): v is string => typeof v === "string"))
    );
  };

  // Add this handler inside the component
  const handleFilterByRow = (row: GridRow) => {
    const newFilters: { [key: string]: any } = {};
    columns.forEach((col) => {
      const val = row[col.key];
      if (col.key === "activeDates") {
        if (val && typeof val === "object" && val.from && val.to) {
          newFilters[col.key] = val;
        }
      } else if (typeof val === "string" && val.trim() !== "") {
        newFilters[col.key] = val;
      }
    });
    setActiveFilters(newFilters);
  };

  // Add state for context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    colKey: keyof GridRow | null;
    value: string | null;
  } | null>(null);

  // Handler to open context menu
  const handleCellContextMenu = (
    e: React.MouseEvent,
    colKey: keyof GridRow,
    value: string | null
  ) => {
    e.preventDefault();
    if (value && value.trim() !== "") {
      setContextMenu({ x: e.clientX, y: e.clientY, colKey, value });
    } else {
      setContextMenu(null);
    }
  };

  // Handler to apply filter from context menu
  const handleApplyFilterFromMenu = () => {
    if (contextMenu && contextMenu.colKey && contextMenu.value) {
      setFilter(contextMenu.colKey, contextMenu.value);
    }
    setContextMenu(null);
  };

  // Handler to close context menu
  const handleCloseContextMenu = () => setContextMenu(null);

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
        <div className="px-6 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Customer Info */}
          <div className="flex-1 min-w-[260px]">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pricing</h1>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Customer Name
              </h2>
              <p className="text-sm text-gray-700 mt-1">CN-10001</p>
              <p className="text-sm text-gray-700">123 Main Street</p>
              <p className="text-sm text-gray-700">Anytown, ST 12345</p>
            </div>
          </div>
          {/* Right: Ancillary Charges */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 min-w-[280px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                ANCILLARY CHARGES
              </h3>
              <button
                className="text-xs text-blue-700 hover:underline focus:outline-none"
                onClick={() => setAncillaryChargesModalOpen(true)}
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-medium text-gray-700 block mb-1">
                  Invoice Minimum
                </Label>
                <div className="h-8 flex items-center text-sm font-medium text-gray-900">
                  $500.00
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700 block mb-1">
                  E&I %
                </Label>
                <div className="h-8 flex items-center text-sm font-medium text-gray-900">
                  2.5%
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700 block mb-1">
                  e-Manifest Fee
                </Label>
                <div className="h-8 flex items-center text-sm font-medium text-gray-900">
                  $15.00
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
                Total: <strong className="text-gray-900">0</strong>
              </span>
              <span>
                Invalid: <strong className="text-gray-900">0</strong>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Pricing
            </Button>
          </div>
        </div>
        {/* Applied Filters Section above the grid */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Applied Filters:
            </span>
            {Object.entries(activeFilters).map(([colKey, value]) => {
              if (
                colKey === "activeDates" &&
                value &&
                typeof value === "object" &&
                "from" in value &&
                "to" in value
              ) {
                return (
                  <span
                    key={colKey}
                    className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium"
                  >
                    Active Dates:{" "}
                    {value.from && value.to
                      ? `${format(
                          parseISO(value.from as string),
                          "MMM dd, yyyy"
                        )} - ${format(
                          parseISO(value.to as string),
                          "MMM dd, yyyy"
                        )}`
                      : "-"}
                    <button
                      className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                      onClick={() => setFilter(colKey, { from: "", to: "" })}
                      aria-label={`Remove filter for ${colKey}`}
                    >
                      ×
                    </button>
                  </span>
                );
              }
              return (
                <span
                  key={colKey}
                  className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {columns.find((c) => c.key === colKey)?.label}:{" "}
                  {typeof value === "string" ? value : "-"}
                  <button
                    className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                    onClick={() => setFilter(colKey, "")}
                    aria-label={`Remove filter for ${colKey}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
            <button
              className="ml-2 text-xs text-red-500 hover:text-red-700 underline"
              onClick={() => setActiveFilters({})}
            >
              Clear All
            </button>
          </div>
        )}
        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div
            className="overflow-x-auto max-h-[65vh] overflow-y-auto"
            tabIndex={0}
            onKeyDown={filterPopoverOpen ? undefined : handleKeyDown}
            onPaste={(e) => {
              e.preventDefault();
              const clipboardText = e.clipboardData.getData("text");
              if (!clipboardText) return;
              const rows = clipboardText.trim().split("\n");
              const parsedData = rows.map((row) => row.split("\t"));
              setPastedData(parsedData);
              setPasteModalOpen(true);
            }}
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
                              aria-label={`Filter ${col.label}`}
                            >
                              <Filter className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3">
                            <div className="mb-2 text-xs font-semibold text-gray-700">
                              Filter {col.label}
                            </div>
                            {col.type === "dropdown" ? (
                              <DropdownFilter
                                colKey={col.key}
                                values={getUniqueValues(
                                  col.key as keyof GridRow
                                )}
                                active={
                                  Array.isArray(activeFilters[col.key])
                                    ? (activeFilters[col.key] as string[])
                                    : []
                                }
                                onApply={(selected: string[]) => {
                                  setFilter(col.key, selected);
                                  setFilterPopoverOpen(null);
                                }}
                                onClear={() => {
                                  setFilter(col.key, []);
                                  setFilterPopoverOpen(null);
                                }}
                              />
                            ) : (
                              <TextFilter
                                value={
                                  typeof activeFilters[col.key] === "string"
                                    ? (activeFilters[col.key] as string)
                                    : ""
                                }
                                onApply={(val: string) => {
                                  setFilter(col.key, val);
                                  setFilterPopoverOpen(null);
                                }}
                                onClear={() => {
                                  setFilter(col.key, "");
                                  setFilterPopoverOpen(null);
                                }}
                              />
                            )}
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
                    <tr key={row.id}>
                      <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-700 flex items-center gap-2">
                        {rowIndex + 1}
                        <button
                          className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                          onClick={() => setRowToDelete(row.id)}
                          aria-label="Delete row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
            onClick={handleAddRow}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="px-6 py-4 flex items-end justify-end">
          <Button size="sm" className="bg-black text-white">
            <Save className="h-4 w-4 mr-2" />
            Save Pricing
          </Button>
        </div>
      </div>

      {/* Delete Row Confirmation Dialog */}
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

      {/* Paste Modal */}
      <Dialog open={pasteModalOpen} onOpenChange={setPasteModalOpen}>
        <DialogContent className="fixed inset-0 w-full h-full max-w-none max-h-none flex flex-col bg-white z-50 rounded-none shadow-none p-0 overflow-auto">
          <DialogHeader className="px-8 pt-8 pb-4 border-b">
            <DialogTitle>Paste from Excel</DialogTitle>
            <DialogDescription>
              Paste your Excel data below. The data should match the column
              structure of the grid.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col px-8 py-6 overflow-auto">
            {/* Paste Controls */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                onClick={async () => {
                  const text = await navigator.clipboard.readText();
                  const rows = text.trim().split("\n");
                  const parsedData = rows.map((row) => row.split("\t"));
                  setPastedData(parsedData);
                }}
              >
                <span className="mr-2">📋</span> Get from Clipboard
              </Button>
              <Button variant="outline" onClick={() => setPastedData([[]])}>
                Clear
              </Button>
            </div>

            {/* Preview Table */}
            <div className="mb-4 border rounded-lg bg-gray-50 flex-1 overflow-auto">
              <div className="px-4 py-2 border-b text-xs font-semibold text-gray-700 bg-gray-100">
                Preview ({pastedData.length} row
                {pastedData.length !== 1 ? "s" : ""})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pastedData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                          <td
                            key={col.key}
                            className="px-3 py-2 border-r border-gray-200 text-gray-900 whitespace-nowrap"
                          >
                            {row[colIndex] || (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-700 mb-2 mt-4">
              <div className="font-semibold mb-1">Instructions:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Copy data from Excel (Ctrl+C)</li>
                <li>Click "Get from Clipboard" or paste directly (Ctrl+V)</li>
                <li>
                  Review the preview to ensure data matches column structure
                </li>
                <li>Click "Add Rows" to import the data</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex justify-end gap-2 px-8 pb-8 border-t pt-4 bg-white sticky bottom-0">
            <Button variant="outline" onClick={() => setPasteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={applyPastedData}
              disabled={
                pastedData.length === 0 ||
                (pastedData.length === 1 && pastedData[0].length === 0)
              }
            >
              Add Rows ({pastedData.length})
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
              Update the ancillary charges for this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="block mb-1">Invoice Minimum</Label>
              <Input
                type="text"
                value={invoiceMinimum}
                onChange={(e) => setInvoiceMinimum(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label className="block mb-1">E&amp;I %</Label>
              <Input
                type="text"
                value={eiPercent}
                onChange={(e) => setEiPercent(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label className="block mb-1">e-Manifest Fee</Label>
              <Input
                type="text"
                value={eManifestFee}
                onChange={(e) => setEManifestFee(e.target.value)}
                className="w-full"
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
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 10000,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            minWidth: 140,
            padding: 0,
          }}
          onClick={handleCloseContextMenu}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={handleApplyFilterFromMenu}
          >
            Apply Filter
          </button>
        </div>
      )}
    </div>
  );
}

interface DropdownFilterProps {
  colKey: string;
  values: string[];
  active: string[];
  onApply: (selected: string[]) => void;
  onClear: () => void;
}

function DropdownFilter({
  colKey,
  values,
  active,
  onApply,
  onClear,
}: DropdownFilterProps): React.ReactElement {
  // Only allow string values in active
  const filteredActive = active.filter(
    (v): v is string => typeof v === "string"
  );
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1">
        {values.map((val) => (
          <button
            key={val}
            className={`px-2 py-1 rounded text-xs border ${
              filteredActive.includes(val)
                ? "bg-blue-100 border-blue-400 text-blue-700"
                : "border-gray-300 text-gray-700"
            }`}
            onClick={() => {
              if (filteredActive.includes(val)) {
                onApply(filteredActive.filter((v) => v !== val));
              } else {
                onApply([...filteredActive, val]);
              }
            }}
          >
            {val}
          </button>
        ))}
      </div>
      <button className="text-xs text-gray-500 underline" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}

interface TextFilterProps {
  value: string;
  onApply: (val: string) => void;
  onClear: () => void;
}

function TextFilter({
  value,
  onApply,
  onClear,
}: TextFilterProps): React.ReactElement {
  const [inputValue, setInputValue] = React.useState(value);

  return (
    <div className="space-y-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter filter value..."
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onApply(inputValue)}
          className="flex-1"
        >
          Apply
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setInputValue("");
            onClear();
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
