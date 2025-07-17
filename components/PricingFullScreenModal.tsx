// TODO: Add Excel upload and preview steps in future iterations
import React, { useState } from "react";
import { createPortal } from "react-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  FileSpreadsheet,
  Clipboard,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Sparkles,
  PenSquare,
  CalendarIcon,
  Settings,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PriceHeader {
  priceHeaderId: string;
  headerName: string;
  description?: string;
  effectiveDate: string;
  expirationDate: string;
  status: string;
}

interface ContainerConversionItem {
  containerSize: string;
  standardValue: number;
  customValue: number;
}

interface HeaderFields {
  eei: string;
  eeiValue?: number;
  fuelSurcharge: string;
  invoiceMinimum: number;
  containerConversion: string;
  containerMinimum: number;
  containerConversions: ContainerConversionItem[];
  itemMinimums: string;
  economicAdjustmentFee: number;
  eManifestFee: number;
  hubFee: boolean;
  regionalPricing: boolean;
  zoneTransportation: boolean;
  effectiveDate: Date | undefined;
  expirationDate: Date | undefined;
}

interface PricingFullScreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  priceHeaders: PriceHeader[];
  onSuccess?: (headerFields: HeaderFields) => void;
}

type Step = "effective-dates" | "header" | "excel-input" | "preview";

const STANDARD_CONTAINER_CONVERSIONS: ContainerConversionItem[] = [
  { containerSize: "<=5 Gallon", standardValue: 0.35, customValue: 0.35 },
  { containerSize: "10 Gallon", standardValue: 0.55, customValue: 0.55 },
  { containerSize: "15 Gallon", standardValue: 0.65, customValue: 0.65 },
  { containerSize: "20 Gallon", standardValue: 0.75, customValue: 0.75 },
  { containerSize: "30 Gallon", standardValue: 0.85, customValue: 0.85 },
  { containerSize: "55 Gallon (base)", standardValue: 1, customValue: 1 },
  { containerSize: "85 Gallon", standardValue: 1.45, customValue: 1.45 },
  { containerSize: "95–110 Gallon", standardValue: 2, customValue: 2 },
  { containerSize: "CYB/Supersack", standardValue: 4, customValue: 4 },
  { containerSize: "<= 275 Gallon", standardValue: 5, customValue: 5 },
  { containerSize: "276–330 Gallon", standardValue: 5.5, customValue: 5.5 },
];

const STANDARD_TEMPLATE: HeaderFields = {
  eei: "15",
  fuelSurcharge: "Standard Monthly",
  invoiceMinimum: 350,
  containerConversion: "Standard",
  containerMinimum: 30,
  containerConversions: [...STANDARD_CONTAINER_CONVERSIONS],
  itemMinimums: "Standard Tables",
  economicAdjustmentFee: 3,
  eManifestFee: 25,
  hubFee: true,
  regionalPricing: true,
  zoneTransportation: true,
  effectiveDate: new Date(),
  expirationDate: undefined,
};

