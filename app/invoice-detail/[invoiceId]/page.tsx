"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Plus,
  Link,
  Unlink,
  Calendar,
  DollarSign,
  Building2,
  User,
  FileText,
  CreditCard,
  Truck,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Printer,
  Mail,
  Download,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

// Mock invoice data - in a real app, this would come from an API
const mockInvoice = {
  id: "564656",
  invoiceNumber: "INV-564656",
  invoiceAmount: 10629.18,
  invoiceStatus: "open",
  invoiceDate: "2024-01-15",
  finalizeDate: "",
  facilityName: "Calvert City, KY",
  purchaseOrders: ["4527672015", "4527672016"],
  invoiceDiscount: 5.0,
  rebillDetails: {
    isRebill: false,
    originalInvoiceNumber: "",
  },
  workOrders: [
    {
      id: "WO-001",
      number: "WO-2024-001",
      status: "open",
      type: "disposal",
      date: "2024-01-10",
      workOrderStatus: "assigned",
      jobNumber: "PRJ-001",
      taxRate: 8.5,
    },
  ],
  customer: {
    id: "8176",
    name: "Univar Solutions Usa Inc",
    navId: "NEX315A",
    address: "123 Business Blvd, Anytown, ST 12345",
  },
  generator: {
    name: "Main Generator",
    address: "456 Industrial Way, Anytown, ST 12345",
  },
  facility: {
    name: "Calvert City Facility",
  },
  csr: {
    createdBy: "John Smith",
    modifiedBy: "Sarah Johnson",
    approvedBy: "Mike Wilson",
    notes: "Standard invoice processing",
  },
  payment: {
    terms: "Net 30",
    dueDate: "2024-02-15",
    method: "credit",
  },
  disposal: {
    category: "hazardous",
    transportationCategory: "specialized",
  },
  fees: {
    environmentalAssessment: true,
    economicAdjustment: true,
    taxExempt: false,
  },
  creditMemo: {
    number: "",
    status: "",
    amount: 0,
  },
  createdBy: "josh.bauer",
  createdDate: "2024-01-15",
  lastModified: "2024-01-17",
};

interface InvoiceDetailProps {}

