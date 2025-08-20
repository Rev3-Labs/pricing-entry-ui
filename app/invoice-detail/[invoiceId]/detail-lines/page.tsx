"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Button as MuiButton,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Package,
  Truck,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  Calculator,
  Hash,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

// Mock invoice data - in a real app, this would come from an API
const mockInvoice = {
  id: "100927",
  invoiceNumber: "INV-100927",
  invoiceAmount: 125000.0,
  invoiceStatus: "open",
  invoiceDate: "2024-01-15",
  finalizeDate: "",
  facilityName: "Emelle",
  purchaseOrders: ["PO-001", "PO-002"],
  customer: {
    name: "Acme Corp",
    generator: "Generator A",
    generatorAddress: "123 Industrial Blvd, Anytown, ST 12345",
    facility: "Emelle",
  },
  workOrder: {
    number: "WO-2024-001",
    status: "open",
    type: "disposal",
    date: "2024-01-10",
    jobNumber: "PRJ-001",
    taxRate: 8.5,
  },
  disposalLines: [
    {
      id: "DL-001",
      workOrder: "WO-2024-001",
      generatorName: "Generator A",
      date: "2024-01-12",
      offspecCode: "OS-001",
      offspecNotes: "Slight contamination detected",
      itemCode: "ITEM-001",
      lineDescription: "Hazardous waste disposal",
      quantity: 5,
      uom: "Container",
      disposalPrice: 15000.0,
      transPrice: 2500.0,
      linePrice: 17500.0,
      totalPrice: 17500.0,
      containerInfo: "CNT-001",
      pricingInfo: "PROF-001",
    },
    {
      id: "DL-002",
      workOrder: "WO-2024-001",
      generatorName: "Generator A",
      date: "2024-01-13",
      offspecCode: "",
      offspecNotes: "",
      itemCode: "ITEM-002",
      lineDescription: "Transportation services",
      quantity: 2,
      uom: "Container",
      disposalPrice: 0.0,
      transPrice: 5000.0,
      linePrice: 5000.0,
      totalPrice: 5000.0,
      containerInfo: "CNT-002",
      pricingInfo: "PROF-001",
    },
  ],
  nonDisposalLines: [
    {
      id: "NDL-001",
      workOrder: "WO-2024-001",
      generatorName: "Generator A",
      date: "2024-01-14",
      mainCategory: "Administrative",
      itemCode: "ADMIN-001",
      description: "Documentation and processing fees",
      quantity: 1,
      uom: "Each",
      unitPrice: 1000.0,
      linePrice: 1000.0,
    },
  ],
};

interface InvoiceDetailLinesProps {}