export function PricingFullScreenModal({
  open,
  onOpenChange,
  customerId,
  priceHeaders,
  onSuccess,
}: PricingFullScreenModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("effective-dates");
  const [pricingType, setPricingType] = useState<"new" | "addendum">("new");
  const [selectedPriceHeader, setSelectedPriceHeader] = useState<string>("");
  const [priceGroupName, setPriceGroupName] = useState("");
  const [headerTemplateType, setHeaderTemplateType] = useState<
    "standard" | "custom"
  >("standard");
  const [headerFields, setHeaderFields] = useState<HeaderFields>({
    ...STANDARD_TEMPLATE,
  });
  const [isHeaderCustomized, setIsHeaderCustomized] = useState(false);
  const [customizedFields, setCustomizedFields] = useState<Set<string>>(
    new Set()
  );
  const [showHeaderEditor, setShowHeaderEditor] = useState(false);
  const [showContainerConversionModal, setShowContainerConversionModal] =
    useState(false);
  const [excelInputMethod, setExcelInputMethod] = useState<"upload" | "paste">(
    "upload"
  );
  const [pastedData, setPastedData] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Track raw input values for better UX
  const [rawInputValues, setRawInputValues] = useState<{
    [key: string]: string;
  }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleEffectiveDatesContinue = () => {
    if (!headerFields.effectiveDate) {
      toast.error("Please select an effective date");
      return;
    }
    setCurrentStep("header");
  };

  const handleHeaderContinue = () => {
    setCurrentStep("excel-input");
  };

  const handleExcelInputContinue = async () => {
    if (excelInputMethod === "paste" && !pastedData.trim()) {
      toast.error("Please paste Excel data or upload a file");
      return;
    }
    if (excelInputMethod === "upload" && !uploadedFile) {
      toast.error("Please upload an Excel file");
      return;
    }

    setIsProcessing(true);
    try {
      let data: any[] = [];

      if (excelInputMethod === "paste") {
        // Parse pasted data
        const rows = pastedData.trim().split("\n");
        data = rows.map((row) => row.split("\t"));
      } else if (uploadedFile) {
        // Parse uploaded file
        const workbook = XLSX.read(await uploadedFile.arrayBuffer(), {
          type: "array",
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      }

      if (data.length === 0) {
        toast.error("No data found in the Excel content");
        return;
      }

      setParsedData(data);
      setCurrentStep("preview");
    } catch (error) {
      console.error("Error parsing Excel data:", error);
      toast.error("Error parsing Excel data. Please check the format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPastedData(text);
    } catch (error) {
      toast.error("Failed to read from clipboard. Please paste manually.");
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "header":
        setCurrentStep("effective-dates");
        break;
      case "excel-input":
        setCurrentStep("header");
        break;
      case "preview":
        setCurrentStep("excel-input");
        break;
    }
  };

  const resetModal = () => {
    setCurrentStep("effective-dates");
    setPricingType("new");
    setSelectedPriceHeader("");
    setPriceGroupName("");
    setHeaderTemplateType("standard");
    setHeaderFields({ ...STANDARD_TEMPLATE });
    setIsHeaderCustomized(false);
    setCustomizedFields(new Set());
    setShowHeaderEditor(false);
    setExcelInputMethod("upload");
    setPastedData("");
    setUploadedFile(null);
    setParsedData([]);
    setIsProcessing(false);
    setIsPreviewExpanded(false);
    setIsSaving(false);
    setRawInputValues({});
    setFocusedField(null);
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  const handleCreatePricing = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Pricing created successfully!");

      // Route to the new quote page
      const newQuoteId = "new-quote-id"; // This would come from the API response
      router.push(`/customer-pricing/${customerId}/quote/${newQuoteId}`);

      handleClose();
      if (onSuccess) {
        onSuccess(headerFields);
      }
    } catch (error) {
      toast.error("Failed to create pricing");
    } finally {
      setIsSaving(false);
    }
  };

  const updateHeaderField = (field: keyof HeaderFields, value: any) => {
    setHeaderFields((prev) => ({ ...prev, [field]: value }));

    // Special handling for eeiValue field
    if (field === "eeiValue") {
      setCustomizedFields((prev) => new Set(prev).add("eeiValue"));
      setIsHeaderCustomized(true);
      if (headerTemplateType === "standard") {
        setHeaderTemplateType("custom");
      }
      return;
    }

    // Check if the value is different from standard template
    const standardValue = STANDARD_TEMPLATE[field];
    if (value !== standardValue) {
      setCustomizedFields((prev) => new Set(prev).add(field));
      setIsHeaderCustomized(true);

      // If currently on "standard" template, automatically switch to "custom"
      if (headerTemplateType === "standard") {
        setHeaderTemplateType("custom");
      }
    } else {
      setCustomizedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });

      // Check if any fields are still customized
      const allFields = Object.keys(
        STANDARD_TEMPLATE
      ) as (keyof HeaderFields)[];
      const hasCustomizedFields = allFields.some((f) => {
        if (f === field) return false; // We just reset this one
        return headerFields[f] !== STANDARD_TEMPLATE[f];
      });

      if (!hasCustomizedFields) {
        setIsHeaderCustomized(false);
        // Only switch back to "standard" if all fields are reset to standard values
        setHeaderTemplateType("standard");
      }
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "effective-dates", label: "Effective Dates" },
      { key: "header", label: "Header" },
      { key: "excel-input", label: "Data" },
      { key: "preview", label: "Preview" },
    ];

    return (
      <div className="flex items-center space-x-2 mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.key
                    ? "bg-primary-1 text-white"
                    : index < steps.findIndex((s) => s.key === currentStep)
                    ? "bg-primary-1/80 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index < steps.findIndex((s) => s.key === currentStep) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-4 h-px bg-gray-300" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderEffectiveDatesStep = () => (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Effective Dates
        </h3>
        <p className="text-gray-600">
          Set the effective and expiration dates for your pricing quote.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="effective-date">Effective Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !headerFields.effectiveDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {headerFields.effectiveDate ? (
                    format(headerFields.effectiveDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                <Calendar
                  mode="single"
                  selected={headerFields.effectiveDate}
                  onSelect={(date) => {
                    setHeaderFields((prev) => ({
                      ...prev,
                      effectiveDate: date,
                    }));
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="expiration-date">Expiration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !headerFields.expirationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {headerFields.expirationDate ? (
                    format(headerFields.expirationDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                <Calendar
                  mode="single"
                  selected={headerFields.expirationDate}
                  onSelect={(date) => {
                    setHeaderFields((prev) => ({
                      ...prev,
                      expirationDate: date,
                    }));
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleEffectiveDatesContinue();
          }}
          disabled={!headerFields.effectiveDate}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderHeaderStep = () => (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pricing Header Configuration
        </h3>
        <p className="text-gray-600">
          Configure the pricing header settings. Fields will be highlighted when
          customized.
        </p>
      </div>

      <div className="space-y-8">
        {/* Template Type Selection */}
        <div>
          <div className="flex gap-4">
            <Card
              className={`cursor-pointer transition-all flex-1 ${
                headerTemplateType === "standard"
                  ? "ring-2 ring-primary-1 bg-primary-1/10"
                  : "hover:bg-primary-1/5"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setHeaderTemplateType("standard");
                setHeaderFields({ ...STANDARD_TEMPLATE });
                setCustomizedFields(new Set());
                setIsHeaderCustomized(false);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      headerTemplateType === "standard"
                        ? "bg-primary-1/20"
                        : "bg-primary-1/5"
                    }`}
                  >
                    <Settings
                      className={`w-5 h-5 ${
                        headerTemplateType === "standard"
                          ? "text-primary-1"
                          : "text-primary-1/70"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Standard Template
                    </h4>
                    <p className="text-xs text-gray-600">
                      Use predefined standard settings
                    </p>
                  </div>
                  {headerTemplateType === "standard" && (
                    <Check className="w-4 h-4 text-primary-1" />
                  )}
                </div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-all flex-1 ${
                headerTemplateType === "custom"
                  ? "ring-2 ring-primary-1 bg-primary-1/10"
                  : "hover:bg-primary-1/5"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setHeaderTemplateType("custom");
                setIsHeaderCustomized(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      headerTemplateType === "custom"
                        ? "bg-primary-1/20"
                        : "bg-primary-1/5"
                    }`}
                  >
                    <PenSquare
                      className={`w-5 h-5 ${
                        headerTemplateType === "custom"
                          ? "text-primary-1"
                          : "text-primary-1/70"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Custom Template
                    </h4>
                    <p className="text-xs text-gray-600">
                      Customize individual settings
                    </p>
                  </div>
                  {headerTemplateType === "custom" && (
                    <Check className="w-4 h-4 text-primary-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {headerTemplateType === "standard" ? (
          /* Standard Template Summary */
          <Card className="bg-gray-50 border border-gray-200 w-1/2">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Standard Price Header
                </h4>
              </div>
              <div className="grid grid-cols-1">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">EEI:</span>
                    <span className="font-medium">
                      {STANDARD_TEMPLATE.eei}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">
                      Invoice Minimum:
                    </span>
                    <span className="font-medium">
                      ${STANDARD_TEMPLATE.invoiceMinimum}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">
                      Economic Adjustment Fee:
                    </span>
                    <span className="font-medium">
                      {STANDARD_TEMPLATE.economicAdjustmentFee}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">
                      E-Manifest Fee:
                    </span>
                    <span className="font-medium">
                      ${STANDARD_TEMPLATE.eManifestFee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">
                      Container Conversion:
                    </span>
                    <span className="font-medium">
                      {STANDARD_TEMPLATE.containerConversion}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">
                      Container Minimum:
                    </span>
                    <span className="font-medium">
                      ${STANDARD_TEMPLATE.containerMinimum}
                    </span>
                  </div>
                </div>
              </div>
              {/* Condensed options row at the bottom */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-row flex-wrap gap-2 items-center">
                  {STANDARD_TEMPLATE.hubFee && (
                    <div className="flex items-center space-x-1">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Hub Fee</span>
                    </div>
                  )}
                  {STANDARD_TEMPLATE.regionalPricing && (
                    <div className="flex items-center space-x-1">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        Regional Pricing
                      </span>
                    </div>
                  )}
                  {STANDARD_TEMPLATE.zoneTransportation && (
                    <div className="flex items-center space-x-1">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        Zone Transportation
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Custom Template Form */
          <>
            {/* General Settings */}
            <div className="w-3/4">
              <h4 className="text-lg font-semibold mb-4">
                Custom Price Header
              </h4>
              <div className="grid grid-cols-1">
                <div className="space-y-4">
                  {/* EEI */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold w-48">
                      EEI:
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border rounded-md bg-white">
                        <Input
                          type="text"
                          value={
                            focusedField === "eeiValue"
                              ? rawInputValues["eeiValue"] || ""
                              : headerFields.eeiValue
                              ? headerFields.eeiValue.toFixed(2)
                              : "15.00"
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ""
                            );
                            setRawInputValues((prev) => ({
                              ...prev,
                              eeiValue: value,
                            }));

                            if (value === "" || value === ".") {
                              updateHeaderField("eeiValue", 15);
                            } else {
                              const numValue = Number(value);
                              if (!isNaN(numValue)) {
                                updateHeaderField("eeiValue", numValue);
                              }
                            }
                          }}
                          onFocus={() => {
                            setFocusedField("eeiValue");
                            setRawInputValues((prev) => ({
                              ...prev,
                              eeiValue: headerFields.eeiValue
                                ? headerFields.eeiValue.toString()
                                : "15",
                            }));
                          }}
                          onBlur={(e) => {
                            setFocusedField(null);
                            const value =
                              e.target.value === ""
                                ? 15
                                : Number(e.target.value);
                            updateHeaderField(
                              "eeiValue",
                              Number(value.toFixed(2))
                            );
                          }}
                          placeholder="15.00"
                          className="w-24 border-0 focus:ring-0 focus:border-0 shadow-none rounded-none h-8"
                        />
                        <span className="px-2 py-1 text-sm text-gray-500 bg-gray-50 border-l rounded-r-md">
                          %
                        </span>
                      </div>
                      <div className="w-40 text-xs text-gray-500">
                        {customizedFields.has("eeiValue") ? (
                          <>Standard: 5.00%</>
                        ) : (
                          <span className="invisible">Standard: 5.00%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Invoice Minimum */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold w-48">
                      Invoice Minimum:
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border rounded-md bg-white">
                        <span className="px-2 py-1 text-sm text-gray-500 bg-gray-50 border-r rounded-l-md">
                          $
                        </span>
                        <Input
                          type="text"
                          value={
                            focusedField === "invoiceMinimum"
                              ? rawInputValues["invoiceMinimum"] || ""
                              : headerFields.invoiceMinimum.toFixed(2)
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ""
                            );
                            setRawInputValues((prev) => ({
                              ...prev,
                              invoiceMinimum: value,
                            }));

                            if (value === "" || value === ".") {
                              updateHeaderField("invoiceMinimum", 0);
                            } else {
                              const numValue = Number(value);
                              if (!isNaN(numValue)) {
                                updateHeaderField("invoiceMinimum", numValue);
                              }
                            }
                          }}
                          onFocus={() => {
                            setFocusedField("invoiceMinimum");
                            setRawInputValues((prev) => ({
                              ...prev,
                              invoiceMinimum:
                                headerFields.invoiceMinimum.toString(),
                            }));
                          }}
                          onBlur={(e) => {
                            setFocusedField(null);
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            updateHeaderField(
                              "invoiceMinimum",
                              Number(value.toFixed(2))
                            );
                          }}
                          placeholder="350.00"
                          className="w-24 border-0 focus:ring-0 focus:border-0 shadow-none h-8"
                        />
                      </div>
                      <div className="w-40 text-xs text-gray-500">
                        {customizedFields.has("invoiceMinimum") ? (
                          <>Standard: ${STANDARD_TEMPLATE.invoiceMinimum}</>
                        ) : (
                          <span className="invisible">Standard: $350</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Economic Adjustment Fee */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold w-48">
                      Economic Adjustment Fee:
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border rounded-md bg-white">
                        <Input
                          type="text"
                          value={
                            focusedField === "economicAdjustmentFee"
                              ? rawInputValues["economicAdjustmentFee"] || ""
                              : headerFields.economicAdjustmentFee.toFixed(2)
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ""
                            );
                            setRawInputValues((prev) => ({
                              ...prev,
                              economicAdjustmentFee: value,
                            }));

                            if (value === "" || value === ".") {
                              updateHeaderField("economicAdjustmentFee", 0);
                            } else {
                              const numValue = Number(value);
                              if (!isNaN(numValue)) {
                                updateHeaderField(
                                  "economicAdjustmentFee",
                                  numValue
                                );
                              }
                            }
                          }}
                          onFocus={() => {
                            setFocusedField("economicAdjustmentFee");
                            setRawInputValues((prev) => ({
                              ...prev,
                              economicAdjustmentFee:
                                headerFields.economicAdjustmentFee.toString(),
                            }));
                          }}
                          onBlur={(e) => {
                            setFocusedField(null);
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            updateHeaderField(
                              "economicAdjustmentFee",
                              Number(value.toFixed(2))
                            );
                          }}
                          placeholder="3.00"
                          className="w-24 border-0 focus:ring-0 focus:border-0 shadow-none rounded-none h-8"
                        />
                        <span className="px-2 py-1 text-sm text-gray-500 bg-gray-50 border-l rounded-r-md">
                          %
                        </span>
                      </div>
                      <div className="w-40 text-xs text-gray-500">
                        {customizedFields.has("economicAdjustmentFee") ? (
                          <>
                            Standard: {STANDARD_TEMPLATE.economicAdjustmentFee}%
                          </>
                        ) : (
                          <span className="invisible">Standard: 3%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* E-Manifest Fee */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold w-48">
                      E-Manifest Fee:
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border rounded-md bg-white">
                        <span className="px-2 py-1 text-sm text-gray-500 bg-gray-50 border-r rounded-l-md">
                          $
                        </span>
                        <Input
                          type="text"
                          value={
                            focusedField === "eManifestFee"
                              ? rawInputValues["eManifestFee"] || ""
                              : headerFields.eManifestFee.toFixed(2)
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ""
                            );
                            setRawInputValues((prev) => ({
                              ...prev,
                              eManifestFee: value,
                            }));

                            if (value === "" || value === ".") {
                              updateHeaderField("eManifestFee", 0);
                            } else {
                              const numValue = Number(value);
                              if (!isNaN(numValue)) {
                                updateHeaderField("eManifestFee", numValue);
                              }
                            }
                          }}
                          onFocus={() => {
                            setFocusedField("eManifestFee");
                            setRawInputValues((prev) => ({
                              ...prev,
                              eManifestFee:
                                headerFields.eManifestFee.toString(),
                            }));
                          }}
                          onBlur={(e) => {
                            setFocusedField(null);
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            updateHeaderField(
                              "eManifestFee",
                              Number(value.toFixed(2))
                            );
                          }}
                          placeholder="25.00"
                          className="w-24 border-0 focus:ring-0 focus:border-0 shadow-none h-8"
                        />
                      </div>
                      <div className="w-40 text-xs text-gray-500">
                        {customizedFields.has("eManifestFee") ? (
                          <>Standard: ${STANDARD_TEMPLATE.eManifestFee}</>
                        ) : (
                          <span className="invisible">Standard: $25</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Container Conversion */}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-semibold w-48">
                      Container Conversion:
                    </span>

                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="standard-conversion"
                          name="container-conversion"
                          value="Standard"
                          checked={
                            headerFields.containerConversion === "Standard"
                          }
                          onChange={(e) => {
                            updateHeaderField(
                              "containerConversion",
                              e.target.value
                            );
                          }}
                          className="w-4 h-4 text-primary-1 border-gray-300 focus:ring-primary-1/50"
                        />
                        <Label
                          htmlFor="standard-conversion"
                          className="text-sm font-medium"
                        >
                          Standard
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="custom-conversion"
                          name="container-conversion"
                          value="Custom"
                          checked={
                            headerFields.containerConversion === "Custom"
                          }
                          onChange={(e) => {
                            updateHeaderField(
                              "containerConversion",
                              e.target.value
                            );
                          }}
                          className="w-4 h-4 text-primary-1 border-gray-300 focus:ring-primary-1/50"
                        />
                        <Label
                          htmlFor="custom-conversion"
                          className="text-sm font-medium"
                        >
                          Custom
                        </Label>
                      </div>
                      <div className="w-40 text-xs text-gray-500"></div>
                    </div>
                  </div>
                  {headerFields.containerConversion === "Custom" && (
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                        <span className="text-sm font-medium text-gray-700">
                          Container Conversion Factors
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setHeaderFields((prev) => ({
                              ...prev,
                              containerConversions: [
                                ...STANDARD_CONTAINER_CONVERSIONS,
                              ],
                            }));
                            setCustomizedFields((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete("containerConversions");
                              return newSet;
                            });
                            updateHeaderField(
                              "containerConversion",
                              "Standard"
                            );
                          }}
                          className="flex items-center space-x-2 h-7"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span className="text-xs">Reset to Standard</span>
                        </Button>
                      </div>
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Container Size
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Standard Value
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Custom Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {headerFields.containerConversions.map(
                            (item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.containerSize}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {item.standardValue}x
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="text"
                                      value={
                                        focusedField ===
                                        `containerConversion_${index}`
                                          ? rawInputValues[
                                              `containerConversion_${index}`
                                            ] || ""
                                          : item.customValue.toFixed(2)
                                      }
                                      onChange={(e) => {
                                        const value = e.target.value.replace(
                                          /[^0-9.]/g,
                                          ""
                                        );
                                        setRawInputValues((prev) => ({
                                          ...prev,
                                          [`containerConversion_${index}`]:
                                            value,
                                        }));

                                        if (value === "" || value === ".") {
                                          const updatedConversions = [
                                            ...headerFields.containerConversions,
                                          ];
                                          updatedConversions[index] = {
                                            ...item,
                                            customValue: item.standardValue,
                                          };
                                          setHeaderFields((prev) => ({
                                            ...prev,
                                            containerConversions:
                                              updatedConversions,
                                          }));
                                        } else {
                                          const numValue = Number(value);
                                          if (!isNaN(numValue)) {
                                            const updatedConversions = [
                                              ...headerFields.containerConversions,
                                            ];
                                            updatedConversions[index] = {
                                              ...item,
                                              customValue: numValue,
                                            };
                                            setHeaderFields((prev) => ({
                                              ...prev,
                                              containerConversions:
                                                updatedConversions,
                                            }));

                                            const hasCustomValues =
                                              updatedConversions.some(
                                                (conv) =>
                                                  conv.customValue !==
                                                  conv.standardValue
                                              );

                                            if (hasCustomValues) {
                                              setCustomizedFields((prev) =>
                                                new Set(prev).add(
                                                  "containerConversions"
                                                )
                                              );
                                              setIsHeaderCustomized(true);
                                              if (
                                                (headerTemplateType as string) ===
                                                "standard"
                                              ) {
                                                setHeaderTemplateType("custom");
                                              }
                                            } else {
                                              setCustomizedFields((prev) => {
                                                const newSet = new Set(prev);
                                                newSet.delete(
                                                  "containerConversions"
                                                );
                                                return newSet;
                                              });
                                            }
                                          }
                                        }
                                      }}
                                      onFocus={() => {
                                        setFocusedField(
                                          `containerConversion_${index}`
                                        );
                                        setRawInputValues((prev) => ({
                                          ...prev,
                                          [`containerConversion_${index}`]:
                                            item.customValue.toString(),
                                        }));
                                      }}
                                      onBlur={(e) => {
                                        setFocusedField(null);
                                        const value =
                                          e.target.value === ""
                                            ? item.standardValue
                                            : Number(e.target.value);
                                        const formattedValue = Number(
                                          value.toFixed(2)
                                        );
                                        const updatedConversions = [
                                          ...headerFields.containerConversions,
                                        ];
                                        updatedConversions[index] = {
                                          ...item,
                                          customValue: formattedValue,
                                        };
                                        setHeaderFields((prev) => ({
                                          ...prev,
                                          containerConversions:
                                            updatedConversions,
                                        }));

                                        const hasCustomValues =
                                          updatedConversions.some(
                                            (conv) =>
                                              conv.customValue !==
                                              conv.standardValue
                                          );

                                        if (hasCustomValues) {
                                          setCustomizedFields((prev) =>
                                            new Set(prev).add(
                                              "containerConversions"
                                            )
                                          );
                                          setIsHeaderCustomized(true);
                                          if (
                                            (headerTemplateType as string) ===
                                            "standard"
                                          ) {
                                            setHeaderTemplateType("custom");
                                          }
                                        } else {
                                          setCustomizedFields((prev) => {
                                            const newSet = new Set(prev);
                                            newSet.delete(
                                              "containerConversions"
                                            );
                                            return newSet;
                                          });
                                        }
                                      }}
                                      disabled={
                                        item.containerSize ===
                                        "55 Gallon (base)"
                                      }
                                      className={`w-20 ${
                                        item.containerSize ===
                                        "55 Gallon (base)"
                                          ? "bg-gray-100"
                                          : item.customValue !==
                                            item.standardValue
                                          ? "border-primary-1 bg-primary-1/5"
                                          : ""
                                      }`}
                                    />
                                    {item.customValue !==
                                      item.standardValue && (
                                      <span
                                        className={`text-xs ${
                                          item.customValue < item.standardValue
                                            ? "text-red-500"
                                            : "text-primary-1"
                                        }`}
                                      >
                                        {item.customValue > item.standardValue
                                          ? "+"
                                          : ""}
                                        {(
                                          item.customValue - item.standardValue
                                        ).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Container Minimum */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold w-48">
                      Container Minimum:
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border rounded-md bg-white">
                        <span className="px-2 py-1 text-sm text-gray-500 bg-gray-50 border-r rounded-l-md">
                          $
                        </span>
                        <Input
                          type="text"
                          value={
                            focusedField === "containerMinimum"
                              ? rawInputValues["containerMinimum"] || ""
                              : headerFields.containerMinimum.toFixed(2)
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ""
                            );
                            setRawInputValues((prev) => ({
                              ...prev,
                              containerMinimum: value,
                            }));

                            if (value === "" || value === ".") {
                              setHeaderFields((prev) => ({
                                ...prev,
                                containerMinimum: 0,
                              }));
                            } else {
                              const numValue = Number(value);
                              if (!isNaN(numValue)) {
                                setHeaderFields((prev) => ({
                                  ...prev,
                                  containerMinimum: numValue,
                                }));
                                if (
                                  numValue !==
                                  STANDARD_TEMPLATE.containerMinimum
                                ) {
                                  setCustomizedFields((prev) =>
                                    new Set(prev).add("containerMinimum")
                                  );
                                  setIsHeaderCustomized(true);
                                  if (
                                    (headerTemplateType as string) ===
                                    "standard"
                                  ) {
                                    setHeaderTemplateType("custom");
                                  }
                                }
                              }
                            }
                          }}
                          onFocus={() => {
                            setFocusedField("containerMinimum");
                            setRawInputValues((prev) => ({
                              ...prev,
                              containerMinimum:
                                headerFields.containerMinimum.toString(),
                            }));
                          }}
                          onBlur={(e) => {
                            setFocusedField(null);
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            const formattedValue = Number(value.toFixed(2));
                            setHeaderFields((prev) => ({
                              ...prev,
                              containerMinimum: formattedValue,
                            }));
                            if (
                              formattedValue !==
                              STANDARD_TEMPLATE.containerMinimum
                            ) {
                              setCustomizedFields((prev) =>
                                new Set(prev).add("containerMinimum")
                              );
                              setIsHeaderCustomized(true);
                              if (
                                (headerTemplateType as string) === "standard"
                              ) {
                                setHeaderTemplateType("custom");
                              }
                            }
                          }}
                          placeholder="30.00"
                          className="w-24 border-0 focus:ring-0 focus:border-0 shadow-none h-8"
                        />
                      </div>
                      <div className="w-40 text-xs text-gray-500">
                        {customizedFields.has("containerMinimum") ? (
                          <>Standard: ${STANDARD_TEMPLATE.containerMinimum}</>
                        ) : (
                          <span className="invisible">Standard: $30</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Options at bottom with checkboxes */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-row flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hub-fee"
                      checked={headerFields.hubFee}
                      onCheckedChange={(checked) =>
                        updateHeaderField("hubFee", checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="hub-fee"
                      className={
                        customizedFields.has("hubFee")
                          ? "text-primary-1 font-medium"
                          : "text-gray-700"
                      }
                    >
                      Hub Fee{" "}
                      {customizedFields.has("hubFee") && (
                        <span className="text-xs">(Customized)</span>
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="regional-pricing"
                      checked={headerFields.regionalPricing}
                      onCheckedChange={(checked) =>
                        updateHeaderField("regionalPricing", checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="regional-pricing"
                      className={
                        customizedFields.has("regionalPricing")
                          ? "text-primary-1 font-medium"
                          : "text-gray-700"
                      }
                    >
                      Regional Pricing{" "}
                      {customizedFields.has("regionalPricing") && (
                        <span className="text-xs">(Customized)</span>
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="zone-transportation"
                      checked={headerFields.zoneTransportation}
                      onCheckedChange={(checked) =>
                        updateHeaderField(
                          "zoneTransportation",
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor="zone-transportation"
                      className={
                        customizedFields.has("zoneTransportation")
                          ? "text-primary-1 font-medium"
                          : "text-gray-700"
                      }
                    >
                      Zone Transportation{" "}
                      {customizedFields.has("zoneTransportation") && (
                        <span className="text-xs">(Customized)</span>
                      )}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleBack();
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleHeaderContinue();
          }}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderExcelInputStep = () => (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Import Pricing Data
        </h3>
        <p className="text-gray-600">
          Upload an Excel file or paste data from your clipboard.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mt-4 flex gap-4">
            <Card
              className={`cursor-pointer transition-all flex-1 ${
                excelInputMethod === "upload"
                  ? "ring-2 ring-primary-1 bg-primary-1/10"
                  : "hover:bg-primary-1/5"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setExcelInputMethod("upload");
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      excelInputMethod === "upload"
                        ? "bg-primary-1/20"
                        : "bg-primary-1/5"
                    }`}
                  >
                    <Upload
                      className={`w-5 h-5 ${
                        excelInputMethod === "upload"
                          ? "text-primary-1"
                          : "text-primary-1/70"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Upload Excel File
                    </h4>
                    <p className="text-xs text-gray-600">
                      Upload an Excel file (.xlsx, .xls) from your computer.
                    </p>
                  </div>
                  {excelInputMethod === "upload" && (
                    <Check className="w-4 h-4 text-primary-1" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all flex-1 ${
                excelInputMethod === "paste"
                  ? "ring-2 ring-primary-1 bg-primary-1/10"
                  : "hover:bg-primary-1/5"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setExcelInputMethod("paste");
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      excelInputMethod === "paste"
                        ? "bg-primary-1/20"
                        : "bg-primary-1/5"
                    }`}
                  >
                    <Clipboard
                      className={`w-5 h-5 ${
                        excelInputMethod === "paste"
                          ? "text-primary-1"
                          : "text-primary-1/70"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Paste from Clipboard
                    </h4>
                    <p className="text-xs text-gray-600">
                      Paste Excel data directly from your clipboard.
                    </p>
                  </div>
                  {excelInputMethod === "paste" && (
                    <Check className="w-4 h-4 text-primary-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {excelInputMethod === "upload" && (
          <div className="space-y-4">
            <div>
              <Label>Upload Excel File</Label>
              <div className="mt-1">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-1/10 file:text-primary-1/70 hover:file:bg-primary-1/20"
                />
              </div>
            </div>
            {uploadedFile && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {uploadedFile.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {excelInputMethod === "paste" && (
          <div className="space-y-4">
            <div>
              <Label>Paste Excel Data</Label>
              <div className="mt-1 space-y-2">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePasteFromClipboard();
                  }}
                  className="flex items-center space-x-2"
                >
                  <Clipboard className="w-4 h-4" />
                  <span>Paste from Clipboard</span>
                </Button>
                <Textarea
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  placeholder="Paste your Excel data here (tab-separated values)..."
                  className="min-h-[200px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleBack();
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleExcelInputContinue();
          }}
          disabled={
            (excelInputMethod === "paste" && !pastedData.trim()) ||
            (excelInputMethod === "upload" && !uploadedFile) ||
            isProcessing
          }
        >
          {isProcessing ? "Processing..." : "Continue"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderPreviewTable = (maxRows?: number) => {
    const displayData = maxRows ? parsedData.slice(0, maxRows) : parsedData;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {displayData[0]?.map((header: string, index: number) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.slice(1).map((row: any[], rowIndex: number) => (
              <tr key={rowIndex}>
                {row.map((cell: any, cellIndex: number) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPreviewStep = () => (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Preview Pricing Data
        </h3>
        <p className="text-gray-600">
          Review the imported data before creating your pricing.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Total Rows: {parsedData.length - 1}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsPreviewExpanded(!isPreviewExpanded);
            }}
          >
            {isPreviewExpanded ? "Show Less" : "Show All"}
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {renderPreviewTable(isPreviewExpanded ? undefined : 10)}
          </CardContent>
        </Card>

        {!isPreviewExpanded && parsedData.length > 11 && (
          <div className="text-center text-sm text-gray-500">
            Showing first 10 rows. Click "Show All" to see all{" "}
            {parsedData.length - 1} rows.
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleBack();
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleCreatePricing();
          }}
          disabled={isSaving}
        >
          {isSaving ? "Creating..." : "Create Pricing"}
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "effective-dates":
        return renderEffectiveDatesStep();
      case "header":
        return renderHeaderStep();
      case "excel-input":
        return renderExcelInputStep();
      case "preview":
        return renderPreviewStep();
      default:
        return renderEffectiveDatesStep();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white flex flex-col w-screen h-screen"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Create New Pricing</h2>
          <span className="text-gray-500">Customer: {customerId}</span>
        </div>
        <Button variant="ghost" onClick={handleClose}>
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="px-8 pt-6 pb-2 bg-white">{renderStepIndicator()}</div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Header Editor Modal */}
      <Dialog open={showHeaderEditor} onOpenChange={setShowHeaderEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Header Template</DialogTitle>
            <DialogDescription>
              Customize the header template settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>EEI</Label>
                <Select
                  value={headerFields.eei}
                  onValueChange={(value) => {
                    setHeaderFields((prev) => ({ ...prev, eei: value }));
                    setIsHeaderCustomized(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    className="z-[10000]"
                  >
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                    <SelectItem value="Floating">Floating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fuel Surcharge (FSC)</Label>
                <Select
                  value={headerFields.fuelSurcharge}
                  onValueChange={(value) => {
                    setHeaderFields((prev) => ({
                      ...prev,
                      fuelSurcharge: value,
                    }));
                    setIsHeaderCustomized(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    className="z-[10000]"
                  >
                    <SelectItem value="Standard Monthly">
                      Standard Monthly
                    </SelectItem>
                    <SelectItem value="Standard Weekly">
                      Standard Weekly
                    </SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Invoice Minimum</Label>
                <Input
                  type="text"
                  value={headerFields.invoiceMinimum.toFixed(2)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    if (value === "" || value === ".") {
                      setHeaderFields((prev) => ({
                        ...prev,
                        invoiceMinimum: 0,
                      }));
                    } else {
                      const numValue = Number(value);
                      if (!isNaN(numValue)) {
                        setHeaderFields((prev) => ({
                          ...prev,
                          invoiceMinimum: numValue,
                        }));
                        setIsHeaderCustomized(true);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    setHeaderFields((prev) => ({
                      ...prev,
                      invoiceMinimum: Number(value.toFixed(2)),
                    }));
                    setIsHeaderCustomized(true);
                  }}
                  placeholder="350.00"
                />
              </div>
              <div>
                <Label>E-Manifest Fee</Label>
                <Input
                  type="text"
                  value={headerFields.eManifestFee.toFixed(2)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    if (value === "" || value === ".") {
                      setHeaderFields((prev) => ({
                        ...prev,
                        eManifestFee: 0,
                      }));
                    } else {
                      const numValue = Number(value);
                      if (!isNaN(numValue)) {
                        setHeaderFields((prev) => ({
                          ...prev,
                          eManifestFee: numValue,
                        }));
                        setIsHeaderCustomized(true);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    setHeaderFields((prev) => ({
                      ...prev,
                      eManifestFee: Number(value.toFixed(2)),
                    }));
                    setIsHeaderCustomized(true);
                  }}
                  placeholder="25.00"
                />
              </div>
              <div>
                <Label>Economic Adjustment Fee (EAF) %</Label>
                <Input
                  type="text"
                  value={headerFields.economicAdjustmentFee.toFixed(2)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    if (value === "" || value === ".") {
                      setHeaderFields((prev) => ({
                        ...prev,
                        economicAdjustmentFee: 0,
                      }));
                    } else {
                      const numValue = Number(value);
                      if (!isNaN(numValue)) {
                        setHeaderFields((prev) => ({
                          ...prev,
                          economicAdjustmentFee: numValue,
                        }));
                        setIsHeaderCustomized(true);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    setHeaderFields((prev) => ({
                      ...prev,
                      economicAdjustmentFee: Number(value.toFixed(2)),
                    }));
                    setIsHeaderCustomized(true);
                  }}
                  placeholder="3.00"
                />
              </div>
              <div>
                <Label>Effective Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !headerFields.effectiveDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {headerFields.effectiveDate ? (
                        format(headerFields.effectiveDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 z-[10000]"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={headerFields.effectiveDate}
                      onSelect={(date) => {
                        setHeaderFields((prev) => ({
                          ...prev,
                          effectiveDate: date,
                        }));
                        setIsHeaderCustomized(true);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowHeaderEditor(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowHeaderEditor(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Container Conversion Modal */}
      {showContainerConversionModal &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10000,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10001,
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                maxWidth: "80vw",
                maxHeight: "80vh",
                overflow: "auto",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Customize Container Conversion
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContainerConversionModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-6">
                {/* Container Minimum */}
                <div>
                  <Label htmlFor="container-minimum">Container Minimum</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="container-minimum"
                      type="text"
                      value={headerFields.containerMinimum.toFixed(2)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, "");
                        if (value === "" || value === ".") {
                          setHeaderFields((prev) => ({
                            ...prev,
                            containerMinimum: 0,
                          }));
                        } else {
                          const numValue = Number(value);
                          if (!isNaN(numValue)) {
                            setHeaderFields((prev) => ({
                              ...prev,
                              containerMinimum: numValue,
                            }));
                            if (
                              numValue !== STANDARD_TEMPLATE.containerMinimum
                            ) {
                              setCustomizedFields((prev) =>
                                new Set(prev).add("containerMinimum")
                              );
                              setIsHeaderCustomized(true);
                              if (headerTemplateType === "standard") {
                                setHeaderTemplateType("custom");
                              }
                            }
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        const formattedValue = Number(value.toFixed(2));
                        setHeaderFields((prev) => ({
                          ...prev,
                          containerMinimum: formattedValue,
                        }));
                        if (
                          formattedValue !== STANDARD_TEMPLATE.containerMinimum
                        ) {
                          setCustomizedFields((prev) =>
                            new Set(prev).add("containerMinimum")
                          );
                          setIsHeaderCustomized(true);
                          if (headerTemplateType === "standard") {
                            setHeaderTemplateType("custom");
                          }
                        }
                      }}
                      placeholder="30.00"
                      className="flex-1"
                    />
                    <div className="text-xs text-gray-500 min-w-[120px]">
                      {customizedFields.has("containerMinimum") ? (
                        <>
                          Standard: ${STANDARD_TEMPLATE.containerMinimum}
                          <span
                            className={`ml-1 ${
                              headerFields.containerMinimum <
                              STANDARD_TEMPLATE.containerMinimum
                                ? "text-red-500"
                                : "text-primary-1"
                            }`}
                          >
                            (
                            {headerFields.containerMinimum >
                            STANDARD_TEMPLATE.containerMinimum
                              ? "+"
                              : ""}
                            {headerFields.containerMinimum -
                              STANDARD_TEMPLATE.containerMinimum}
                            )
                          </span>
                        </>
                      ) : (
                        <span className="invisible">Standard: $30</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conversion Table */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-medium">
                      Container Conversion Factors
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setHeaderFields((prev) => ({
                          ...prev,
                          containerConversions: [
                            ...STANDARD_CONTAINER_CONVERSIONS,
                          ],
                          containerMinimum: STANDARD_TEMPLATE.containerMinimum,
                        }));
                        setCustomizedFields((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete("containerConversions");
                          newSet.delete("containerMinimum");
                          return newSet;
                        });
                        // Reset container conversion selection to standard
                        updateHeaderField(
                          "containerConversion",
                          "Standard Conversion 2"
                        );
                      }}
                      className="flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset to Standard</span>
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Container Size
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Standard Value
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Custom Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {headerFields.containerConversions.map(
                          (item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {item.containerSize}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {item.standardValue}x
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="text"
                                    value={item.customValue.toFixed(2)}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(
                                        /[^0-9.]/g,
                                        ""
                                      );
                                      if (value === "" || value === ".") {
                                        const updatedConversions = [
                                          ...headerFields.containerConversions,
                                        ];
                                        updatedConversions[index] = {
                                          ...item,
                                          customValue: item.standardValue,
                                        };
                                        setHeaderFields((prev) => ({
                                          ...prev,
                                          containerConversions:
                                            updatedConversions,
                                        }));
                                      } else {
                                        const numValue = Number(value);
                                        if (!isNaN(numValue)) {
                                          const updatedConversions = [
                                            ...headerFields.containerConversions,
                                          ];
                                          updatedConversions[index] = {
                                            ...item,
                                            customValue: numValue,
                                          };
                                          setHeaderFields((prev) => ({
                                            ...prev,
                                            containerConversions:
                                              updatedConversions,
                                          }));

                                          // Check if any values are customized
                                          const hasCustomValues =
                                            updatedConversions.some(
                                              (conv) =>
                                                conv.customValue !==
                                                conv.standardValue
                                            );

                                          if (hasCustomValues) {
                                            setCustomizedFields((prev) =>
                                              new Set(prev).add(
                                                "containerConversions"
                                              )
                                            );
                                            setIsHeaderCustomized(true);
                                            if (
                                              headerTemplateType === "standard"
                                            ) {
                                              setHeaderTemplateType("custom");
                                            }
                                            // Update container conversion selection to "Custom Conversion"
                                            updateHeaderField(
                                              "containerConversion",
                                              "Custom Conversion"
                                            );
                                          } else {
                                            setCustomizedFields((prev) => {
                                              const newSet = new Set(prev);
                                              newSet.delete(
                                                "containerConversions"
                                              );
                                              return newSet;
                                            });
                                          }
                                        }
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const value =
                                        e.target.value === ""
                                          ? item.standardValue
                                          : Number(e.target.value);
                                      const formattedValue = Number(
                                        value.toFixed(2)
                                      );
                                      const updatedConversions = [
                                        ...headerFields.containerConversions,
                                      ];
                                      updatedConversions[index] = {
                                        ...item,
                                        customValue: formattedValue,
                                      };
                                      setHeaderFields((prev) => ({
                                        ...prev,
                                        containerConversions:
                                          updatedConversions,
                                      }));

                                      // Check if any values are customized
                                      const hasCustomValues =
                                        updatedConversions.some(
                                          (conv) =>
                                            conv.customValue !==
                                            conv.standardValue
                                        );

                                      if (hasCustomValues) {
                                        setCustomizedFields((prev) =>
                                          new Set(prev).add(
                                            "containerConversions"
                                          )
                                        );
                                        setIsHeaderCustomized(true);
                                        if (headerTemplateType === "standard") {
                                          setHeaderTemplateType("custom");
                                        }
                                        // Update container conversion selection to "Custom Conversion"
                                        updateHeaderField(
                                          "containerConversion",
                                          "Custom Conversion"
                                        );
                                      } else {
                                        setCustomizedFields((prev) => {
                                          const newSet = new Set(prev);
                                          newSet.delete("containerConversions");
                                          return newSet;
                                        });
                                      }
                                    }}
                                    disabled={
                                      item.containerSize === "55 Gallon (base)"
                                    }
                                    className={`w-20 ${
                                      item.containerSize === "55 Gallon (base)"
                                        ? "bg-gray-100"
                                        : item.customValue !==
                                          item.standardValue
                                        ? "border-primary-1 bg-primary-1/5"
                                        : ""
                                    }`}
                                  />
                                  {item.customValue !== item.standardValue && (
                                    <span
                                      className={`text-xs ${
                                        item.customValue < item.standardValue
                                          ? "text-red-500"
                                          : "text-primary-1"
                                      }`}
                                    >
                                      {item.customValue > item.standardValue
                                        ? "+"
                                        : ""}
                                      {(
                                        item.customValue - item.standardValue
                                      ).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowContainerConversionModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowContainerConversionModal(false)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
