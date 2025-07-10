import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

interface ImportPriceHeader {
  headerName: string;
  description?: string;
  effectiveDate: string;
  expirationDate: string;
  status: "active" | "inactive" | "pending" | "draft";
  invoiceMinimum?: number;
  container55gMinimum?: number;
  absoluteContainerMinimum?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided",
          errors: ["File is required"],
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type",
          errors: ["Only Excel files (.xlsx, .xls) are allowed"],
        },
        { status: 400 }
      );
    }

    // Read the file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (rawData.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file format",
          errors: ["File must contain at least a header row and one data row"],
        },
        { status: 400 }
      );
    }

    // Extract headers and data
    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1) as any[][];

    // Validate required columns
    const requiredColumns = [
      "Header Name",
      "Effective Date",
      "Expiration Date",
      "Status",
    ];
    const missingColumns = requiredColumns.filter(
      (col) =>
        !headers.some((header) =>
          header.toLowerCase().includes(col.toLowerCase())
        )
    );

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required columns",
          errors: [`Missing required columns: ${missingColumns.join(", ")}`],
        },
        { status: 400 }
      );
    }

    // Process data rows
    const processedData: ImportPriceHeader[] = [];
    const errors: string[] = [];

    dataRows.forEach((row, index) => {
      try {
        // Create a map of column name to value
        const rowData: any = {};
        headers.forEach((header, colIndex) => {
          rowData[header] = row[colIndex];
        });

        // Validate and process the row
        const priceHeader: ImportPriceHeader = {
          headerName: String(rowData["Header Name"] || "").trim(),
          description: rowData["Description"]
            ? String(rowData["Description"]).trim()
            : undefined,
          effectiveDate: String(rowData["Effective Date"] || "").trim(),
          expirationDate: String(rowData["Expiration Date"] || "").trim(),
          status: String(rowData["Status"] || "")
            .toLowerCase()
            .trim() as any,
          invoiceMinimum: rowData["Invoice Minimum"]
            ? Number(rowData["Invoice Minimum"])
            : undefined,
          container55gMinimum: rowData["Container 55G Minimum"]
            ? Number(rowData["Container 55G Minimum"])
            : undefined,
          absoluteContainerMinimum: rowData["Absolute Container Minimum"]
            ? Number(rowData["Absolute Container Minimum"])
            : undefined,
        };

        // Validate required fields
        if (!priceHeader.headerName) {
          errors.push(`Row ${index + 2}: Header Name is required`);
          return;
        }

        if (!priceHeader.effectiveDate) {
          errors.push(`Row ${index + 2}: Effective Date is required`);
          return;
        }

        if (!priceHeader.expirationDate) {
          errors.push(`Row ${index + 2}: Expiration Date is required`);
          return;
        }

        if (!priceHeader.status) {
          errors.push(`Row ${index + 2}: Status is required`);
          return;
        }

        // Validate status values
        const validStatuses = ["active", "inactive", "pending", "draft"];
        if (!validStatuses.includes(priceHeader.status)) {
          errors.push(
            `Row ${index + 2}: Status must be one of: ${validStatuses.join(
              ", "
            )}`
          );
          return;
        }

        // Validate dates
        const effectiveDate = new Date(priceHeader.effectiveDate);
        const expirationDate = new Date(priceHeader.expirationDate);

        if (isNaN(effectiveDate.getTime())) {
          errors.push(`Row ${index + 2}: Invalid Effective Date format`);
          return;
        }

        if (isNaN(expirationDate.getTime())) {
          errors.push(`Row ${index + 2}: Invalid Expiration Date format`);
          return;
        }

        if (effectiveDate >= expirationDate) {
          errors.push(
            `Row ${index + 2}: Expiration Date must be after Effective Date`
          );
          return;
        }

        // Validate numeric fields
        if (
          priceHeader.invoiceMinimum !== undefined &&
          isNaN(priceHeader.invoiceMinimum)
        ) {
          errors.push(`Row ${index + 2}: Invalid Invoice Minimum value`);
          return;
        }

        if (
          priceHeader.container55gMinimum !== undefined &&
          isNaN(priceHeader.container55gMinimum)
        ) {
          errors.push(`Row ${index + 2}: Invalid Container 55G Minimum value`);
          return;
        }

        if (
          priceHeader.absoluteContainerMinimum !== undefined &&
          isNaN(priceHeader.absoluteContainerMinimum)
        ) {
          errors.push(
            `Row ${index + 2}: Invalid Absolute Container Minimum value`
          );
          return;
        }

        processedData.push(priceHeader);
      } catch (error) {
        errors.push(
          `Row ${index + 2}: Error processing row - ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation errors found",
          errors,
        },
        { status: 400 }
      );
    }

    // Simulate saving to database
    // In a real implementation, you would save to your database here
    console.log(
      `Importing ${processedData.length} price headers for customer ${params.customerId}:`,
      processedData
    );

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${processedData.length} price headers for customer ${params.customerId}`,
      data: {
        importedCount: processedData.length,
        customerId: params.customerId,
        priceHeaders: processedData,
      },
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process import",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}
