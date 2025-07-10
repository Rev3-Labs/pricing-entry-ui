import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

interface CreatePricingItem {
  productName: string;
  region: string;
  unitPrice: number;
  minimumPrice: number;
  effectiveDate: string;
  expirationDate: string;
  status: "active" | "inactive" | "pending" | "draft";
  quoteName?: string;
  projectName?: string;
  uom?: string;
  contractId?: string;
  generatorId?: string;
  vendorId?: string;
  containerSize?: string;
  billingUom?: string;
  pricingType?: string;
  pricePriority?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const priceHeaderId = formData.get("priceHeaderId") as string;
    const pricingGroupName = formData.get("pricingGroupName") as string;
    const headerTemplate = formData.get("headerTemplate") as string;
    const customHeaderFields = formData.get("customHeaderFields") as string;

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

    if (!type || !["new", "addendum"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pricing type",
          errors: ["Pricing type must be 'new' or 'addendum'"],
        },
        { status: 400 }
      );
    }

    // Validate addendum-specific requirements
    if (type === "addendum" && !priceHeaderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Price header ID is required for addendum",
          errors: ["Price header ID is required"],
        },
        { status: 400 }
      );
    }

    // Validate new pricing-specific requirements
    if (type === "new" && !pricingGroupName) {
      return NextResponse.json(
        {
          success: false,
          message: "Pricing group name is required for new pricing",
          errors: ["Pricing group name is required"],
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
      "Product Name",
      "Region",
      "Unit Price",
      "Minimum Price",
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
    const processedData: CreatePricingItem[] = [];
    const errors: string[] = [];

    dataRows.forEach((row, index) => {
      try {
        // Create a map of column name to value
        const rowData: any = {};
        headers.forEach((header, colIndex) => {
          rowData[header] = row[colIndex];
        });

        // Validate and process the row
        const pricingItem: CreatePricingItem = {
          productName: String(rowData["Product Name"] || "").trim(),
          region: String(rowData["Region"] || "").trim(),
          unitPrice: Number(rowData["Unit Price"] || 0),
          minimumPrice: Number(rowData["Minimum Price"] || 0),
          effectiveDate: String(rowData["Effective Date"] || "").trim(),
          expirationDate: String(rowData["Expiration Date"] || "").trim(),
          status: String(rowData["Status"] || "")
            .toLowerCase()
            .trim() as any,
          quoteName: rowData["Quote Name"]
            ? String(rowData["Quote Name"]).trim()
            : undefined,
          projectName: rowData["Project Name"]
            ? String(rowData["Project Name"]).trim()
            : undefined,
          uom: rowData["UOM"] ? String(rowData["UOM"]).trim() : undefined,
          contractId: rowData["Contract ID"]
            ? String(rowData["Contract ID"]).trim()
            : undefined,
          generatorId: rowData["Generator ID"]
            ? String(rowData["Generator ID"]).trim()
            : undefined,
          vendorId: rowData["Vendor ID"]
            ? String(rowData["Vendor ID"]).trim()
            : undefined,
          containerSize: rowData["Container Size"]
            ? String(rowData["Container Size"]).trim()
            : undefined,
          billingUom: rowData["Billing UOM"]
            ? String(rowData["Billing UOM"]).trim()
            : undefined,
          pricingType: rowData["Pricing Type"]
            ? String(rowData["Pricing Type"]).trim()
            : undefined,
          pricePriority: rowData["Price Priority"]
            ? String(rowData["Price Priority"]).trim()
            : undefined,
        };

        // Validate required fields
        if (!pricingItem.productName) {
          errors.push(`Row ${index + 2}: Product Name is required`);
          return;
        }

        if (!pricingItem.region) {
          errors.push(`Row ${index + 2}: Region is required`);
          return;
        }

        if (!pricingItem.unitPrice || pricingItem.unitPrice <= 0) {
          errors.push(`Row ${index + 2}: Unit Price must be greater than 0`);
          return;
        }

        if (!pricingItem.minimumPrice || pricingItem.minimumPrice <= 0) {
          errors.push(`Row ${index + 2}: Minimum Price must be greater than 0`);
          return;
        }

        if (!pricingItem.effectiveDate) {
          errors.push(`Row ${index + 2}: Effective Date is required`);
          return;
        }

        if (!pricingItem.expirationDate) {
          errors.push(`Row ${index + 2}: Expiration Date is required`);
          return;
        }

        if (!pricingItem.status) {
          errors.push(`Row ${index + 2}: Status is required`);
          return;
        }

        // Validate status values
        const validStatuses = ["active", "inactive", "pending", "draft"];
        if (!validStatuses.includes(pricingItem.status)) {
          errors.push(
            `Row ${index + 2}: Status must be one of: ${validStatuses.join(
              ", "
            )}`
          );
          return;
        }

        // Validate dates
        const effectiveDate = new Date(pricingItem.effectiveDate);
        const expirationDate = new Date(pricingItem.expirationDate);

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

        processedData.push(pricingItem);
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
    console.log(`Creating ${type} pricing for customer ${params.customerId}:`, {
      type,
      customerId: params.customerId,
      priceHeaderId: type === "addendum" ? priceHeaderId : undefined,
      pricingGroupName: type === "new" ? pricingGroupName : undefined,
      headerTemplate: type === "new" ? headerTemplate : undefined,
      customHeaderFields: type === "new" ? customHeaderFields : undefined,
      itemCount: processedData.length,
      items: processedData,
    });

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const actionType = type === "new" ? "created" : "added as addendum";
    const responseData: any = {
      type,
      customerId: params.customerId,
      itemCount: processedData.length,
      items: processedData,
    };

    if (type === "addendum") {
      responseData.priceHeaderId = priceHeaderId;
    } else {
      responseData.pricingGroupName = pricingGroupName;
      responseData.headerTemplate = headerTemplate;
      if (customHeaderFields) {
        try {
          responseData.customHeaderFields = JSON.parse(customHeaderFields);
        } catch (e) {
          // Ignore parsing errors for custom header fields
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${actionType} ${processedData.length} pricing items for customer ${params.customerId}`,
      data: responseData,
    });
  } catch (error) {
    console.error("Create pricing error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process create pricing request",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}
