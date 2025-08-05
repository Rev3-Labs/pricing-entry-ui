"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Button as MuiButton,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuList,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

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
  ChevronDown,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// Interface for price change request data
interface PriceChangeRequest {
  requestId: string;
  subject: string;
  description: string;
  requestType: (
    | "New Customer"
    | "New Item Pricing"
    | "Price Increase"
    | "Price Decrease"
    | "Expire Pricing"
  )[];
  customerId?: string;
  customerName?: string;
  assignedTo: string;
  status: "New" | "In Progress" | "Activated" | "Declined" | "Withdrawn";
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
  requestType: (
    | "New Customer"
    | "New Item Pricing"
    | "Price Increase"
    | "Price Decrease"
    | "Expire Pricing"
  )[];
  customerId: string;
  customerName: string;
  assignedTo: string;
  status: "New" | "In Progress" | "Activated" | "Declined" | "Withdrawn";
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
        requestType: ["Price Increase"],
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
        requestType: ["Price Increase"],
        assignedTo: "David Brown",
        status: "In Progress",
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
        requestType: ["Price Increase"],
        assignedTo: "Michael Chen",
        status: "Activated",
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
    requestType: ["New Customer"],
    customerId: "",
    customerName: "",
    assignedTo: "",
    status: "New",
  });
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isUpdatingRequest, setIsUpdatingRequest] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusMenuAnchorRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadRequest = async () => {
      setIsLoading(true);
      try {
        const data = await priceChangeRequestService.getPriceChangeRequest(
          requestId
        );
        setRequest(data);
        if (data) {
          // Initialize edit mode with current request data
          setEditMode({
            isEditing: false,
            subject: data.subject,
            description: data.description,
            requestType: data.requestType,
            customerId: data.customerId || "",
            customerName: data.customerName || "",
            assignedTo: data.assignedTo,
            status: data.status,
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

  const handleStatusClick = () => {
    if (request) {
      setStatusUpdateModal({
        isOpen: true,
        newStatus: request.status,
        notes: "",
      });
    }
  };

  const handleStatusMenuToggle = () => {
    setStatusMenuOpen((prevOpen) => !prevOpen);
  };

  const handleStatusMenuClose = (event: Event) => {
    if (
      statusMenuAnchorRef.current &&
      statusMenuAnchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setStatusMenuOpen(false);
  };

  const handleStatusOptionClick = (newStatus: string) => {
    if (request && newStatus !== request.status) {
      setStatusUpdateModal({
        isOpen: true,
        newStatus: newStatus,
        notes: "",
      });
    }
    setStatusMenuOpen(false);
  };

  const handleStatusUpdate = async () => {
    if (!request || !statusUpdateModal.newStatus) return;

    setIsUpdatingStatus(true);
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
            }
          : null
      );

      toast.success("Status updated successfully");
      setStatusUpdateModal({ isOpen: false, newStatus: "", notes: "" });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
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
        customerId: editMode.customerId || undefined,
        customerName: editMode.customerName || undefined,
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
      New: {
        label: "New",
        className: "text-[#1976d2]",
        bgColor: "bg-[rgba(25,118,210,0.1)]",
        icon: Clock,
      },
      "In Progress": {
        label: "In Progress",
        className: "text-[#ed6c02]",
        bgColor: "bg-[rgba(237,108,2,0.1)]",
        icon: Clock,
      },
      Activated: {
        label: "Activated",
        className: "text-[#2e7d32]",
        bgColor: "bg-[rgba(46,125,50,0.1)]",
        icon: CheckCircle,
      },
      Declined: {
        label: "Declined",
        className: "text-[#d32f2f]",
        bgColor: "bg-[rgba(211,47,47,0.1)]",
        icon: XCircle,
      },
      Withdrawn: {
        label: "Withdrawn",
        className: "text-[#63666a]",
        bgColor: "bg-[rgba(99,102,106,0.1)]",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "text-[#63666a]",
      bgColor: "bg-[rgba(99,102,106,0.1)]",
      icon: AlertCircle,
    };

    const IconComponent = config.icon;

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-[50px] ${config.bgColor} ${config.className}`}
      >
        <IconComponent className="h-4 w-4" />
        <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px]">
          {config.label}
        </span>
      </div>
    );
  };

  const getRequestTypeBadge = (type: string) => {
    const typeConfig = {
      "New Customer": {
        label: "New Customer",
        className: "text-[#63666a]",
        bgColor: "bg-[rgba(99,102,106,0.1)]",
      },
      "New Item Pricing": {
        label: "New Item",
        className: "text-[#63666a]",
        bgColor: "bg-[rgba(99,102,106,0.1)]",
      },
      "Price Increase": {
        label: "Increase",
        className: "text-[#63666a]",
        bgColor: "bg-[rgba(99,102,106,0.1)]",
      },
      "Price Decrease": {
        label: "Decrease",
        className: "text-[#63666a]",
        bgColor: "bg-[rgba(99,102,106,0.1)]",
      },
      "Expire Pricing": {
        label: "Expire",
        className: "text-[#63666a]",
        bgColor: "bg-[rgba(99,102,106,0.1)]",
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      label: type,
      className: "text-[#63666a]",
      bgColor: "bg-[rgba(99,102,106,0.1)]",
    };

    return (
      <div
        className={`flex max-w-fit items-center px-3 py-1 rounded-[50px] ${config.bgColor} ${config.className}`}
      >
        <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px]">
          {config.label}
        </span>
      </div>
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
      <div className="bg-[#fffbfe] min-h-screen">
        <div className="bg-[#eaeaea] min-h-screen">
          <div className="flex flex-col gap-6 px-6 py-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#65b230] mx-auto mb-4"></div>
                <p className="font-['Roboto:Regular',_sans-serif] text-[#63666a]">
                  Loading request details...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-[#fffbfe] min-h-screen">
        <div className="bg-[#eaeaea] min-h-screen">
          <div className="flex flex-col gap-6 px-6 py-6 max-w-7xl mx-auto">
            <div className="bg-[#ffffff] rounded shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-8">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-[#63666a] mx-auto mb-4" />
                <h3 className="font-['Roboto:Medium',_sans-serif] font-medium text-[18px] leading-[27px] text-[#1c1b1f] mb-2">
                  Request not found
                </h3>
                <p className="font-['Roboto:Regular',_sans-serif] text-[#63666a] mb-4">
                  The price change request you're looking for doesn't exist.
                </p>
                <MuiButton
                  onClick={handleBack}
                  variant="contained"
                  className="flex items-center gap-2 mx-auto"
                  style={{
                    backgroundColor: "#65b230",
                    color: "white",
                    fontFamily: "Roboto, sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "21px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1px",
                    borderRadius: "100px",
                  }}
                >
                  <ArrowLeft className="h-4 w-4 text-white" />
                  <span>Back to Requests</span>
                </MuiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fffbfe] min-h-screen">
      <div className="bg-[#eaeaea] min-h-screen">
        <div className="flex flex-col gap-6 px-6 py-6 max-w-7xl mx-auto">
          {/* Main Card */}
          <div className="bg-[#ffffff] rounded shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            {/* Header Section */}
            <div className="border-b border-[#eaeaea] pb-6 pt-6 px-8">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-4 min-w-[1098.75px]">
                  {/* Back Button */}
                  <div className="mb-4">
                    <MuiButton
                      onClick={handleBack}
                      variant="text"
                      className="flex items-center gap-2"
                      style={{
                        color: "#63666a",
                        fontFamily: "Roboto, sans-serif",
                        fontWeight: 400,
                        fontSize: "16px",
                        lineHeight: "24px",
                        textTransform: "none",
                        padding: "0",
                        minWidth: "auto",
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Requests</span>
                    </MuiButton>
                  </div>

                  {/* Title */}
                  <div>
                    <h1 className="font-['Roboto:Medium',_sans-serif] font-medium text-[24px] leading-[36px] text-[#1c1b1f] tracking-[0.25px]">
                      {request.requestId}
                    </h1>
                    <h2 className="font-['Roboto:Regular',_sans-serif] font-normal text-[18px] leading-[27px] text-[#1c1b1f] mt-2">
                      {request.subject}
                    </h2>
                  </div>

                  {/* Metadata Rows */}
                  <div className="flex gap-8 items-center">
                    <div className="flex gap-2 place-items-center">
                      <User className="h-4 w-4 text-[#63666a]" />

                      <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#63666a]">
                        Submitted By
                      </span>

                      <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#1c1b1f]">
                        {request.submittedBy}
                      </span>
                    </div>
                    <div className="flex grow">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#63666a]" />
                        <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#1c1b1f]">
                          {formatDateShort(request.submittedDate)}
                        </span>
                      </div>
                    </div>

                    {/* Status Split Button */}
                    <div className="flex-shrink-0">
                      <ButtonGroup
                        variant="contained"
                        ref={statusMenuAnchorRef}
                        aria-label="split button"
                        style={{
                          backgroundColor: (() => {
                            switch (request.status) {
                              case "New":
                                return "#1976d2";
                              case "In Progress":
                                return "#ed6c02";
                              case "Activated":
                                return "#2e7d32";
                              case "Declined":
                                return "#d32f2f";
                              case "Withdrawn":
                                return "#63666a";
                              default:
                                return "#65b230";
                            }
                          })(),
                          borderRadius: "100px",
                          overflow: "hidden",
                        }}
                      >
                        <MuiButton
                          onClick={handleStatusClick}
                          style={{
                            backgroundColor: (() => {
                              switch (request.status) {
                                case "New":
                                  return "#1976d2";
                                case "In Progress":
                                  return "#ed6c02";
                                case "Activated":
                                  return "#2e7d32";
                                case "Declined":
                                  return "#d32f2f";
                                case "Withdrawn":
                                  return "#63666a";
                                default:
                                  return "#65b230";
                              }
                            })(),
                            color: "white",
                            fontFamily: "Roboto, sans-serif",
                            fontWeight: 500,
                            fontSize: "14px",
                            lineHeight: "21px",
                            textTransform: "uppercase",
                            letterSpacing: "0.1px",
                            border: "none",
                            padding: "8px 16px",
                            minWidth: "120px",
                          }}
                        >
                          <span className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px] text-white">
                            {request.status}
                          </span>
                        </MuiButton>
                        <MuiButton
                          size="small"
                          onClick={handleStatusMenuToggle}
                          aria-controls={
                            statusMenuOpen ? "split-button-menu" : undefined
                          }
                          aria-expanded={statusMenuOpen ? "true" : undefined}
                          aria-label="select status"
                          aria-haspopup="menu"
                          style={{
                            backgroundColor: (() => {
                              switch (request.status) {
                                case "New":
                                  return "#1976d2";
                                case "In Progress":
                                  return "#ed6c02";
                                case "Activated":
                                  return "#2e7d32";
                                case "Declined":
                                  return "#d32f2f";
                                case "Withdrawn":
                                  return "#63666a";
                                default:
                                  return "#65b230";
                              }
                            })(),
                            color: "white",
                            border: "none",
                            padding: "8px 8px",
                            minWidth: "32px",
                          }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </MuiButton>
                      </ButtonGroup>
                      <Popper
                        sx={{
                          zIndex: 1,
                        }}
                        open={statusMenuOpen}
                        anchorEl={statusMenuAnchorRef.current}
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
                                onClickAway={handleStatusMenuClose}
                              >
                                <MenuList id="split-button-menu" autoFocusItem>
                                  {[
                                    "New",
                                    "In Progress",
                                    "Activated",
                                    "Declined",
                                    "Withdrawn",
                                  ].map((status) => (
                                    <MenuItem
                                      key={status}
                                      onClick={() =>
                                        handleStatusOptionClick(status)
                                      }
                                      selected={status === request.status}
                                      style={{
                                        fontFamily: "Roboto, sans-serif",
                                        fontWeight: 400,
                                        fontSize: "14px",
                                        lineHeight: "21px",
                                      }}
                                    >
                                      {getStatusBadge(status)}
                                    </MenuItem>
                                  ))}
                                </MenuList>
                              </ClickAwayListener>
                            </Paper>
                          </Grow>
                        )}
                      </Popper>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="pb-8 pt-8 px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Request Details - Editable Section */}
                  <div className="bg-[#ffffff] rounded border border-[#b9b9b9]">
                    <div className="border-b border-[#b9b9b9] px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-['Roboto:Medium',_sans-serif] font-medium text-[18px] leading-[27px] text-[#1c1b1f]">
                          Request Details
                        </h3>
                        {!editMode.isEditing ? (
                          <MuiButton
                            onClick={() =>
                              setEditMode((prev) => ({
                                ...prev,
                                isEditing: true,
                              }))
                            }
                            variant="contained"
                            className="flex items-center gap-2"
                            style={{
                              backgroundColor: "#65b230",
                              color: "white",
                              fontFamily: "Roboto, sans-serif",
                              fontWeight: 500,
                              fontSize: "14px",
                              lineHeight: "21px",
                              textTransform: "uppercase",
                              letterSpacing: "0.1px",
                              borderRadius: "100px",
                              height: "36px",
                              padding: "8px 12px",
                            }}
                          >
                            <Edit className="w-4 h-4 text-white" />
                            <span>Edit</span>
                          </MuiButton>
                        ) : (
                          <div className="flex space-x-2">
                            <MuiButton
                              onClick={() =>
                                setEditMode((prev) => ({
                                  ...prev,
                                  isEditing: false,
                                }))
                              }
                              variant="outlined"
                              style={{
                                borderColor: "#b9b9b9",
                                color: "#1c1b1f",
                                fontFamily: "Roboto, sans-serif",
                                fontWeight: 500,
                                fontSize: "14px",
                                lineHeight: "21px",
                                textTransform: "uppercase",
                                letterSpacing: "0.1px",
                                borderRadius: "100px",
                                height: "36px",
                                padding: "8px 12px",
                              }}
                            >
                              Cancel
                            </MuiButton>
                            <MuiButton
                              onClick={handleUpdateRequest}
                              disabled={
                                isUpdatingRequest ||
                                !editMode.subject.trim() ||
                                !editMode.description.trim() ||
                                !editMode.assignedTo.trim() ||
                                false
                              }
                              variant="contained"
                              style={{
                                backgroundColor: "#65b230",
                                color: "white",
                                fontFamily: "Roboto, sans-serif",
                                fontWeight: 500,
                                fontSize: "14px",
                                lineHeight: "21px",
                                textTransform: "uppercase",
                                letterSpacing: "0.1px",
                                borderRadius: "100px",
                                height: "36px",
                                padding: "8px 12px",
                              }}
                            >
                              {isUpdatingRequest
                                ? "Updating..."
                                : "Save Changes"}
                            </MuiButton>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      {editMode.isEditing ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <TextField
                                label="Subject *"
                                variant="outlined"
                                fullWidth
                                value={editMode.subject}
                                onChange={(e) =>
                                  setEditMode((prev) => ({
                                    ...prev,
                                    subject: e.target.value,
                                  }))
                                }
                                placeholder="Brief summary of the change"
                                InputProps={{
                                  style: {
                                    fontVariationSettings: "'wdth' 100",
                                  },
                                }}
                              />
                            </div>

                            <div>
                              <FormControl variant="outlined" fullWidth>
                                <InputLabel id="edit-request-type-label">
                                  Request Type *
                                </InputLabel>
                                <Select
                                  multiple
                                  labelId="edit-request-type-label"
                                  value={editMode.requestType}
                                  onChange={(e) =>
                                    setEditMode((prev) => ({
                                      ...prev,
                                      requestType: (typeof e.target.value ===
                                      "string"
                                        ? [e.target.value]
                                        : e.target.value) as (
                                        | "New Customer"
                                        | "New Item Pricing"
                                        | "Price Increase"
                                        | "Price Decrease"
                                        | "Expire Pricing"
                                      )[],
                                    }))
                                  }
                                  label="Request Type *"
                                  style={{
                                    fontVariationSettings: "'wdth' 100",
                                  }}
                                >
                                  <MenuItem value="New Customer">
                                    New Customer
                                  </MenuItem>
                                  <MenuItem value="New Item Pricing">
                                    New Item Pricing
                                  </MenuItem>
                                  <MenuItem value="Price Increase">
                                    Price Increase
                                  </MenuItem>
                                  <MenuItem value="Price Decrease">
                                    Price Decrease
                                  </MenuItem>
                                  <MenuItem value="Expire Pricing">
                                    Expire Pricing
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </div>

                            <div>
                              <FormControl variant="outlined" fullWidth>
                                <InputLabel id="edit-customer-label">
                                  Customer
                                </InputLabel>
                                <Select
                                  labelId="edit-customer-label"
                                  value={editMode.customerId}
                                  onChange={(e) => {
                                    const value = e.target.value as string;
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
                                          : value === "CUST-004"
                                          ? "Industrial Cleanup Ltd"
                                          : value === "CUST-005"
                                          ? "Environmental Services LLC"
                                          : value === "CUST-006"
                                          ? "Waste Management Corp"
                                          : value === "CUST-007"
                                          ? "Clean Energy Solutions"
                                          : "",
                                    }));
                                  }}
                                  label="Customer"
                                  style={{
                                    fontVariationSettings: "'wdth' 100",
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>No customer (Global request)</em>
                                  </MenuItem>
                                  <MenuItem value="CUST-001">
                                    Acme Corporation
                                  </MenuItem>
                                  <MenuItem value="CUST-002">
                                    Tech Solutions Inc
                                  </MenuItem>
                                  <MenuItem value="CUST-003">
                                    Utah State Agencies (Inactive)
                                  </MenuItem>
                                  <MenuItem value="CUST-004">
                                    Industrial Cleanup Ltd
                                  </MenuItem>
                                  <MenuItem value="CUST-005">
                                    Environmental Services LLC
                                  </MenuItem>
                                  <MenuItem value="CUST-006">
                                    Waste Management Corp (Inactive)
                                  </MenuItem>
                                  <MenuItem value="CUST-007">
                                    Clean Energy Solutions
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </div>

                            <div>
                              <FormControl variant="outlined" fullWidth>
                                <InputLabel id="edit-assigned-to-label">
                                  Assigned To *
                                </InputLabel>
                                <Select
                                  labelId="edit-assigned-to-label"
                                  value={editMode.assignedTo}
                                  onChange={(e) =>
                                    setEditMode((prev) => ({
                                      ...prev,
                                      assignedTo: e.target.value as string,
                                    }))
                                  }
                                  label="Assigned To *"
                                  style={{
                                    fontVariationSettings: "'wdth' 100",
                                  }}
                                >
                                  <MenuItem value="Sarah Johnson">
                                    Sarah Johnson
                                  </MenuItem>
                                  <MenuItem value="John Smith">
                                    John Smith
                                  </MenuItem>
                                  <MenuItem value="David Brown">
                                    David Brown
                                  </MenuItem>
                                  <MenuItem value="Mike Wilson">
                                    Mike Wilson
                                  </MenuItem>
                                  <MenuItem value="Michael Chen">
                                    Michael Chen
                                  </MenuItem>
                                  <MenuItem value="Lisa Davis">
                                    Lisa Davis
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </div>
                          </div>

                          <div>
                            <TextField
                              label="Description *"
                              variant="outlined"
                              fullWidth
                              multiline
                              rows={4}
                              value={editMode.description}
                              onChange={(e) =>
                                setEditMode((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder="Detailed explanation of the request and reasoning"
                              InputProps={{
                                style: {
                                  fontVariationSettings: "'wdth' 100",
                                },
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px] text-[#1c1b1f] mb-2 block">
                                Subject
                              </label>
                              <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#1c1b1f]">
                                {request.subject}
                              </p>
                            </div>
                            <div>
                              <label className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px] text-[#1c1b1f] mb-2 block">
                                Request Type
                              </label>
                              <div className="mt-1">
                                {request.requestType.map((type, index) => (
                                  <div key={index} className="mb-1">
                                    {getRequestTypeBadge(type)}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {(request.customerName ||
                              request.requestType.includes("New Customer")) && (
                              <div>
                                <label className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px] text-[#1c1b1f] mb-2 block">
                                  Customer
                                </label>
                                <div className="mt-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#1c1b1f]">
                                      {request.customerName}
                                    </span>
                                    <div className="bg-[rgba(101,178,48,0.1)] px-2 py-1 rounded-[50px]">
                                      <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[20px] text-[#1c1b1f]">
                                        {request.customerId}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div>
                              <label className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px] text-[#1c1b1f] mb-2 block">
                                Assigned To
                              </label>
                              <div className="mt-1 flex items-center space-x-2">
                                <User className="h-4 w-4 text-[#63666a]" />
                                <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#1c1b1f]">
                                  {request.assignedTo}
                                </span>
                                {request.assignedTo === "Sarah Johnson" && (
                                  <div className="bg-[#65b230] px-2 py-1 rounded-[50px]">
                                    <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[12px] leading-[20px] text-[#ffffff]">
                                      Me
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="font-['Roboto:Medium',_sans-serif] font-medium text-[14px] leading-[21px] text-[#1c1b1f] mb-2 block">
                              Description
                            </label>
                            <p className="font-['Roboto:Regular',_sans-serif] font-normal text-[16px] leading-[24px] text-[#63666a] whitespace-pre-wrap">
                              {request.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-[#ffffff] rounded border border-[#b9b9b9]">
                    <div className="border-b border-[#b9b9b9] px-6 py-4">
                      <h3 className="font-['Roboto:Medium',_sans-serif] font-medium text-[18px] leading-[27px] text-[#1c1b1f] flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <span>
                          Documents ({request.documents?.length || 0})
                        </span>
                      </h3>
                    </div>
                    <div className="p-6">
                      {/* Upload Section */}
                      <div
                        className="border-2 border-dashed rounded-lg p-8 text-center"
                        style={{
                          backgroundColor: "rgba(101, 178, 48, 0.05)",
                          borderColor: "#65b230",
                        }}
                      >
                        <Upload className="h-8 w-8 text-[#65b230] mx-auto mb-4" />
                        <p
                          className="text-base font-medium text-[#1c1b1f] mb-2"
                          style={{
                            fontFamily: "Roboto, sans-serif",
                            fontWeight: 500,
                            fontSize: "16px",
                            lineHeight: "24px",
                          }}
                        >
                          Drop your file(s) here or click to browse
                        </p>
                        <p
                          className="text-sm text-[#49454f] mb-4"
                          style={{
                            fontFamily: "Roboto, sans-serif",
                            fontWeight: 400,
                            fontSize: "14px",
                            lineHeight: "20px",
                          }}
                        >
                          Supported formats: .pdf, .xlsx, .xls, .csv
                        </p>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          disabled={isUploadingDocument}
                          className="hidden"
                          id="document-upload"
                          accept=".pdf,.xlsx,.xls,.csv"
                        />
                        <MuiButton
                          component="label"
                          htmlFor="document-upload"
                          variant="contained"
                          disabled={isUploadingDocument}
                          startIcon={<Upload className="h-4 w-4" />}
                          style={{
                            backgroundColor: "#65b230",
                            color: "white",
                            fontFamily: "Roboto, sans-serif",
                            fontWeight: 500,
                            fontSize: "14px",
                            lineHeight: "21px",
                            textTransform: "uppercase",
                            letterSpacing: "0.1px",
                            borderRadius: "100px",
                            padding: "8px 16px",
                            minWidth: "140px",
                          }}
                        >
                          {isUploadingDocument
                            ? "Uploading..."
                            : "Select Document"}
                        </MuiButton>
                      </div>

                      {/* Documents Data Grid */}
                      <div style={{ width: "100%", marginTop: "20px" }}>
                        <DataGrid
                          rows={
                            request.documents?.map((doc, index) => ({
                              id: doc.id,
                              name: doc.name,
                              type:
                                doc.type === "attachment"
                                  ? "Original"
                                  : "Uploaded",
                              uploadDate: formatDateShort(doc.uploadedAt),
                              actions: doc.id,
                            })) || []
                          }
                          columns={[
                            {
                              field: "name",
                              headerName: "Document Name",
                              flex: 1,
                              renderCell: (params) => (
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 text-[#65b230] mr-2" />
                                  <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#1c1b1f] truncate">
                                    {params.value}
                                  </span>
                                </div>
                              ),
                            },
                            {
                              field: "type",
                              headerName: "Request Type",
                              flex: 0.5,
                              renderCell: (params) => (
                                <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#49454f]">
                                  {params.value}
                                </span>
                              ),
                            },
                            {
                              field: "uploadDate",
                              headerName: "Upload Date",
                              flex: 0.5,
                              renderCell: (params) => (
                                <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#49454f]">
                                  {params.value}
                                </span>
                              ),
                            },
                            {
                              field: "actions",
                              headerName: "Actions",
                              flex: 0.5,
                              sortable: false,
                              renderCell: (params) => (
                                <div className="flex items-center space-x-2">
                                  <MuiButton
                                    variant="text"
                                    size="small"
                                    style={{
                                      color: "#49454f",
                                      minWidth: "auto",
                                      padding: "4px",
                                    }}
                                  >
                                    <Download className="h-4 w-4" />
                                  </MuiButton>
                                  <MuiButton
                                    variant="text"
                                    size="small"
                                    style={{
                                      color: "#49454f",
                                      minWidth: "auto",
                                      padding: "4px",
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </MuiButton>
                                </div>
                              ),
                            },
                          ]}
                          getRowId={(row) => row.id}
                          autoHeight={true}
                          density="standard"
                          sx={{
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
                            "& .MuiDataGrid-row:hover": {
                              backgroundColor: "#f5f5f5",
                            },
                            border: "1px solid #b9b9b9",
                            borderRadius: "4px",
                          }}
                          disableRowSelectionOnClick={true}
                          disableColumnMenu={true}
                          slots={{
                            noRowsOverlay: () => (
                              <div className="flex items-center justify-center h-32">
                                <span className="font-['Roboto:Regular',_sans-serif] font-normal text-[14px] leading-[20px] text-[#bdbdbd] italic">
                                  No records to display.
                                </span>
                              </div>
                            ),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="lg:col-span-1">
                  <div className="bg-[#ffffff] rounded border border-[#b9b9b9]">
                    <div className="border-b border-[#b9b9b9] px-6 py-4">
                      <h3 className="font-['Roboto:Medium',_sans-serif] font-medium text-[18px] leading-[27px] text-[#1c1b1f] flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>Notes</span>
                      </h3>
                    </div>
                    <div className="p-6">
                      {/* Add Note Section */}
                      <div className="mb-6 pb-4 border-b">
                        <TextField
                          placeholder="Add a note..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          multiline
                          rows={3}
                          variant="outlined"
                          fullWidth
                          className="mb-3"
                          InputProps={{
                            style: {
                              fontVariationSettings: "'wdth' 100",
                            },
                          }}
                        />
                        <MuiButton
                          onClick={handleAddNote}
                          disabled={!newNote.trim() || isAddingNote}
                          variant="contained"
                          fullWidth
                          className="flex items-center space-x-2"
                          style={{
                            backgroundColor:
                              !newNote.trim() || isAddingNote
                                ? "#cccccc"
                                : "#65b230",
                            color: "white",
                            fontFamily: "Roboto, sans-serif",
                            fontWeight: 500,
                            fontSize: "14px",
                            lineHeight: "21px",
                            textTransform: "uppercase",
                            letterSpacing: "0.1px",
                            cursor:
                              !newNote.trim() || isAddingNote
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          <span>{isAddingNote ? "Adding..." : "Add Note"}</span>
                        </MuiButton>
                      </div>

                      {/* Notes List */}
                      <div className="space-y-4">
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
                            <p className="text-gray-500 text-sm">
                              No notes yet
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              Be the first to add a note
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Dialog
        open={statusUpdateModal.isOpen}
        onClose={() =>
          setStatusUpdateModal((prev) => ({ ...prev, isOpen: false }))
        }
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "8px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle
          style={{
            fontFamily: "Roboto, sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "24px",
            color: "#1c1b1f",
            padding: "24px 24px 8px 24px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          Update Request Status
        </DialogTitle>
        <DialogContent style={{ padding: "24px" }}>
          <p
            style={{
              fontFamily: "Roboto, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#666666",
              marginBottom: "24px",
            }}
          >
            Update the status of this price change request and add any relevant
            notes.
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div>
              <FormControl variant="outlined" fullWidth>
                <InputLabel
                  id="status-update-label"
                  style={{
                    fontFamily: "Roboto, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                  }}
                >
                  New Status
                </InputLabel>
                <Select
                  labelId="status-update-label"
                  value={statusUpdateModal.newStatus}
                  onChange={(e) =>
                    setStatusUpdateModal((prev) => ({
                      ...prev,
                      newStatus: e.target.value as string,
                    }))
                  }
                  label="New Status"
                  style={{
                    fontVariationSettings: "'wdth' 100",
                    fontFamily: "Roboto, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                  }}
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Activated">Activated</MenuItem>
                  <MenuItem value="Declined">Declined</MenuItem>
                  <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div>
              <TextField
                label="Notes (Optional)"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                placeholder="Add notes about this status change..."
                value={statusUpdateModal.notes}
                onChange={(e) =>
                  setStatusUpdateModal((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                InputProps={{
                  style: {
                    fontVariationSettings: "'wdth' 100",
                    fontFamily: "Roboto, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                  },
                }}
                InputLabelProps={{
                  style: {
                    fontFamily: "Roboto, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            padding: "16px 24px 24px 24px",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <MuiButton
            onClick={() =>
              setStatusUpdateModal({
                isOpen: false,
                newStatus: "",
                notes: "",
              })
            }
            variant="outlined"
            style={{
              borderColor: "#65b230",
              color: "#65b230",
              fontFamily: "Roboto, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "21px",
              textTransform: "uppercase",
              letterSpacing: "0.1px",
              borderRadius: "100px",
              padding: "8px 16px",
              minWidth: "80px",
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleStatusUpdate}
            disabled={isUpdatingStatus}
            variant="contained"
            style={{
              backgroundColor: "#65b230",
              color: "white",
              fontFamily: "Roboto, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "21px",
              textTransform: "uppercase",
              letterSpacing: "0.1px",
              borderRadius: "100px",
              padding: "8px 16px",
              minWidth: "120px",
            }}
          >
            {isUpdatingStatus ? "Updating..." : "Update Status"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
