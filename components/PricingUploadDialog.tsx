import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, Upload, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface PricingUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  priceHeaders?: Array<{
    priceHeaderId: string;
    headerName: string;
    description?: string;
    priceItemCount?: number;
  }>;
  onSuccess?: (result: any) => void;
  mode?: "new" | "addendum";
}

export const PricingUploadDialog: React.FC<PricingUploadDialogProps> = ({
  open,
  onOpenChange,
  customerId,
  priceHeaders = [],
  onSuccess,
  mode,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [pricingType, setPricingType] = useState<"new" | "addendum">(
    mode || "new"
  );
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

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setUploadedData(jsonData);
      } catch (error) {
        setUploadedData([]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", pricingType);
      if (pricingType === "addendum") {
        formData.append("priceHeaderId", selectedPriceHeader);
      } else {
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
        onOpenChange(false);
        setSelectedFile(null);
        setUploadedData([]);
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
        if (onSuccess) onSuccess(result);
      }
    } finally {
      setIsImporting(false);
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

  const resetDialog = () => {
    setSelectedFile(null);
    setUploadedData([]);
    setPricingType(mode || "new");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Upload Excel File</DialogTitle>
          <DialogDescription>
            Upload an Excel file to add new pricing entries. The file should
            match the column structure of the grid.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-6">
          <Input type="file" accept=".xlsx,.xls" onChange={handleFileSelect} />
          {selectedFile && (
            <div className="text-sm text-gray-600 mt-1">
              Selected: {selectedFile.name}
            </div>
          )}
        </div>
        {/* Preview Section */}
        {uploadedData.length > 0 && (
          <div className="mb-6">
            <Label className="text-base font-medium">
              Uploaded Line Items Preview
            </Label>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr>
                      {Object.keys(uploadedData[0]).map((key) => (
                        <th
                          key={key}
                          className="px-2 py-1 border-b font-semibold text-left"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-2 py-1 border-b">
                            {val as string}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {uploadedData.length > 10 && (
                      <tr>
                        <td
                          colSpan={Object.keys(uploadedData[0]).length}
                          className="text-center text-gray-500"
                        >
                          ... and {uploadedData.length - 10} more items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={resetDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Submit
          </Button>
          <Button variant="ghost" onClick={handleDownloadTemplate}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
