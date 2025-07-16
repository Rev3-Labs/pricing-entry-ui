"use client";

import React, { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Upload,
  FileSpreadsheet,
  Clipboard,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Maximize2,
  X as CloseIcon,
  Sparkles,
  PenSquare,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { customerService } from "@/services/customer.service";

interface PriceHeader {
  priceHeaderId: string;
  headerName: string;
  description?: string;
  effectiveDate: string;
  expirationDate: string;
  status: string;
}

interface PricingSlideoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  priceHeaders: PriceHeader[];
  onSuccess: () => void;
}

type Step = "type" | "addendum" | "setup" | "excel-input" | "preview";

export function PricingSlideover({
  open,
  onOpenChange,
  customerId,
  priceHeaders,
  onSuccess,
}: PricingSlideoverProps) {
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [pricingType, setPricingType] = useState<"new" | "addendum">("new");
  const [selectedPriceHeader, setSelectedPriceHeader] = useState<string>("");
  const [priceGroupName, setPriceGroupName] = useState("");
  const [headerTemplate, setHeaderTemplate] = useState("custom");
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

  const handleTypeSelection = (type: "new" | "addendum") => {
    setPricingType(type);
    if (type === "new") {
      setCurrentStep("setup");
    } else {
      setCurrentStep("addendum");
    }
  };

  const handleAddendumSelection = () => {
    if (!selectedPriceHeader) {
      toast.error("Please select a price group");
      return;
    }
    setCurrentStep("setup");
  };

  const handleSetupContinue = () => {
    if (!priceGroupName.trim()) {
      toast.error("Please enter a price group name");
      return;
    }
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
      case "addendum":
        setCurrentStep("type");
        break;
      case "setup":
        setCurrentStep("addendum");
        break;
      case "excel-input":
        setCurrentStep("setup");
        break;
      case "preview":
        setCurrentStep("excel-input");
        break;
    }
  };

  const resetSlideover = () => {
    setCurrentStep("type");
    setPricingType("new");
    setSelectedPriceHeader("");
    setPriceGroupName("");
    setHeaderTemplate("custom");
    setExcelInputMethod("upload");
    setPastedData("");
    setUploadedFile(null);
    setParsedData([]);
  };

  const handleClose = () => {
    resetSlideover();
    onOpenChange(false);
  };

  const handleCreatePricing = async () => {
    setIsSaving(true);
    try {
      const result = await customerService.createPriceHeaderWithItems(
        customerId,
        priceGroupName,
        headerTemplate,
        parsedData
      );
      if (result.success && result.priceHeaderId) {
        handleClose();
        router.push(
          `/customer-pricing/${customerId}/quote/${result.priceHeaderId}`
        );
      } else {
        toast.error(result.message || "Failed to create pricing group");
      }
    } catch (error) {
      toast.error("Failed to create pricing group");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "type", label: "Type" },
      { key: "addendum", label: pricingType === "addendum" ? "Group" : "Skip" },
      { key: "setup", label: "Setup" },
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
                    ? "bg-blue-600 text-white"
                    : index < steps.findIndex((s) => s.key === currentStep)
                    ? "bg-green-600 text-white"
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

  const renderTypeStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Create New Pricing
        </h3>
        <p className="text-gray-600">
          Choose how you want to create pricing for this customer.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card
          className={`cursor-pointer transition-all ${
            pricingType === "new"
              ? "ring-2 ring-primary-1 bg-primary-1/10"
              : "hover:bg-primary-1/5"
          }`}
          onClick={() => setPricingType("new")}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  pricingType === "new" ? "bg-primary-1/20" : "bg-primary-1/5"
                }`}
              >
                <FileSpreadsheet
                  className={`w-6 h-6 ${
                    pricingType === "new"
                      ? "text-primary-1"
                      : "text-primary-1/70"
                  }`}
                />
                <Sparkles className="w-4 h-4 text-primary-1 ml-1 -mt-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  New Price Quote
                </h4>
                <p className="text-sm text-gray-600">
                  Create a completely new pricing group with its own name and
                  settings.
                </p>
              </div>
              {pricingType === "new" && (
                <Check className="w-5 h-5 text-primary-1" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            pricingType === "addendum"
              ? "ring-2 ring-primary-1 bg-primary-1/10"
              : "hover:bg-primary-1/5"
          }`}
          onClick={() => setPricingType("addendum")}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  pricingType === "addendum"
                    ? "bg-primary-1/20"
                    : "bg-primary-1/5"
                }`}
              >
                <PenSquare
                  className={`w-6 h-6 ${
                    pricingType === "addendum"
                      ? "text-primary-1"
                      : "text-primary-1/70"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Addendum to Existing Quote
                </h4>
                <p className="text-sm text-gray-600">
                  Add new pricing items to an existing price quote.
                </p>
              </div>
              {pricingType === "addendum" && (
                <Check className="w-5 h-5 text-primary-1" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleTypeSelection(pricingType)}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderAddendumStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Price Group
        </h3>
        <p className="text-gray-600">
          Choose the existing price group you want to add pricing to.
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="price-header-select">Price Group</Label>
        <Select
          value={selectedPriceHeader}
          onValueChange={setSelectedPriceHeader}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a price group..." />
          </SelectTrigger>
          <SelectContent>
            {priceHeaders.map((header) => (
              <SelectItem
                key={header.priceHeaderId}
                value={header.priceHeaderId}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{header.headerName}</span>
                  <span className="text-sm text-gray-500">
                    {header.effectiveDate} - {header.expirationDate}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPriceHeader && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              Selected Group Details
            </h4>
            {(() => {
              const header = priceHeaders.find(
                (h) => h.priceHeaderId === selectedPriceHeader
              );
              return header ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>{" "}
                    {header.headerName}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge
                      variant={
                        header.status === "active" ? "default" : "secondary"
                      }
                      className="ml-2"
                    >
                      {header.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Effective:</span>{" "}
                    {header.effectiveDate}
                  </div>
                  <div>
                    <span className="font-medium">Expires:</span>{" "}
                    {header.expirationDate}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleAddendumSelection}
          disabled={!selectedPriceHeader}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {pricingType === "new" ? "New Price Group Setup" : "Addendum Setup"}
        </h3>
        <p className="text-gray-600">
          {pricingType === "new"
            ? "Configure your new price group settings."
            : "Configure the addendum settings."}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="group-name">Price Group Name</Label>
          <Input
            id="group-name"
            value={priceGroupName}
            onChange={(e) => setPriceGroupName(e.target.value)}
            placeholder="Enter price group name..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="header-template">Header Template</Label>
          <Select value={headerTemplate} onValueChange={setHeaderTemplate}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Template</SelectItem>
              <SelectItem value="standard">Standard Template</SelectItem>
              <SelectItem value="premium">Premium Template</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSetupContinue} disabled={!priceGroupName.trim()}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderExcelInputStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Add Pricing Data
        </h3>
        <p className="text-gray-600">
          Choose how you want to provide your pricing data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card
          className={`cursor-pointer transition-all ${
            excelInputMethod === "upload"
              ? "ring-2 ring-blue-500 bg-blue-50"
              : "hover:bg-gray-50"
          }`}
          onClick={() => setExcelInputMethod("upload")}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Upload Excel File
                </h4>
                <p className="text-sm text-gray-600">
                  Upload an Excel file (.xlsx, .xls, .csv) with your pricing
                  data.
                </p>
              </div>
              {excelInputMethod === "upload" && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            excelInputMethod === "paste"
              ? "ring-2 ring-blue-500 bg-blue-50"
              : "hover:bg-gray-50"
          }`}
          onClick={() => setExcelInputMethod("paste")}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clipboard className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Paste Excel Data
                </h4>
                <p className="text-sm text-gray-600">
                  Copy and paste data directly from Excel.
                </p>
              </div>
              {excelInputMethod === "paste" && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {excelInputMethod === "upload" && (
        <div className="space-y-4">
          <Label htmlFor="file-upload">Excel File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="mt-1"
          />
          {uploadedFile && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
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
          <div className="flex justify-between items-center">
            <Label htmlFor="pasted-data">Excel Data</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePasteFromClipboard}
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Paste from Clipboard
            </Button>
          </div>
          <Textarea
            id="pasted-data"
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            placeholder="Paste your Excel data here (tab-separated values)..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleExcelInputContinue}
          disabled={
            isProcessing ||
            (excelInputMethod === "upload" && !uploadedFile) ||
            (excelInputMethod === "paste" && !pastedData.trim())
          }
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderPreviewTable = (maxRows?: number) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">
          Found {parsedData.length} rows of data
        </div>
        {typeof maxRows === "number" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPreviewExpanded(true)}
            title="Expand table"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
        )}
      </div>
      <div className="max-h-64 overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-white sticky top-0">
            <tr>
              {parsedData[0]?.map((header: string, index: number) => (
                <th
                  key={index}
                  className="px-2 py-1 text-left font-medium border-b"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsedData.slice(1, maxRows).map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white">
                {row.map((cell: string, cellIndex: number) => (
                  <td key={cellIndex} className="px-2 py-1 border-b">
                    {cell || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {typeof maxRows === "number" && parsedData.length > maxRows && (
          <div className="text-center py-2 text-xs text-gray-500">
            ... and {parsedData.length - maxRows} more rows
          </div>
        )}
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Preview Data
        </h3>
        <p className="text-gray-600">
          Review your pricing data before proceeding.
        </p>
      </div>
      {renderPreviewTable(6)}
      {/* Expanded preview modal */}
      {isPreviewExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
              onClick={() => setIsPreviewExpanded(false)}
              title="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <h4 className="text-lg font-semibold mb-4">Full Data Preview</h4>
            <div className="flex-1 overflow-auto">{renderPreviewTable()}</div>
          </div>
        </div>
      )}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleCreatePricing} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create Pricing"
          )}
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "type":
        return renderTypeStep();
      case "addendum":
        // Only render addendum step if pricingType is 'addendum'
        return pricingType === "addendum" ? renderAddendumStep() : null;
      case "setup":
        return renderSetupStep();
      case "excel-input":
        return renderExcelInputStep();
      case "preview":
        return renderPreviewStep();
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[800px] xl:w-[900px] max-w-full overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle>Create New Pricing</SheetTitle>
          <SheetDescription>
            Set up pricing for customer {customerId}
          </SheetDescription>
        </SheetHeader>
        {/* Simple step label */}
        {(() => {
          const steps = [
            { key: "type", label: "Type" },
            // Only include 'addendum' step if pricingType is 'addendum'
            ...(pricingType === "addendum"
              ? [{ key: "addendum", label: "Group" }]
              : []),
            { key: "setup", label: "Setup" },
            { key: "excel-input", label: "Data" },
            { key: "preview", label: "Preview" },
          ];
          const currentIndex = steps.findIndex((s) => s.key === currentStep);
          return (
            <div className="mb-6 text-lg font-medium text-gray-700">
              Step {currentIndex + 1} of {steps.length} –{" "}
              {steps[currentIndex]?.label}
            </div>
          );
        })()}
        {renderCurrentStep()}
      </SheetContent>
    </Sheet>
  );
}
