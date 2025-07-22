"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Download,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Paperclip,
  Send,
  Plus,
  Upload,
  X,
  MessageSquare,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// Interface for price change request data
interface PriceChangeRequest {
  requestId: string;
  subject: string;
  description: string;
  requestType: "Customer" | "Multiple Customers" | "General/Global";
  customerId?: string;
  customerName?: string;
  assignedTo: string;
  status:
    | "Draft"
    | "Submitted"
    | "In Review"
    | "Approved"
    | "In Progress"
    | "Completed"
    | "Rejected";
  submittedBy: string;
  submittedDate: string;
  attachments: string[];
  notes?: string;
  notesList?: Note[];
  documents?: Document[];
}

interface StatusUpdateModalState {
  isOpen: boolean;
  newStatus: string;
  notes: string;
}

interface EditModeState {
  isEditing: boolean;
  subject: string;
  description: string;
  requestType: "Customer" | "Multiple Customers" | "General/Global";
  customerId: string;
  customerName: string;
  assignedTo: string;
}

interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

interface Document {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  type: "attachment" | "uploaded"; // Distinguish between original attachments and user uploads
}

// Mock service for price change requests
class PriceChangeRequestService {
  async getPriceChangeRequest(
    requestId: string
  ): Promise<PriceChangeRequest | null> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock data - in real app this would fetch from API
    const mockRequests: PriceChangeRequest[] = [
      {
        requestId: "PCR-2024-001",
        subject: "Annual Rate Increase for Acme Corporation",
        description:
          "Implement 5% annual rate increase across all services for Acme Corporation effective March 1, 2024. This increase aligns with our annual pricing review and market conditions. The increase will apply to all current service contracts and new contracts signed after the effective date. Customer has been notified of the pending increase and has provided preliminary approval.",
        requestType: "Customer",
        customerId: "CUST-001",
        customerName: "Acme Corporation",
        assignedTo: "Sarah Johnson",
        status: "In Progress",
        submittedBy: "John Smith",
        submittedDate: "2024-01-15",
        attachments: [
          "rate_increase_proposal.pdf",
          "customer_approval.pdf",
          "pricing_analysis.xlsx",
        ],
        notes:
          "Customer approved the increase on 1/20/2024. Implementation scheduled for March 1st.",
        notesList: [
          {
            id: "1",
            content:
              "Pricing agreement finalized with customer. 5% increase approved and signed off by Acme Corp management. Moving to implementation phase.",
            author: "John Smith",
            timestamp: "2024-01-16T10:30:00Z",
          },
          {
            id: "2",
            content:
              "Customer approval received via email. All terms agreed upon including effective date of March 1st. Ready to proceed with system updates.",
            author: "Sarah Johnson",
            timestamp: "2024-01-17T14:20:00Z",
          },
          {
            id: "3",
            content:
              "Implementation timeline confirmed with customer. They've been notified of the March 1st effective date and are updating their internal systems accordingly.",
            author: "Mike Wilson",
            timestamp: "2024-01-18T09:15:00Z",
          },
          {
            id: "4",
            content:
              "System configuration updates in progress. All customer accounts have been flagged for the new pricing structure effective March 1st.",
            author: "Sarah Johnson",
            timestamp: "2024-01-19T16:45:00Z",
          },
        ],
        documents: [
          // Original attachments converted to documents
          {
            id: "att-1",
            name: "rate_increase_proposal.pdf",
            size: "1.2 MB",
            uploadedBy: "John Smith",
            uploadedAt: "2024-01-15T09:00:00Z",
            type: "attachment",
          },
          {
            id: "att-2",
            name: "customer_approval.pdf",
            size: "856 KB",
            uploadedBy: "John Smith",
            uploadedAt: "2024-01-15T09:00:00Z",
            type: "attachment",
          },
          {
            id: "att-3",
            name: "pricing_analysis.xlsx",
            size: "2.1 MB",
            uploadedBy: "John Smith",
            uploadedAt: "2024-01-15T09:00:00Z",
            type: "attachment",
          },
          // Additional uploaded documents
          {
            id: "1",
            name: "customer_approval_letter.pdf",
            size: "245 KB",
            uploadedBy: "John Smith",
            uploadedAt: "2024-01-20T09:15:00Z",
            type: "uploaded",
          },
          {
            id: "2",
            name: "implementation_timeline.xlsx",
            size: "89 KB",
            uploadedBy: "Sarah Johnson",
            uploadedAt: "2024-01-21T11:45:00Z",
            type: "uploaded",
          },
        ],
      },
      {
        requestId: "PCR-2024-002",
        subject: "Utah State Contract Pricing Update",
        description:
          "Update pricing structure for all Utah state contracts to reflect new regulatory requirements and competitive market positioning. This affects 15 different state agencies and requires coordination with the Utah Department of Environmental Quality. The changes include new compliance fees and updated service rates.",
        requestType: "Multiple Customers",
        assignedTo: "David Brown",
        status: "In Review",
        submittedBy: "Mike Wilson",
        submittedDate: "2024-01-20",
        attachments: [
          "utah_contracts.xlsx",
          "regulatory_changes.pdf",
          "impact_analysis.docx",
        ],
        documents: [
          {
            id: "att-1",
            name: "utah_contracts.xlsx",
            size: "3.4 MB",
            uploadedBy: "Mike Wilson",
            uploadedAt: "2024-01-20T10:30:00Z",
            type: "attachment",
          },
          {
            id: "att-2",
            name: "regulatory_changes.pdf",
            size: "1.8 MB",
            uploadedBy: "Mike Wilson",
            uploadedAt: "2024-01-20T10:30:00Z",
            type: "attachment",
          },
          {
            id: "att-3",
            name: "impact_analysis.docx",
            size: "567 KB",
            uploadedBy: "Mike Wilson",
            uploadedAt: "2024-01-20T10:30:00Z",
            type: "attachment",
          },
        ],
        notesList: [
          {
            id: "1",
            content:
              "Utah DEQ has approved the new pricing structure. All 15 state agencies have been notified and are in agreement with the changes.",
            author: "Mike Wilson",
            timestamp: "2024-01-21T11:30:00Z",
          },
          {
            id: "2",
            content:
              "Contract amendments have been drafted and sent to all affected agencies. Expected completion by end of month.",
            author: "David Brown",
            timestamp: "2024-01-22T15:20:00Z",
          },
        ],
      },
      {
        requestId: "PCR-2024-003",
        subject: "Global Fuel Surcharge Adjustment",
        description:
          "Implement new fuel surcharge calculation methodology across all customers to better reflect current fuel costs and market volatility. This will replace the current flat-rate surcharge with a dynamic calculation based on current diesel fuel prices and will be updated monthly.",
        requestType: "General/Global",
        assignedTo: "Michael Chen",
        status: "Approved",
        submittedBy: "Lisa Davis",
        submittedDate: "2024-01-25",
        attachments: [
          "fuel_analysis.xlsx",
          "approval_document.pdf",
          "implementation_plan.docx",
        ],
        documents: [
          {
            id: "att-1",
            name: "fuel_analysis.xlsx",
            size: "4.2 MB",
            uploadedBy: "Lisa Davis",
            uploadedAt: "2024-01-25T14:15:00Z",
            type: "attachment",
          },
          {
            id: "att-2",
            name: "approval_document.pdf",
            size: "2.3 MB",
            uploadedBy: "Lisa Davis",
            uploadedAt: "2024-01-25T14:15:00Z",
            type: "attachment",
          },
          {
            id: "att-3",
            name: "implementation_plan.docx",
            size: "1.1 MB",
            uploadedBy: "Lisa Davis",
            uploadedAt: "2024-01-25T14:15:00Z",
            type: "attachment",
          },
        ],
        notesList: [
          {
            id: "1",
            content:
              "Executive approval received for the new fuel surcharge methodology. All stakeholders have been briefed and are in agreement.",
            author: "Lisa Davis",
            timestamp: "2024-01-26T09:30:00Z",
          },
          {
            id: "2",
            content:
              "IT team has confirmed the new calculation system can be implemented by February 1st. Monthly updates will be automated.",
            author: "Michael Chen",
            timestamp: "2024-01-27T13:45:00Z",
          },
          {
            id: "3",
            content:
              "Customer notification process finalized. All customers will receive advance notice of the new surcharge calculation method.",
            author: "Lisa Davis",
            timestamp: "2024-01-28T16:20:00Z",
          },
        ],
      },
    ];

