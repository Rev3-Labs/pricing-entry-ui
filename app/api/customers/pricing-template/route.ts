import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Create sample data for the template
    const templateData = [
      {
        "Header Name": "Standard Pricing 2024",
        Description: "Standard pricing for customer services",
        "Effective Date": "2024-01-01",
        "Expiration Date": "2024-12-31",
        Status: "active",
        "Invoice Minimum": 500.0,
        "Container 55G Minimum": 200.0,
        "Absolute Container Minimum": 100.0,
      },
      {
        "Header Name": "Special Project Pricing",
        Description: "Special pricing for environmental cleanup project",
        "Effective Date": "2024-02-01",
        "Expiration Date": "2024-12-31",
        Status: "active",
        "Invoice Minimum": 750.0,
        "Container 55G Minimum": 300.0,
        "Absolute Container Minimum": 150.0,
      },
      {
        "Header Name": "Draft Pricing Q2",
        Description: "Draft pricing for Q2 2024",
        "Effective Date": "2024-04-01",
        "Expiration Date": "2024-06-30",
        Status: "draft",
        "Invoice Minimum": 600.0,
        "Container 55G Minimum": 250.0,
        "Absolute Container Minimum": 120.0,
      },
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Header Name
      { wch: 40 }, // Description
      { wch: 15 }, // Effective Date
      { wch: 15 }, // Expiration Date
      { wch: 12 }, // Status
      { wch: 18 }, // Invoice Minimum
      { wch: 22 }, // Container 55G Minimum
      { wch: 25 }, // Absolute Container Minimum
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Price Headers Template");

    // Generate the Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Create response with appropriate headers
    const response = new NextResponse(excelBuffer);
    response.headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    response.headers.set(
      "Content-Disposition",
      "attachment; filename=pricing_headers_template.xlsx"
    );

    return response;
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate template",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
