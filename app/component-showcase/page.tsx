"use client";

import React, { useState, useMemo } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Button,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Edit,
  Plus,
  Upload,
  Download,
  X,
} from "lucide-react";

// Mock data for showcasing different states
const showcaseData = [
  {
    id: "normal-1",
    productName: "Steel Scrap",
    unitPrice: 150.0,
    minimumPrice: 75.0,
    uom: "Ton",
    containerSize: "20ft",
    projectName: "Construction Project A",
    profileId: "PROF-001",
    effectiveDate: "2024-01-15",
    expirationDate: "2024-12-31",
    status: "normal",
    description: "High quality steel scrap",
    altDescription: "Premium grade steel",
  },
  {
    id: "new-1",
    productName: "",
    unitPrice: 0,
    minimumPrice: 0,
    uom: "",
    containerSize: "",
    projectName: "",
    profileId: "",
    effectiveDate: "2024-01-15",
    expirationDate: "2024-12-31",
    status: "new",
    description: "",
    altDescription: "",
    isNewEntry: true,
  },
  {
    id: "edited-1",
    productName: "Aluminum Cans",
    unitPrice: 25.5,
    minimumPrice: 12.75,
    uom: "Pound",
    containerSize: "10ft",
    projectName: "Recycling Initiative",
    profileId: "PROF-002",
    effectiveDate: "2024-02-01",
    expirationDate: "2024-12-31",
    status: "edited",
    description: "Clean aluminum cans",
    altDescription: "Sorted aluminum",
    isModified: true,
  },
  {
    id: "error-1",
    productName: "Invalid Product",
    unitPrice: -50.0,
    minimumPrice: -25.0,
    uom: "InvalidUOM",
    containerSize: "",
    projectName: "",
    profileId: "",
    effectiveDate: "2024-03-01",
    expirationDate: "2024-12-31",
    status: "error",
    description: "This row has multiple errors",
    altDescription: "Error demonstration",
  },
  {
    id: "mixed-1",
    productName: "Mixed State Product",
    unitPrice: 200.0,
    minimumPrice: 0,
    uom: "Each",
    containerSize: "",
    projectName: "Test Project",
    profileId: "",
    effectiveDate: "2024-04-01",
    expirationDate: "2024-12-31",
    status: "mixed",
    description: "Some fields valid, some missing",
    altDescription: "Mixed validation state",
    isModified: true,
  },
];