    return mockRequests.find((req) => req.requestId === requestId) || null;
  }

  async updateRequestStatus(
    requestId: string,
    newStatus: string,
    notes?: string
  ): Promise<void> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(
      `Updating request ${requestId} to status ${newStatus} with notes: ${notes}`
    );
  }

  async addNote(requestId: string, content: string): Promise<Note> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      author: "Current User",
      timestamp: new Date().toISOString(),
    };
    console.log(`Adding note to request ${requestId}:`, newNote);
    return newNote;
  }

  async uploadDocument(requestId: string, file: File): Promise<Document> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      uploadedBy: "Current User",
      uploadedAt: new Date().toISOString(),
      type: "uploaded",
    };
    console.log(`Uploading document to request ${requestId}:`, newDocument);
    return newDocument;
  }

  async updateRequest(
    requestId: string,
    updates: Partial<PriceChangeRequest>
  ): Promise<void> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(`Updating request ${requestId}:`, updates);
  }
}

const priceChangeRequestService = new PriceChangeRequestService();

export default function PriceChangeRequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.requestId as string;

  const [request, setRequest] = useState<PriceChangeRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdateModal, setStatusUpdateModal] =
    useState<StatusUpdateModalState>({
      isOpen: false,
      newStatus: "",
      notes: "",
    });
  const [editMode, setEditMode] = useState<EditModeState>({
    isEditing: false,
    subject: "",
    description: "",
    requestType: "Customer",
    customerId: "",
    customerName: "",
    assignedTo: "",
  });
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isUpdatingRequest, setIsUpdatingRequest] = useState(false);

  useEffect(() => {
    const loadRequest = async () => {
      setIsLoading(true);
      try {
        const data = await priceChangeRequestService.getPriceChangeRequest(
          requestId
        );
        setRequest(data);
        if (data) {
          setStatusUpdateModal((prev) => ({ ...prev, newStatus: data.status }));
          // Initialize edit mode with current request data
          setEditMode({
            isEditing: false,
            subject: data.subject,
            description: data.description,
            requestType: data.requestType,
            customerId: data.customerId || "",
            customerName: data.customerName || "",
            assignedTo: data.assignedTo,
          });
        }
      } catch (error) {
        console.error("Failed to load price change request:", error);
        toast.error("Failed to load request details");
      } finally {
        setIsLoading(false);
      }
    };

    if (requestId) {
      loadRequest();
    }
  }, [requestId]);

  const handleBack = () => {
    router.back();
  };

  const canEditRequest = () => {
    return true; // Allow editing for all users regardless of status or ownership
  };

  const handleStatusUpdate = async () => {
    if (!request || !statusUpdateModal.newStatus) return;

    try {
      await priceChangeRequestService.updateRequestStatus(
        request.requestId,
        statusUpdateModal.newStatus,
        statusUpdateModal.notes || undefined
      );

      // Update local state
      setRequest((prev) =>
        prev
          ? {
              ...prev,
              status: statusUpdateModal.newStatus as any,
              notes: statusUpdateModal.notes || prev.notes,
            }
          : null
      );

      toast.success("Status updated successfully");
      setStatusUpdateModal({ isOpen: false, newStatus: "", notes: "" });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleAddNote = async () => {
    if (!request || !newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const note = await priceChangeRequestService.addNote(
        request.requestId,
        newNote
      );

      // Update local state
      setRequest((prev) =>
        prev
          ? {
              ...prev,
              notesList: [...(prev.notesList || []), note],
            }
          : null
      );

      setNewNote("");
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!request || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsUploadingDocument(true);

    try {
      const document = await priceChangeRequestService.uploadDocument(
        request.requestId,
        file
      );

      // Update local state
      setRequest((prev) =>
        prev
          ? {
              ...prev,
              documents: [...(prev.documents || []), document],
            }
          : null
      );

      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploadingDocument(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const handleUpdateRequest = async () => {
    if (!request) return;

    setIsUpdatingRequest(true);
    try {
      const updates = {
        subject: editMode.subject,
        description: editMode.description,
        requestType: editMode.requestType,
        customerId:
          editMode.requestType === "Customer" ? editMode.customerId : undefined,
        customerName:
          editMode.requestType === "Customer"
            ? editMode.customerName
            : undefined,
        assignedTo: editMode.assignedTo,
      };

      await priceChangeRequestService.updateRequest(request.requestId, updates);

      // Update local state
      setRequest((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
            }
          : null
      );

      toast.success("Request updated successfully");
      setEditMode((prev) => ({ ...prev, isEditing: false }));
    } catch (error) {
      console.error("Failed to update request:", error);
      toast.error("Failed to update request");
    } finally {
      setIsUpdatingRequest(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Draft: {
        variant: "outline" as const,
        label: "Draft",
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Clock,
      },
      Submitted: {
        variant: "secondary" as const,
        label: "Submitted",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Send,
      },
      "In Review": {
        variant: "outline" as const,
        label: "In Review",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertCircle,
      },
      Approved: {
        variant: "default" as const,
        label: "Approved",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      "In Progress": {
        variant: "outline" as const,
        label: "In Progress",
        className: "bg-orange-100 text-orange-800 border-orange-200",
        icon: Clock,
      },
      Completed: {
        variant: "default" as const,
        label: "Completed",
        className: "bg-green-600 text-white border-green-600",
        icon: CheckCircle,
      },
      Rejected: {
        variant: "destructive" as const,
        label: "Rejected",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      label: status,
      className: "",
      icon: AlertCircle,
    };

    const IconComponent = config.icon;

    return (
      <Badge
        variant={config.variant}
        className={`${config.className} flex items-center gap-1`}
      >
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRequestTypeBadge = (type: string) => {
    const typeConfig = {
      Customer: {
        variant: "secondary" as const,
        label: "Customer",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      "Multiple Customers": {
        variant: "outline" as const,
        label: "Multiple",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      "General/Global": {
        variant: "outline" as const,
        label: "Global",
        className: "bg-orange-100 text-orange-800 border-orange-200",
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      variant: "outline" as const,
      label: type,
      className: "",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDateShort = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading request details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Request not found
            </h3>
            <p className="text-gray-600 mb-4">
              The price change request you're looking for doesn't exist.
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Requests</span>
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {request.requestId}
                </h1>
                {getStatusBadge(request.status)}
                {getRequestTypeBadge(request.requestType)}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {request.subject}
              </h2>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Submitted by {request.submittedBy}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateShort(request.submittedDate)}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  setStatusUpdateModal({
                    isOpen: true,
                    newStatus: request.status,
                    notes: "",
                  })
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details - Editable Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Request Details</CardTitle>
                  {!editMode.isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditMode((prev) => ({ ...prev, isEditing: true }))
                      }
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editMode.isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Subject *
                        </label>
                        <input
                          type="text"
                          value={editMode.subject}
                          onChange={(e) =>
                            setEditMode((prev) => ({
                              ...prev,
                              subject: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Brief summary of the change"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Request Type *
                        </label>
                        <Select
                          value={editMode.requestType}
                          onValueChange={(
                            value:
                              | "Customer"
                              | "Multiple Customers"
                              | "General/Global"
                          ) =>
                            setEditMode((prev) => ({
                              ...prev,
                              requestType: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select request type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Customer">Customer</SelectItem>
                            <SelectItem value="Multiple Customers">
                              Multiple Customers
                            </SelectItem>
                            <SelectItem value="General/Global">
                              General/Global
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {editMode.requestType === "Customer" && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Customer *
                          </label>
                          <Select
                            value={editMode.customerId}
                            onValueChange={(value) =>
                              setEditMode((prev) => ({
                                ...prev,
                                customerId: value,
                                customerName:
                                  value === "CUST-001"
                                    ? "Acme Corporation"
                                    : value === "CUST-002"
                                    ? "Tech Solutions Inc"
                                    : value === "CUST-003"
                                    ? "Utah State Agencies"
                                    : "",
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CUST-001">
                                Acme Corporation
                              </SelectItem>
                              <SelectItem value="CUST-002">
                                Tech Solutions Inc
                              </SelectItem>
                              <SelectItem value="CUST-003">
                                Utah State Agencies
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Assigned To *
                        </label>
                        <Select
                          value={editMode.assignedTo}
                          onValueChange={(value) =>
                            setEditMode((prev) => ({
                              ...prev,
                              assignedTo: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sarah Johnson">
                              Sarah Johnson
                            </SelectItem>
                            <SelectItem value="John Smith">
                              John Smith
                            </SelectItem>
                            <SelectItem value="David Brown">
                              David Brown
                            </SelectItem>
                            <SelectItem value="Mike Wilson">
                              Mike Wilson
                            </SelectItem>
                            <SelectItem value="Michael Chen">
                              Michael Chen
                            </SelectItem>
                            <SelectItem value="Lisa Davis">
                              Lisa Davis
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <textarea
                        value={editMode.description}
                        onChange={(e) =>
                          setEditMode((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Detailed explanation of the request and reasoning"
                      />
                    </div>

                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setEditMode((prev) => ({ ...prev, isEditing: false }))
                        }
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateRequest}
                        disabled={
                          isUpdatingRequest ||
                          !editMode.subject.trim() ||
                          !editMode.description.trim() ||
                          !editMode.assignedTo.trim() ||
                          (editMode.requestType === "Customer" &&
                            !editMode.customerId.trim())
                        }
                      >
                        {isUpdatingRequest ? "Updating..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Subject
                        </label>
                        <p className="mt-1 text-gray-900">{request.subject}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Request Type
                        </label>
                        <div className="mt-1">
                          {getRequestTypeBadge(request.requestType)}
                        </div>
                      </div>
                      {request.customerName && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Customer
                          </label>
                          <div className="mt-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {request.customerName}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {request.customerId}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Assigned To
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{request.assignedTo}</span>
                          {request.assignedTo === "Sarah Johnson" && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-600 text-white"
                            >
                              Me
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                        {request.description}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Note Section */}
                <div className="mb-6 pb-4 border-b">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    className="mb-3"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isAddingNote ? "Adding..." : "Add Note"}</span>
                  </Button>
                </div>

                {/* Notes List */}
                <div className="space-y-6">
                  {request.notesList && request.notesList.length > 0 ? (
                    [...request.notesList]
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .map((note) => (
                        <div key={note.id} className="flex space-x-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {note.author
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Note Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {note.author}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(note.timestamp)}
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {note.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No notes yet</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Be the first to add a note
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Documents ({request.documents?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload Section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload additional documents to this request
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploadingDocument}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingDocument ? "Uploading..." : "Choose File"}
                    </label>
                  </div>

                  {/* Documents List */}
                  {request.documents && request.documents.length > 0 ? (
                    <div className="space-y-2">
                      {request.documents.map((document) => (
                        <div
                          key={document.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {document.name}
                                </span>
                                {document.type === "attachment" && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Original
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {document.size} • {document.uploadedBy} •{" "}
                                {formatDateShort(document.uploadedAt)}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-center py-4">
                      No documents available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Status & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Current Status
                  </label>
                  <div className="mt-1">{getStatusBadge(request.status)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Submitted By
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{request.submittedBy}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Submitted Date
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDateShort(request.submittedDate)}</span>
                  </div>
                </div>

                {request.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Status Notes
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{request.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Update Modal */}
        <Dialog
          open={statusUpdateModal.isOpen}
          onOpenChange={(open) =>
            setStatusUpdateModal((prev) => ({ ...prev, isOpen: open }))
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Request Status</DialogTitle>
              <DialogDescription>
                Update the status of this price change request and add any
                relevant notes.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  New Status
                </label>
                <Select
                  value={statusUpdateModal.newStatus}
                  onValueChange={(value) =>
                    setStatusUpdateModal((prev) => ({
                      ...prev,
                      newStatus: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <Textarea
                  placeholder="Add notes about this status change..."
                  value={statusUpdateModal.notes}
                  onChange={(e) =>
                    setStatusUpdateModal((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setStatusUpdateModal({
                    isOpen: false,
                    newStatus: "",
                    notes: "",
                  })
                }
              >
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate}>Update Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