export default function InvoiceDetailLinesPage({}: InvoiceDetailLinesProps) {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState(mockInvoice);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(mockInvoice);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    // In a real app, fetch invoice data based on invoiceId
    console.log("Loading invoice detail lines:", invoiceId);
  }, [invoiceId]);

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedInvoice(invoice);
  };

  const handleSave = async () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setInvoice(editedInvoice);
      setIsEditMode(false);
      setIsLoading(false);
      toast.success("Invoice lines updated successfully");
    }, 1000);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedInvoice(invoice);
  };

  const handleFieldChange = (section: string, field: string, value: any) => {
    setEditedInvoice((prev) => {
      const sectionData = prev[section as keyof typeof prev] as Record<
        string,
        any
      >;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value,
        },
      };
    });
  };

  const handleLineItemChange = (
    section: string,
    lineId: string,
    field: string,
    value: any
  ) => {
    setEditedInvoice((prev) => {
      const sectionData = prev[section as keyof typeof prev] as any[];
      const updatedSection = sectionData.map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line
      );

      return {
        ...prev,
        [section]: updatedSection,
      };
    });
  };

  const addDisposalLine = () => {
    const newLine = {
      id: `DL-${Date.now()}`,
      workOrder: invoice.workOrder.number,
      generatorName: invoice.customer.generator,
      date: new Date().toISOString().split("T")[0],
      offspecCode: "",
      offspecNotes: "",
      itemCode: "",
      lineDescription: "",
      quantity: 1,
      uom: "Container",
      disposalPrice: 0.0,
      transPrice: 0.0,
      linePrice: 0.0,
      totalPrice: 0.0,
      containerInfo: "",
      pricingInfo: "",
    };

    setEditedInvoice((prev) => ({
      ...prev,
      disposalLines: [...prev.disposalLines, newLine],
    }));
  };

  const addNonDisposalLine = () => {
    const newLine = {
      id: `NDL-${Date.now()}`,
      workOrder: invoice.workOrder.number,
      generatorName: invoice.customer.generator,
      date: new Date().toISOString().split("T")[0],
      mainCategory: "",
      itemCode: "",
      description: "",
      quantity: 1,
      uom: "Each",
      unitPrice: 0.0,
      linePrice: 0.0,
    };

    setEditedInvoice((prev) => ({
      ...prev,
      nonDisposalLines: [...prev.nonDisposalLines, newLine],
    }));
  };

  const deleteLine = (section: string, lineId: string) => {
    setEditedInvoice((prev) => {
      const sectionData = prev[section as keyof typeof prev] as any[];
      const updatedSection = sectionData.filter((line) => line.id !== lineId);

      return {
        ...prev,
        [section]: updatedSection,
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: {
        label: "Open",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Clock,
      },
      "in-progress": {
        label: "In Progress",
        className: "bg-orange-50 text-orange-700 border-orange-200",
        icon: AlertCircle,
      },
      "on-hold": {
        label: "On Hold",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: AlertCircle,
      },
      finalized: {
        label: "Finalized",
        className: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
      },
      void: {
        label: "Void",
        className: "bg-gray-50 text-gray-700 border-gray-200",
        icon: Info,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const IconComponent = config.icon;

    return (
      <Chip
        icon={<IconComponent className="h-3 w-3" />}
        label={config.label}
        className={`${config.className} border font-medium`}
        size="small"
        variant="outlined"
      />
    );
  };

  // Disposal Lines DataGrid columns
  const disposalLineColumns: GridColDef[] = [
    {
      field: "workOrder",
      headerName: "Work Order #",
      width: 130,
      renderCell: (params) => (
        <MuiButton
          variant="text"
          size="small"
          onClick={() => router.push(`/work-order/${params.value}`)}
          sx={{
            color: "#1976d2",
            textTransform: "none",
            fontSize: "0.875rem",
            padding: "6px 12px",
            minWidth: "auto",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#f3f4f6",
            },
          }}
        >
          {params.value}
        </MuiButton>
      ),
    },
    {
      field: "generatorName",
      headerName: "Generator Name",
      width: 180,
      renderCell: (params) => (
        <span className="font-medium text-gray-900">{params.value}</span>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      width: 120,
      renderCell: (params) => (
        <span className="text-gray-700">{formatDate(params.value)}</span>
      ),
      editable: isEditMode,
      type: "string",
    },
    {
      field: "offspecCode",
      headerName: "Offspec Code",
      width: 120,
      editable: isEditMode,
      renderCell: (params) => (
        <span
          className={
            params.value ? "text-orange-600 font-medium" : "text-gray-500"
          }
        >
          {params.value || "N/A"}
        </span>
      ),
    },
    {
      field: "offspecNotes",
      headerName: "Offspec Notes",
      width: 150,
      editable: isEditMode,
      renderCell: (params) => (
        <span className={params.value ? "text-orange-600" : "text-gray-500"}>
          {params.value || "N/A"}
        </span>
      ),
    },
    {
      field: "itemCode",
      headerName: "Item Code",
      width: 120,
      editable: isEditMode,
      renderCell: (params) => (
        <span className="font-mono text-sm text-gray-700">{params.value}</span>
      ),
    },
    {
      field: "lineDescription",
      headerName: "Line Description",
      width: 250,
      editable: isEditMode,
      renderCell: (params) => (
        <span className="text-gray-800">{params.value}</span>
      ),
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 100,
      type: "number",
      editable: isEditMode,
      renderCell: (params) => (
        <span className="font-medium text-gray-900">{params.value}</span>
      ),
    },
    {
      field: "uom",
      headerName: "UOM",
      width: 100,
      editable: isEditMode,
      renderCell: (params) => (
        <span className="text-gray-700">{params.value}</span>
      ),
    },
    {
      field: "disposalPrice",
      headerName: "Disposal Price",
      width: 130,
      type: "number",
      renderCell: (params) => (
        <span className="font-medium text-green-700">
          {formatCurrency(params.value)}
        </span>
      ),
      editable: isEditMode,
    },
    {
      field: "transPrice",
      headerName: "Trans Price",
      width: 130,
      type: "number",
      renderCell: (params) => (
        <span className="font-medium text-blue-700">
          {formatCurrency(params.value)}
        </span>
      ),
      editable: isEditMode,
    },
    {
      field: "linePrice",
      headerName: "Line Price",
      width: 130,
      type: "number",
      renderCell: (params) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(params.value)}
        </span>
      ),
      editable: isEditMode,
    },
    {
      field: "totalPrice",
      headerName: "Total Price",
      width: 130,
      type: "number",
      renderCell: (params) => (
        <span className="font-bold text-red-600">
          {formatCurrency(params.value)}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      renderCell: (params) => (
        <div className="flex space-x-1">
          {isEditMode && (
            <IconButton
              size="small"
              onClick={() => deleteLine("disposalLines", params.row.id)}
              sx={{
                color: "#ef4444",
                "&:hover": {
                  backgroundColor: "#fef2f2",
                },
              }}
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              // Show menu with container and pricing options
              const containerUrl = `/container/${params.row.containerInfo}`;
              const pricingUrl = `/profile-pricing/${params.row.pricingInfo}`;

              // For now, we'll show a simple alert with options
              // In a real app, this would be a proper dropdown menu
              const choice = window.confirm(
                `Choose an action:\n\n` +
                  `Click OK to view Container Info\n` +
                  `Click Cancel to view Pricing Info`
              );

              if (choice) {
                router.push(containerUrl);
              } else {
                router.push(pricingUrl);
              }
            }}
            sx={{
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </IconButton>
        </div>
      ),
    },
  ];

  // Non-Disposal Lines DataGrid columns
  const nonDisposalLineColumns: GridColDef[] = [
    {
      field: "workOrder",
      headerName: "Work Order",
      width: 130,
      renderCell: (params) => (
        <MuiButton
          variant="text"
          size="small"
          onClick={() => router.push(`/work-order/${params.value}`)}
          sx={{
            color: "#1976d2",
            textTransform: "none",
            fontSize: "0.875rem",
            padding: "6px 12px",
            minWidth: "auto",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#f3f4f6",
            },
          }}
        >
          {params.value}
        </MuiButton>
      ),
    },
    {
      field: "generatorName",
      headerName: "Generator",
      width: 180,
      renderCell: (params) => (
        <span className="font-medium text-gray-900">{params.value}</span>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      width: 120,
      renderCell: (params) => (
        <span className="text-gray-700">{formatDate(params.value)}</span>
      ),
      editable: isEditMode,
      type: "string",
    },
    {
      field: "mainCategory",
      headerName: "Main Category",
      width: 150,
      editable: isEditMode,
      renderCell: (params) => (
        <span className="text-gray-800">{params.value}</span>
      ),
    },
    {
      field: "itemCode",
      headerName: "Item Code",
      width: 120,
      editable: isEditMode,
      renderCell: (params) => (
        <span className="font-mono text-sm text-gray-700">{params.value}</span>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 250,
      editable: isEditMode,
      renderCell: (params) => (
        <span className="text-gray-800">{params.value}</span>
      ),
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 100,
      type: "number",
      editable: isEditMode,
      renderCell: (params) => (
        <span className="font-medium text-gray-900">{params.value}</span>
      ),
    },
    {
      field: "uom",
      headerName: "UOM",
      width: 100,
      editable: isEditMode,
      renderCell: (params) => (
        <span className="text-gray-700">{params.value}</span>
      ),
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
      width: 130,
      type: "number",
      renderCell: (params) => (
        <span className="font-medium text-blue-700">
          {formatCurrency(params.value)}
        </span>
      ),
      editable: isEditMode,
    },
    {
      field: "linePrice",
      headerName: "Line Price",
      width: 130,
      type: "number",
      renderCell: (params) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(params.value)}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      renderCell: (params) => (
        <div className="flex space-x-1">
          {isEditMode && (
            <IconButton
              size="small"
              onClick={() => deleteLine("nonDisposalLines", params.row.id)}
              sx={{
                color: "#ef4444",
                "&:hover": {
                  backgroundColor: "#fef2f2",
                },
              }}
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          )}
        </div>
      ),
    },
  ];

  const currentInvoice = isEditMode ? editedInvoice : invoice;

  // Calculate totals
  const disposalTotal = currentInvoice.disposalLines.reduce(
    (sum, line) => sum + line.totalPrice,
    0
  );
  const nonDisposalTotal = currentInvoice.nonDisposalLines.reduce(
    (sum, line) => sum + line.linePrice,
    0
  );
  const totalQuantity = currentInvoice.disposalLines.reduce(
    (sum, line) => sum + line.quantity,
    0
  );

  // Consistent DataGrid styling used across the app
  const dataGridStyles = {
    "& .MuiDataGrid-cell": {
      fontSize: "0.875rem",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid #f3f4f6",
    },
    "& .MuiDataGrid-columnHeader": {
      fontSize: "0.875rem",
      padding: "12px 16px",
      backgroundColor: "#E0E0E0",
      borderBottom: "2px solid #65B230 !important",
      fontWeight: 600,
      color: "#374151",
    },
    "& .MuiDataGrid-columnHeaders": {
      borderBottom: "2px solid #65B230 !important",
      position: "sticky",
      top: 0,
      zIndex: 1,
      backgroundColor: "#E0E0E0",
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: "#f5f5f5",
    },
    "& .MuiDataGrid-row:nth-child(even)": {
      backgroundColor: "#fafafa",
    },
    border: "1px solid #b9b9b9",
    borderRadius: "4px",
    "& .MuiDataGrid-footerContainer": {
      borderTop: "1px solid #e5e7eb",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="w-full max-w-[1800px] mx-auto px-4">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <SecondaryButton
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </SecondaryButton>

              <div className="flex items-center space-x-3">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Invoice Detail Lines
                  </h1>
                  <p className="text-sm text-gray-600">
                    Managing line items for invoice {invoice.invoiceNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!isEditMode ? (
                <PrimaryButton
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Lines
                </PrimaryButton>
              ) : (
                <>
                  <SecondaryButton
                    onClick={handleCancel}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </PrimaryButton>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Consolidated Invoice Summary */}
        <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300 mb-6">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-1 h-8 bg-blue-500 rounded-full mr-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                Invoice Information
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  INVOICE #
                </p>
                <p className="text-base font-bold text-gray-900">
                  {currentInvoice.invoiceNumber}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  INVOICE AMOUNT
                </p>
                <p className="text-base font-bold text-gray-900">
                  {formatCurrency(currentInvoice.invoiceAmount)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  INVOICE STATUS
                </p>
                <div className="mt-1">
                  {getStatusBadge(currentInvoice.invoiceStatus)}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  INVOICE DATE
                </p>
                <p className="text-base font-bold text-gray-900">
                  {formatDate(currentInvoice.invoiceDate)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  FINALIZE DATE
                </p>
                <p className="text-base font-bold text-gray-900">
                  {currentInvoice.finalizeDate
                    ? formatDate(currentInvoice.finalizeDate)
                    : "Not finalized"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  FACILITY NAME
                </p>
                <p className="text-base font-bold text-gray-900">
                  {currentInvoice.facilityName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  PURCHASE ORDER(S)
                </p>
                <p className="text-base font-bold text-gray-900">
                  {currentInvoice.purchaseOrders.join(", ")}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  INVOICE DISCOUNT
                </p>
                <p className="text-base font-bold text-gray-900">0%</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  REBILL DETAILS
                </p>
                <p className="text-base font-bold text-gray-900">
                  Not a rebill
                </p>
              </div>
            </div>

            {/* Additional Info Row */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                    BILLING NOTES
                  </p>
                  <p className="text-sm text-gray-700">
                    {currentInvoice.customer.name} Billing Notes: New Contact:
                    BJ Scheaffer
                  </p>
                </div>
                <SecondaryButton
                  onClick={() => setShowNotes(!showNotes)}
                  size="small"
                  className="text-blue-600 hover:bg-blue-50 text-xs"
                >
                  {showNotes ? "Hide Details" : "Show Details"}
                </SecondaryButton>
              </div>
              {showNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">
                        Billing Information Update
                      </p>
                      <p className="text-xs text-yellow-700">
                        New contact person: BJ Scheaffer has been assigned to
                        this account. Please ensure all future communications
                        are directed to the new contact.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Disposal Lines Section */}
        <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300 mb-6">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-1 h-8 bg-green-500 rounded-full mr-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Disposal Lines
                </h2>
              </div>
              {isEditMode && (
                <PrimaryButton
                  onClick={addDisposalLine}
                  size="small"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line
                </PrimaryButton>
              )}
            </div>

            {/* Summary Header */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">
                      Total Quantity:
                    </span>
                    <span className="text-lg font-semibold text-red-600">
                      {totalQuantity.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">
                      Total Amount:
                    </span>
                    <span className="text-lg font-semibold text-red-600">
                      {formatCurrency(disposalTotal)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {currentInvoice.disposalLines.length} line items
                </div>
              </div>
            </div>

            <div style={{ width: "100%", height: "400px" }}>
              <DataGrid
                rows={currentInvoice.disposalLines}
                columns={disposalLineColumns}
                getRowId={(row) => row.id}
                density="standard"
                sx={dataGridStyles}
                disableRowSelectionOnClick={true}
                disableColumnMenu={true}
                slots={{
                  noRowsOverlay: () => (
                    <div className="flex items-center justify-center h-32">
                      <span className="text-gray-500 italic">
                        No disposal lines found.
                      </span>
                    </div>
                  ),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Non-Disposal Lines Section */}
        <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300 mb-6">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-1 h-8 bg-blue-500 rounded-full mr-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Non-Disposal Lines
                </h2>
              </div>
              {isEditMode && (
                <PrimaryButton
                  onClick={addNonDisposalLine}
                  size="small"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line
                </PrimaryButton>
              )}
            </div>

            {/* Summary Header */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">
                      Total Quantity:
                    </span>
                    <span className="text-lg font-semibold text-blue-600">
                      {currentInvoice.nonDisposalLines
                        .reduce((sum, line) => sum + line.quantity, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">
                      Total Amount:
                    </span>
                    <span className="text-lg font-semibold text-blue-600">
                      {formatCurrency(nonDisposalTotal)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {currentInvoice.nonDisposalLines.length} line items
                </div>
              </div>
            </div>

            <div style={{ width: "100%", height: "350px" }}>
              <DataGrid
                rows={currentInvoice.nonDisposalLines}
                columns={nonDisposalLineColumns}
                getRowId={(row) => row.id}
                density="standard"
                sx={dataGridStyles}
                disableRowSelectionOnClick={true}
                disableColumnMenu={true}
                slots={{
                  noRowsOverlay: () => (
                    <div className="flex items-center justify-center h-32">
                      <span className="text-gray-500 italic">
                        No non-disposal lines found.
                      </span>
                    </div>
                  ),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Grand Total Section */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg border-0 rounded-xl overflow-hidden mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Grand Total</h3>
                </div>
                <p className="text-indigo-100 text-sm">
                  Combined total of all line items
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(disposalTotal + nonDisposalTotal)}
                </div>
                <div className="text-indigo-100 text-xs">
                  {currentInvoice.disposalLines.length +
                    currentInvoice.nonDisposalLines.length}{" "}
                  total line items
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Footer */}
        <div className="flex justify-center">
          <SecondaryButton
            onClick={() => router.push(`/invoice-detail/${invoiceId}`)}
            size="large"
            className="px-6 py-2 text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Back to Invoice Details
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