export default function InvoiceDetailPage({}: InvoiceDetailProps) {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState(mockInvoice);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(mockInvoice);
  const [isLoading, setIsLoading] = useState(false);
  const [showDocumentMenu, setShowDocumentMenu] = useState(false);
  const documentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real app, fetch invoice data based on invoiceId
    console.log("Loading invoice detail:", invoiceId);
  }, [invoiceId]);

  // Close document menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDocumentMenu &&
        documentMenuRef.current &&
        !documentMenuRef.current.contains(event.target as Node)
      ) {
        setShowDocumentMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDocumentMenu]);

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
      toast.success("Invoice updated successfully");
    }, 1000);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedInvoice(invoice);
  };

  const handleFinalizeInvoice = async () => {
    if (invoice.invoiceStatus === "finalized") {
      toast.info("Invoice is already finalized");
      return;
    }

    setIsLoading(true);
    // Simulate API call to finalize invoice
    setTimeout(() => {
      const updatedInvoice = {
        ...invoice,
        invoiceStatus: "finalized",
        finalizeDate: new Date().toISOString().split("T")[0],
      };
      setInvoice(updatedInvoice);
      setIsLoading(false);
      toast.success("Invoice marked as finalized successfully");
    }, 1000);
  };

  const handleAddWorkOrder = () => {
    toast.info("Add Work Order functionality would be implemented here");
  };

  const handleRemoveWorkOrder = (workOrderId: string) => {
    toast.info(
      `Remove Work Order ${workOrderId} functionality would be implemented here`
    );
  };

  const handleChangeWorkOrder = (workOrderId: string) => {
    toast.info(
      `Change Work Order ${workOrderId} functionality would be implemented here`
    );
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
        className:
          "bg-blue-50 text-blue-700 border-blue-300 px-3 py-1.5 text-sm font-semibold",
        icon: Clock,
      },
      "in-progress": {
        label: "In Progress",
        className:
          "bg-orange-50 text-orange-700 border-orange-300 px-3 py-1.5 text-sm font-semibold",
        icon: AlertCircle,
      },
      "on-hold": {
        label: "On Hold",
        className:
          "bg-red-50 text-red-700 border-red-300 px-3 py-1.5 text-sm font-semibold",
        icon: AlertCircle,
      },
      finalized: {
        label: "Finalized",
        className:
          "bg-green-50 text-green-700 border-green-300 px-3 py-1.5 text-sm font-semibold",
        icon: CheckCircle,
      },
      void: {
        label: "Void",
        className:
          "bg-gray-50 text-gray-700 border-gray-300 px-3 py-1.5 text-sm font-semibold",
        icon: AlertCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center space-x-2 ${config.className} rounded-full`}
      >
        <IconComponent className="h-4 w-4" />
        <span className="font-medium">{config.label}</span>
      </div>
    );
  };

  const getWorkOrderStatusBadge = (status: string) => {
    const statusConfig = {
      assigned: {
        label: "Assigned",
        className:
          "bg-green-50 text-green-700 border-green-300 px-2 py-1 text-xs font-medium",
      },
      available: {
        label: "Available",
        className:
          "bg-blue-50 text-blue-700 border-blue-300 px-2 py-1 text-xs font-medium",
      },
      removed: {
        label: "Removed",
        className:
          "bg-red-50 text-red-700 border-red-300 px-2 py-1 text-xs font-medium",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.assigned;

    return (
      <div
        className={`inline-flex items-center ${config.className} rounded-full`}
      >
        <span className="font-medium">{config.label}</span>
      </div>
    );
  };

  const currentInvoice = isEditMode ? editedInvoice : invoice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="w-full max-w-7xl mx-auto px-6">
        {/* Header with Back Button and Quick Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Invoices</span>
          </Button>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Split Button for Document Actions */}
            <div ref={documentMenuRef} className="flex items-center relative">
              {/* Main Print Button */}
              <Button
                variant="secondary"
                size="small"
                className="flex items-center space-x-1 lg:space-x-2 text-gray-700 hover:bg-gray-50 border-gray-200 border-r-0 rounded-r-none px-2 lg:px-3"
                onClick={() => toast.info("Printing invoice...")}
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>

              {/* Dropdown Toggle */}
              <Button
                variant="secondary"
                size="small"
                className="flex items-center text-gray-700 hover:bg-gray-50 border-gray-200 border-l-0 rounded-l-none px-2 hover:bg-gray-100"
                onClick={() => setShowDocumentMenu(!showDocumentMenu)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Document Actions Dropdown Menu */}
            {showDocumentMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      toast.info("Printing invoice...");
                      setShowDocumentMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.info("Opening email client...");
                      setShowDocumentMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.info("Downloading invoice...");
                      setShowDocumentMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              size="small"
              className="flex items-center space-x-1 lg:space-x-2 text-gray-700 hover:bg-gray-50 border-gray-200 px-2 lg:px-3"
              onClick={() =>
                router.push(`/invoice-detail/${invoiceId}/detail-lines`)
              }
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Line Items</span>
            </Button>

            {/* Invoice Management Actions */}
            <div className="border-l border-gray-300 h-6 mx-2"></div>

            <Button
              onClick={handleEdit}
              size="small"
              className="flex items-center space-x-1 lg:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-2 lg:px-3"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>

            <Button
              onClick={handleFinalizeInvoice}
              disabled={currentInvoice.invoiceStatus === "finalized"}
              size="small"
              className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 ${
                currentInvoice.invoiceStatus === "finalized"
                  ? "text-gray-400 cursor-not-allowed bg-gray-100 border-gray-200"
                  : "text-green-700 hover:bg-green-50 border-green-600 bg-green-50"
              }`}
              variant="secondary"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentInvoice.invoiceStatus === "finalized"
                  ? "Finalized"
                  : "Finalize"}
              </span>
            </Button>
          </div>
        </div>

        {/* Main Content - Single Column Layout */}
        <div className="w-full">
          {/* Invoice Details */}
          <div className="space-y-8">
            {/* 1. Invoice Information */}
            <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300">
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
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.invoiceDiscount}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      REBILL DETAILS
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.rebillDetails.isRebill ? (
                        <span className="text-orange-600">
                          Rebill -{" "}
                          {currentInvoice.rebillDetails.originalInvoiceNumber}
                        </span>
                      ) : (
                        "Not a rebill"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Work Order Details */}
            <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-1 h-8 bg-green-500 rounded-full mr-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Work Order Details
                    </h2>
                  </div>
                  <Button
                    onClick={handleAddWorkOrder}
                    size="small"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Link Work Order
                  </Button>
                </div>

                {currentInvoice.workOrders.map((workOrder, index) => (
                  <div
                    key={workOrder.id}
                    className="border border-gray-200 rounded-lg p-4 mb-4"
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                          WORK ORDER #
                        </p>
                        <p className="text-base font-bold text-gray-900">
                          {workOrder.number}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                          WORK ORDER STATUS
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(workOrder.status)}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                          WORK ORDER TYPE
                        </p>
                        <p className="text-base font-bold text-gray-900 capitalize">
                          {workOrder.type}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                          WORK ORDER DATE
                        </p>
                        <p className="text-base font-bold text-gray-900">
                          {formatDate(workOrder.date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                          WORK ORDER STATUS
                        </p>
                        <div className="mt-1">
                          {getWorkOrderStatusBadge(workOrder.workOrderStatus)}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                          JOB #
                        </p>
                        <p className="text-base font-bold text-gray-900">
                          {workOrder.jobNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                          TAX RATE
                        </p>
                        <p className="text-base font-bold text-gray-900">
                          {workOrder.taxRate}%
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleChangeWorkOrder(workOrder.id)}
                        size="small"
                        variant="secondary"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Change Work Order
                      </Button>
                      <Button
                        onClick={() => handleRemoveWorkOrder(workOrder.id)}
                        size="small"
                        variant="secondary"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Unlink className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                {currentInvoice.workOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No work orders linked to this invoice.</p>
                    <p className="text-sm">
                      Click "Link Work Order" to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Customer & Generator Details */}
            <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Customer & Generator Details
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      CUSTOMER NAME
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.customer.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      GENERATOR NAME
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.generator.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      GENERATOR ADDRESS
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.generator.address}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      FACILITY
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.facility.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. CSR Details */}
            <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  CSR Details
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      CSR NAME (CREATED BY)
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.csr.createdBy}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      CSR NAME (MODIFIED BY)
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.csr.modifiedBy}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      CSR NAME (APPROVED BY)
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.csr.approvedBy}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      CSR NOTES
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.csr.notes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Payment Details */}
            <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Payment Details
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      PAYMENT TERMS
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.payment.terms}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      PAYMENT DUE DATE
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {formatDate(currentInvoice.payment.dueDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      PAYMENT METHOD
                    </p>
                    <p className="text-base font-bold text-gray-900 capitalize">
                      {currentInvoice.payment.method}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. Disposal Information */}
            <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Disposal Information
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      DISPOSAL CATEGORY
                    </p>
                    <p className="text-base font-bold text-gray-900 capitalize">
                      {currentInvoice.disposal.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      TRANSPORTATION CATEGORY
                    </p>
                    <p className="text-base font-bold text-gray-900 capitalize">
                      {currentInvoice.disposal.transportationCategory}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7. Fees / Taxes */}
            <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Fees / Taxes
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="environmental"
                      checked={currentInvoice.fees.environmentalAssessment}
                      disabled
                    />
                    <Label
                      htmlFor="environmental"
                      className="text-base font-medium"
                    >
                      Environmental Assessment Fee
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="economic"
                      checked={currentInvoice.fees.economicAdjustment}
                      disabled
                    />
                    <Label htmlFor="economic" className="text-base font-medium">
                      Economic Adjustment Fee
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="taxExempt"
                      checked={currentInvoice.fees.taxExempt}
                      disabled
                    />
                    <Label
                      htmlFor="taxExempt"
                      className="text-base font-medium"
                    >
                      Tax Exempt
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 8. Credit Memo Details */}
            <Card className="bg-white border border-gray-200 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Credit Memo Details
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      CREDIT MEMO #
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.creditMemo.number || "No credit memo"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      STATUS
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.creditMemo.status || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      CREDIT AMOUNT
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {currentInvoice.creditMemo.amount > 0
                        ? formatCurrency(currentInvoice.creditMemo.amount)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Mode Overlay */}
        {isEditMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-white shadow-lg border-0 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Edit Invoice
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Invoice Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Invoice Information
                    </h3>

                    <div>
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input
                        id="invoiceNumber"
                        value={editedInvoice.invoiceNumber}
                        onChange={(e) =>
                          setEditedInvoice({
                            ...editedInvoice,
                            invoiceNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="invoiceDate">Invoice Date</Label>
                      <Input
                        id="invoiceDate"
                        type="date"
                        value={editedInvoice.invoiceDate}
                        onChange={(e) =>
                          setEditedInvoice({
                            ...editedInvoice,
                            invoiceDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="invoiceAmount">Invoice Amount</Label>
                      <Input
                        id="invoiceAmount"
                        type="number"
                        step="0.01"
                        value={editedInvoice.invoiceAmount}
                        onChange={(e) =>
                          setEditedInvoice({
                            ...editedInvoice,
                            invoiceAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="invoiceDiscount">
                        Invoice Discount (%)
                      </Label>
                      <Input
                        id="invoiceDiscount"
                        type="number"
                        step="0.1"
                        value={editedInvoice.invoiceDiscount}
                        onChange={(e) =>
                          setEditedInvoice({
                            ...editedInvoice,
                            invoiceDiscount: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Customer Information
                    </h3>

                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={editedInvoice.customer.name}
                        onChange={(e) =>
                          setEditedInvoice({
                            ...editedInvoice,
                            customer: {
                              ...editedInvoice.customer,
                              name: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="facilityName">Facility Name</Label>
                      <Input
                        id="facilityName"
                        value={editedInvoice.facilityName}
                        onChange={(e) =>
                          setEditedInvoice({
                            ...editedInvoice,
                            facilityName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="purchaseOrders">Purchase Orders</Label>
                      <Input
                        id="purchaseOrders"
                        value={editedInvoice.purchaseOrders.join(", ")}
                        onChange={(e) =>
                          setEditedInvoice({
                            ...editedInvoice,
                            purchaseOrders: e.target.value
                              .split(",")
                              .map((po) => po.trim())
                              .filter((po) => po),
                          })
                        }
                        placeholder="Enter PO numbers separated by commas"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    size="small"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    size="small"
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
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