export default function DataGridShowcase() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Array<{
      rowId: string;
      field: string;
      message: string;
      value?: any;
    }>
  >([
    // Pre-populate with some validation errors for demonstration
    {
      rowId: "error-1",
      field: "unitPrice",
      message:
        "Unit Price must be a positive number greater than or equal to 0.",
      value: -50.0,
    },
    {
      rowId: "error-1",
      field: "minimumPrice",
      message:
        "Minimum Price must be a positive number greater than or equal to 0.",
      value: -25.0,
    },
    {
      rowId: "error-1",
      field: "uom",
      message:
        "Invalid Unit of Measure. Must be one of: Each, Gallon, Pound, Container, Ton.",
      value: "InvalidUOM",
    },
    {
      rowId: "error-1",
      field: "containerSize",
      message: "Container Size is required and cannot be empty.",
      value: "",
    },
    {
      rowId: "error-1",
      field: "projectName",
      message: "Project Name is required and cannot be empty.",
      value: "",
    },
    {
      rowId: "error-1",
      field: "profileId",
      message: "Profile ID is required and cannot be empty.",
      value: "",
    },
    {
      rowId: "mixed-1",
      field: "minimumPrice",
      message:
        "Minimum Price must be a positive number greater than or equal to 0.",
      value: 0,
    },
    {
      rowId: "mixed-1",
      field: "containerSize",
      message: "Container Size is required and cannot be empty.",
      value: "",
    },
    {
      rowId: "mixed-1",
      field: "profileId",
      message: "Profile ID is required and cannot be empty.",
      value: "",
    },
  ]);

  // Excel upload state for demonstration
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelUploadStatus, setExcelUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [excelUploadError, setExcelUploadError] = useState<string>("");
  const [excelValidationErrors, setExcelValidationErrors] = useState<
    Array<{ row: number; column: string; message: string; value?: any }>
  >([]);

  // Helper functions
  const getCellValidationError = (rowId: string, field: string) => {
    return validationErrors.find(
      (error) => error.rowId === rowId && error.field === field
    );
  };

  const isRequiredField = (field: string) => {
    const requiredFields = [
      "productName",
      "unitPrice",
      "minimumPrice",
      "uom",
      "containerSize",
      "projectName",
      "profileId",
    ];
    return requiredFields.includes(field);
  };

  const isCellEmpty = (rowData: any, field: string) => {
    const value = rowData[field];
    return value === undefined || value === null || value === "" || value === 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Generate user-friendly error messages
  const getErrorMessage = (field: string, value: any) => {
    const fieldNames: Record<string, string> = {
      productName: "Product Name",
      unitPrice: "Unit Price",
      minimumPrice: "Minimum Price",
      uom: "Unit of Measure",
      containerSize: "Container Size",
      projectName: "Project Name",
      profileId: "Profile ID",
    };

    const fieldName = fieldNames[field] || field;

    if (value === "" || value === null || value === undefined) {
      return `${fieldName} is required and cannot be empty.`;
    }

    if (field === "unitPrice" || field === "minimumPrice") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        return `${fieldName} must be a positive number greater than or equal to 0.`;
      }
    }

    if (field === "uom") {
      const validUOMs = ["Each", "Gallon", "Pound", "Container", "Ton"];
      if (!validUOMs.includes(value)) {
        return `${fieldName} must be one of: ${validUOMs.join(", ")}.`;
      }
    }

    return `${fieldName} has an invalid value.`;
  };

  // Generate user-friendly required field messages
  const getRequiredMessage = (field: string) => {
    const fieldNames: Record<string, string> = {
      productName: "Product Name",
      unitPrice: "Unit Price",
      minimumPrice: "Minimum Price",
      uom: "Unit of Measure",
      containerSize: "Container Size",
      projectName: "Project Name",
      profileId: "Profile ID",
    };

    const fieldName = fieldNames[field] || field;
    return `${fieldName} is required. Please enter a value.`;
  };

  // Excel upload handler for demonstration
  const handleExcelFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Reset previous errors
    setExcelUploadError("");
    setExcelValidationErrors([]);
    setExcelUploadStatus("idle");

    if (!file) {
      return;
    }

    // File type validation
    if (
      file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      file.type !== "application/vnd.ms-excel"
    ) {
      setExcelUploadError(
        "Invalid file type. Please upload a valid Excel file (.xlsx or .xls)"
      );
      setExcelUploadStatus("error");
      return;
    }

    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setExcelUploadError(
        "File size too large. Please upload a file smaller than 10MB"
      );
      setExcelUploadStatus("error");
      return;
    }

    setExcelUploadStatus("uploading");
    setExcelFile(file);

    try {
      // Simulate file processing and validation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate various failure scenarios for demonstration
      const failureScenarios = [
        {
          name: "Missing Required Columns",
          error:
            "Your Excel file is missing required columns. Please ensure your file includes all of the following columns: Customer ID, Product Name, Unit Price, Minimum Price, UOM, Generator State, Effective Date, and Notes. Download the template below to see the correct format.",
          validationErrors: [
            {
              row: 1,
              column: "Customer ID",
              message:
                "Required column 'Customer ID' is missing from your file",
              value: null,
            },
            {
              row: 1,
              column: "Product Name",
              message:
                "Required column 'Product Name' is missing from your file",
              value: null,
            },
            {
              row: 1,
              column: "Unit Price",
              message: "Required column 'Unit Price' is missing from your file",
              value: null,
            },
          ],
        },
        {
          name: "Invalid Data Format",
          error:
            "Your Excel file contains invalid data formats. Please check the following issues and correct them: Unit Price must be a number (e.g., 10.50), Effective Date must be in YYYY-MM-DD format (e.g., 2024-01-15), and all required fields must contain valid data.",
          validationErrors: [
            {
              row: 3,
              column: "Unit Price",
              message:
                "Invalid price format. Unit Price must be a number (e.g., 10.50, 25.00). Remove any currency symbols or text.",
              value: "invalid_price",
            },
            {
              row: 5,
              column: "Effective Date",
              message:
                "Invalid date format. Effective Date must be in YYYY-MM-DD format (e.g., 2024-01-15).",
              value: "01/32/2024",
            },
          ],
        },
        {
          name: "Empty Required Fields",
          error:
            "Your Excel file contains empty required fields. All rows must have values for Customer ID, Product Name, Unit Price, and Minimum Price. Please fill in the missing data and try uploading again.",
          validationErrors: [
            {
              row: 4,
              column: "Product Name",
              message:
                "Product Name is required but is empty. Please enter a product name (e.g., 'Steel Scrap', 'Aluminum Cans').",
              value: "",
            },
            {
              row: 6,
              column: "Customer ID",
              message:
                "Customer ID is required but is empty. Please enter a valid customer ID (e.g., 'CUST-001', 'CUST-002').",
              value: "",
            },
          ],
        },
      ];

      // Randomly select a failure scenario for demonstration
      const selectedScenario =
        failureScenarios[Math.floor(Math.random() * failureScenarios.length)];

      setExcelUploadError(selectedScenario.error);
      setExcelValidationErrors(selectedScenario.validationErrors);
      setExcelUploadStatus("error");
    } catch (error) {
      setExcelUploadError(
        "An unexpected error occurred while processing your file. Please try again."
      );
      setExcelUploadStatus("error");
    }
  };

  const handleClearExcelFile = () => {
    setExcelFile(null);
    setExcelUploadStatus("idle");
    setExcelUploadError("");
    setExcelValidationErrors([]);
  };

  // Reusable cell component with tooltip and overflow handling
  const renderCellWithValidation = (
    params: any,
    field: string,
    displayValue: string,
    isModified: boolean = false
  ) => {
    const cellError = getCellValidationError(params.row.id, field);
    const isRequired = isRequiredField(field);
    const isEmpty = isCellEmpty(params.row, field);
    const isNewRow = params.row.isNewEntry;

    const hasError = !!cellError;
    const isRequiredAndEmpty = isRequired && isEmpty && isNewRow;

    let backgroundColor = "transparent";
    let borderStyle = "2px solid transparent";

    if (hasError) {
      backgroundColor = "rgba(211,47,47,0.1)";
      borderStyle = "2px solid #d32f2f";
    } else if (isRequiredAndEmpty) {
      backgroundColor = "rgba(255,152,0,0.08)";
      borderStyle = "2px dashed #ff9800";
    }

    const errorMessage = hasError
      ? getErrorMessage(field, params.row[field])
      : null;
    const requiredMessage = isRequiredAndEmpty
      ? getRequiredMessage(field)
      : null;
    const tooltipMessage = errorMessage || requiredMessage;

    return (
      <Tooltip
        title={tooltipMessage || ""}
        arrow
        placement="top"
        disableHoverListener={!tooltipMessage}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            width: "100%",
            height: "100%",
            backgroundColor,
            border: borderStyle,
            borderRadius: 1,
            padding: "4px 6px",
            position: "relative",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontWeight: isModified ? "bold" : "normal",
              color: cellError
                ? "#d32f2f"
                : isRequiredAndEmpty
                ? "#ff9800"
                : isModified
                ? "#1c1b1f"
                : "inherit",
              fontStyle: isRequiredAndEmpty ? "italic" : "normal",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayValue || (isRequiredAndEmpty ? "Required" : "")}
          </div>
          {cellError && (
            <AlertCircle
              size={14}
              color="#d32f2f"
              style={{
                flexShrink: 0,
              }}
            />
          )}
          {isRequiredAndEmpty && !cellError && (
            <AlertTriangle
              size={14}
              color="#ff9800"
              style={{
                flexShrink: 0,
              }}
            />
          )}
        </Box>
      </Tooltip>
    );
  };

  // Column definitions with enhanced rendering
  const columns: GridColDef[] = [
    {
      field: "selection",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const hasValidationError = validationErrors.some(
          (error) => error.rowId === params.row.id
        );
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <input
              type="checkbox"
              checked={selectedRows.includes(params.row.id)}
              onChange={(event) => {
                if (event.target.checked) {
                  setSelectedRows((prev) => [...prev, params.row.id]);
                } else {
                  setSelectedRows((prev) =>
                    prev.filter((id) => id !== params.row.id)
                  );
                }
              }}
              style={{
                accentColor: hasValidationError ? "#d32f2f" : "#65b230",
              }}
            />
            {hasValidationError && (
              <AlertCircle
                size={16}
                color="#d32f2f"
                style={{
                  marginLeft: 4,
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: "productName",
      headerName: "Item",
      width: 120,
      flex: 0,
      minWidth: 100,
      renderCell: (params: any) => {
        return renderCellWithValidation(
          params,
          "productName",
          params.value,
          params.row.isModified
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      width: 150,
      flex: 1,
      minWidth: 120,
      renderCell: (params: any) => {
        const isModified = params.row.isModified;
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
      field: "altDescription",
      headerName: "Alt Description",
      width: 150,
      flex: 1,
      minWidth: 120,
      renderCell: (params: any) => {
        const isModified = params.row.isModified;
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
      renderCell: (params: any) => {
        const price = formatCurrency(params.row.unitPrice);
        return renderCellWithValidation(
          params,
          "unitPrice",
          price,
          params.row.isModified
        );
      },
    },
    {
      field: "minimumPrice",
      headerName: "Min Price",
      width: 120,
      flex: 0,
      minWidth: 100,
      renderCell: (params: any) => {
        const price = formatCurrency(params.row.minimumPrice);
        return renderCellWithValidation(
          params,
          "minimumPrice",
          price,
          params.row.isModified
        );
      },
    },
    {
      field: "uom",
      headerName: "UOM",
      width: 100,
      flex: 0,
      minWidth: 80,
      renderCell: (params: any) => {
        return renderCellWithValidation(
          params,
          "uom",
          params.value,
          params.row.isModified
        );
      },
    },
    {
      field: "containerSize",
      headerName: "Container",
      width: 100,
      flex: 0,
      minWidth: 80,
      renderCell: (params: any) => {
        return renderCellWithValidation(
          params,
          "containerSize",
          params.value,
          params.row.isModified
        );
      },
    },
    {
      field: "projectName",
      headerName: "Project",
      width: 150,
      flex: 1,
      minWidth: 120,
      renderCell: (params: any) => {
        return renderCellWithValidation(
          params,
          "projectName",
          params.value,
          params.row.isModified
        );
      },
    },
    {
      field: "profileId",
      headerName: "Profile ID",
      width: 120,
      flex: 0,
      minWidth: 100,
      renderCell: (params: any) => {
        return renderCellWithValidation(
          params,
          "profileId",
          params.value,
          params.row.isModified
        );
      },
    },
    {
      field: "effectiveDate",
      headerName: "Effective",
      width: 120,
      flex: 0,
      minWidth: 100,
      renderCell: (params: any) => {
        const isModified = params.row.isModified;
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
      field: "expirationDate",
      headerName: "Expires",
      width: 120,
      flex: 0,
      minWidth: 100,
      renderCell: (params: any) => {
        const isModified = params.row.isModified;
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
  ];

  // Row styling function
  const getRowClassName = (params: any) => {
    const hasValidationError = validationErrors.some(
      (error) => error.rowId === params.row.id
    );
    if (hasValidationError) {
      return "validation-error-row";
    }
    if (params.row.isNewEntry) {
      return "new-row";
    }
    if (params.row.isModified) {
      return "modified-row";
    }
    return "";
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: "1400px",
        margin: "0 auto",
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{ mb: 2, fontWeight: 700, color: "#1a1a1a" }}
        >
          Component Documentation
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            color: "#666",
            fontWeight: 400,
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          Showcase of UI components, validation patterns, and error handling
          systems
        </Typography>
      </Box>

      {/* Interactive DataGrid Demo */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: 600, color: "#1a1a1a" }}
          >
            📊 DataGrid Component with Error Summary
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, color: "#666", lineHeight: 1.6 }}
          >
            Below is a live DataGrid showcasing all the different visual states.
            Hover over cells to see tooltips, observe the different row
            highlighting patterns, and notice how validation errors are
            displayed with clear visual indicators.
          </Typography>

          {/* Documentation Callout */}
          <Box
            sx={{
              mb: 3,
              p: 3,
              backgroundColor: "#f8f9fa",
              borderRadius: 2,
              border: "1px solid #e9ecef",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -8,
                left: 16,
                backgroundColor: "#fff",
                px: 1,
                fontSize: "12px",
                fontWeight: 600,
                color: "#495057",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              📋 Documentation
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#666", fontStyle: "italic" }}
            >
              The error summary below appears directly above the DataGrid to
              clearly indicate validation errors that prevent saving or
              submitting the form. Users can immediately see which lines need
              attention.
            </Typography>
          </Box>

          {/* Error Summary - Positioned Above Grid */}
          {validationErrors.length > 0 ? (
            <Box
              sx={{
                mb: 4,
                display: "flex",
                alignItems: "center",
                gap: 1,
                padding: 2,
                backgroundColor: "#fef2f2",
                borderRadius: 1,
                border: "1px solid #fecaca",
              }}
            >
              <AlertCircle size={20} color="#d32f2f" />
              <Typography variant="body1" sx={{ color: "#d32f2f" }}>
                {(() => {
                  const uniqueRowIds = [
                    ...new Set(validationErrors.map((error) => error.rowId)),
                  ];
                  const rowNumbers = uniqueRowIds
                    .map((rowId) => {
                      const rowIndex = showcaseData.findIndex(
                        (row) => row.id === rowId
                      );
                      return rowIndex + 1; // Convert to 1-based line numbers
                    })
                    .sort((a, b) => a - b);

                  return (
                    <span>
                      Please resolve {rowNumbers.length} line
                      {rowNumbers.length !== 1 ? "s" : ""} with validation
                      errors: Lines {rowNumbers.join(", ")}
                    </span>
                  );
                })()}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                mb: 4,
                display: "flex",
                alignItems: "center",
                gap: 1,
                padding: 2,
                backgroundColor: "#f0f9ff",
                borderRadius: 1,
                border: "1px solid #bae6fd",
              }}
            >
              <CheckCircle size={20} color="#059669" />
              <Typography variant="body1" sx={{ color: "#059669" }}>
                No validation errors found. Ready to save.
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              mb: 3,
              p: 3,
              backgroundColor: "#f8f9fa",
              borderRadius: 2,
              border: "1px solid #e9ecef",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#495057" }}
            >
              💡 Key Features to Observe:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 3, color: "#6c757d" }}>
              <li>
                <strong>Tooltips:</strong> Hover over cells with errors or
                required fields to see detailed messages
              </li>
              <li>
                <strong>Row Highlighting:</strong> Different border colors
                indicate row states (green=new, orange=modified, red=error)
              </li>
              <li>
                <strong>Cell Validation:</strong> Red borders and error icons
                show validation errors
              </li>
              <li>
                <strong>Required Fields:</strong> Orange dashed borders with
                warning icons for empty required fields
              </li>
              <li>
                <strong>Text Formatting:</strong> Bold text indicates modified
                values
              </li>
            </Box>
          </Box>

          {/* DataGrid Visual States Legend */}
          <Box
            sx={{
              mb: 3,
              p: 3,
              backgroundColor: "#fff",
              borderRadius: 2,
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 3, fontWeight: 600, color: "#1a1a1a" }}
            >
              🎨 DataGrid Visual States Legend
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 2,
              }}
            >
              {/* Row States */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: 600, color: "#495057" }}
                >
                  Row States:
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">Normal Row</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#e8f5e8",
                        border: "2px solid #65b230",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">New Row</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#fff3e0",
                        border: "2px solid #ff9800",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">Modified Row</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#fef2f2",
                        border: "2px solid #d32f2f",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">Error Row</Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Cell States */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: 600, color: "#495057" }}
                >
                  Cell States:
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "rgba(255,152,0,0.08)",
                        border: "2px dashed #ff9800",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">Required Field</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "rgba(211,47,47,0.1)",
                        border: "2px solid #d32f2f",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2">Invalid Field</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: "bold", fontSize: "10px" }}
                      >
                        B
                      </Typography>
                    </Box>
                    <Typography variant="body2">Modified Value</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          backgroundColor: "#d32f2f",
                          borderRadius: "50%",
                          animation: "pulse 2s infinite",
                        }}
                      />
                    </Box>
                    <Typography variant="body2">Error Icon</Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Interactive Elements */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: 600, color: "#495057" }}
                >
                  Interactive Elements:
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#ff9800", fontSize: "12px" }}
                      >
                        ⚠
                      </Typography>
                    </Box>
                    <Typography variant="body2">Warning Icon</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#d32f2f", fontSize: "12px" }}
                      >
                        ⚠
                      </Typography>
                    </Box>
                    <Typography variant="body2">Error Icon</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#666",
                          fontSize: "10px",
                          fontStyle: "italic",
                        }}
                      >
                        ?
                      </Typography>
                    </Box>
                    <Typography variant="body2">Tooltip Available</Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* DataGrid */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={showcaseData}
            columns={columns}
            getRowId={(row) => row.id}
            density="comfortable"
            disableRowSelectionOnClick={true}
            getRowClassName={getRowClassName}
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #e0e0e0",
                borderRight: "1px solid #e0e0e0",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                borderBottom: "2px solid #e0e0e0",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f9f9f9",
              },
              // CSS animations
              "@keyframes spin": {
                "0%": {
                  transform: "rotate(0deg)",
                },
                "100%": {
                  transform: "rotate(360deg)",
                },
              },
              "@keyframes pulse": {
                "0%, 100%": {
                  opacity: 1,
                },
                "50%": {
                  opacity: 0.5,
                },
              },
              // New row styling
              "& .new-row": {
                backgroundColor: "#e8f5e8",
                borderLeft: "4px solid #65b230",
                "&:hover": {
                  backgroundColor: "#d4edda",
                },
              },
              // Modified row styling
              "& .modified-row": {
                backgroundColor: "#fff3e0",
                borderLeft: "4px solid #ff9800",
                "&:hover": {
                  backgroundColor: "#ffe0b2",
                },
              },
              // Validation error row styling
              "& .validation-error-row": {
                backgroundColor: "#fef2f2",
                borderLeft: "6px solid #d32f2f",
                borderRight: "2px solid #fecaca",
                "&:hover": {
                  backgroundColor: "#fee2e2",
                  borderLeft: "6px solid #b71c1c",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #fecaca",
                  borderRight: "1px solid #fecaca",
                },
                "& .MuiDataGrid-cell:first-of-type": {
                  borderLeft: "none",
                },
                "& .MuiDataGrid-cell:last-of-type": {
                  borderRight: "none",
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Excel Upload Error Demonstration */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: 600, color: "#1a1a1a" }}
          >
            📤 Excel Upload Component
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, color: "#666", lineHeight: 1.6 }}
          >
            The Excel upload system provides comprehensive error handling with
            descriptive messages, file validation, and detailed feedback about
            data issues. Try uploading a file to see the different error
            scenarios in action.
          </Typography>

          <Box
            sx={{
              mb: 4,
              p: 3,
              backgroundColor: "#f8f9fa",
              borderRadius: 2,
              border: "1px solid #e9ecef",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#495057" }}
            >
              🔍 Error Scenarios Demonstrated:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 3, color: "#6c757d" }}>
              <li>
                <strong>Missing Columns:</strong> Shows if required columns are
                missing from the Excel file
              </li>
              <li>
                <strong>Invalid Data Format:</strong> Demonstrates format
                validation for prices, dates, and other fields
              </li>
              <li>
                <strong>Empty Required Fields:</strong> Highlights rows with
                missing required data
              </li>
              <li>
                <strong>File Validation:</strong> Checks file type, size, and
                basic structure
              </li>
            </Box>
          </Box>

          {/* Download Template Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Download size={16} />}
              sx={{
                borderColor: "#65b230",
                color: "#65b230",
                "&:hover": {
                  borderColor: "#4a8c1f",
                  backgroundColor: "rgba(101,178,48,0.04)",
                },
              }}
            >
              Download Example Template
            </Button>
          </Box>

          {/* File Upload Area */}
          <Box sx={{ mb: 2 }}>
            <input
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              id="excel-file-upload-showcase"
              type="file"
              onChange={handleExcelFileUpload}
            />
            <label htmlFor="excel-file-upload-showcase">
              <Card
                sx={{
                  cursor:
                    excelUploadStatus === "uploading"
                      ? "not-allowed"
                      : "pointer",
                  border:
                    excelUploadStatus === "error"
                      ? "2px solid #d32f2f"
                      : excelUploadStatus === "success"
                      ? "2px solid #65b230"
                      : excelFile
                      ? "2px solid #65b230"
                      : "2px dashed #e0e0e0",
                  backgroundColor:
                    excelUploadStatus === "error"
                      ? "rgba(211,47,47,0.04)"
                      : excelUploadStatus === "success"
                      ? "rgba(101,178,48,0.08)"
                      : excelFile
                      ? "rgba(101,178,48,0.08)"
                      : "transparent",
                  "&:hover": {
                    borderColor:
                      excelUploadStatus === "uploading"
                        ? "#e0e0e0"
                        : excelUploadStatus === "error"
                        ? "#d32f2f"
                        : excelUploadStatus === "success"
                        ? "#65b230"
                        : excelFile
                        ? "#65b230"
                        : "#65b230",
                    backgroundColor:
                      excelUploadStatus === "uploading"
                        ? "transparent"
                        : excelUploadStatus === "error"
                        ? "rgba(211,47,47,0.08)"
                        : excelUploadStatus === "success"
                        ? "rgba(101,178,48,0.12)"
                        : excelFile
                        ? "rgba(101,178,48,0.12)"
                        : "rgba(101,178,48,0.04)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {excelUploadStatus === "uploading" ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            border: "2px solid #65b230",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        <Typography variant="body2" sx={{ color: "#65b230" }}>
                          Processing file...
                        </Typography>
                      </Box>
                    ) : excelUploadStatus === "success" ? (
                      <CheckCircle size={24} color="#65b230" />
                    ) : excelUploadStatus === "error" ? (
                      <AlertCircle size={24} color="#d32f2f" />
                    ) : (
                      <Upload
                        size={24}
                        color={excelFile ? "#65b230" : "#666"}
                      />
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        color:
                          excelUploadStatus === "error"
                            ? "#d32f2f"
                            : excelUploadStatus === "success"
                            ? "#65b230"
                            : excelFile
                            ? "#65b230"
                            : "#666",
                        fontWeight: 500,
                      }}
                    >
                      {excelUploadStatus === "uploading"
                        ? "Processing your file..."
                        : excelUploadStatus === "success"
                        ? "File uploaded successfully!"
                        : excelUploadStatus === "error"
                        ? "Upload failed - see errors below"
                        : excelFile
                        ? excelFile.name
                        : "Click to upload Excel file or drag and drop"}
                    </Typography>
                    {excelFile && excelUploadStatus !== "uploading" && (
                      <Button
                        size="small"
                        startIcon={<X size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearExcelFile();
                        }}
                        sx={{
                          color: "#666",
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.04)",
                          },
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </label>
          </Box>

          {/* Error Display */}
          {excelUploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Upload Failed</AlertTitle>
              {excelUploadError}
            </Alert>
          )}

          {/* Validation Errors Display */}
          {excelValidationErrors.length > 0 && (
            <Card
              sx={{
                mb: 2,
                border: "1px solid #ff9800",
                backgroundColor: "rgba(255,152,0,0.04)",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <AlertTriangle size={20} color="#ff9800" />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#e65100", fontWeight: 600 }}
                  >
                    Validation Errors ({excelValidationErrors.length})
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: "200px", overflowY: "auto" }}>
                  {excelValidationErrors.map((error, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        mb: 1,
                        backgroundColor: "rgba(255,152,0,0.08)",
                        border: "1px solid rgba(255,152,0,0.2)",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "#e65100", mb: 0.5 }}
                      >
                        Row {error.row} • Column: {error.column}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#1c1b1f" }}>
                        {error.message}
                      </Typography>
                      {error.value !== null && error.value !== undefined && (
                        <Typography
                          variant="caption"
                          sx={{ color: "#666", fontStyle: "italic" }}
                        >
                          Value: "{error.value}"
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
